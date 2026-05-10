import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import "./App.css";

import Button from "./design-system/Button";
import Icon from "./design-system/Icon";
import BulkPromotionModal from "./features/bulkPromotion/BulkPromotionModal";
import { applyBulkPromotion } from "./features/bulkPromotion/bulkPromotion";
import CatalogAdminScreen from "./features/catalog/CatalogAdminScreen";
import ProductList from "./features/catalog/ProductList";
import {
  catalogItemsToProducts,
  getCatalogBrands,
  getUserInitials
} from "./features/catalog/catalogViewModel";
import LoginScreen from "./features/auth/LoginScreen";
import PrintQueuePanel from "./features/printQueue/PrintQueuePanel";
import PrintTag from "./components/PrintTag";
import type {
  CatalogBrands,
  CatalogItemsById,
  LegacyCatalogItem
} from "./domains/catalog/catalog";
import {
  addToPrintQueue as addToPrintQueueState,
  clearPrintQueue as clearPrintQueueState,
  removeFromPrintQueue as removeFromPrintQueueState,
  type PrintQueue as PrintQueueState
} from "./domains/printQueue/printQueue";
import {
  loadPrintQueueFromStorage,
  savePrintQueueToStorage
} from "./domains/storage/printQueueStorage";
import { buildPrintTagRenderQueue } from "./domains/printTagRendering/printTagRendering";
import {
  authService,
  catalogRepository,
  isPermissionDenied,
  toFirebaseRepositoryError,
  type FirebaseRepositoryError
} from "./services/firebase";
import type { BulkPromotionOptions } from "./features/bulkPromotion/bulkPromotion";

type AppMode = "print" | "admin";

function App() {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [bulkPromotionOpen, setBulkPromotionOpen] = useState(false);
  const [catalogBrands, setCatalogBrands] = useState<CatalogBrands>([]);
  const [catalogError, setCatalogError] = useState("");
  const [catalogItems, setCatalogItems] = useState<CatalogItemsById>({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mode, setMode] = useState<AppMode>("print");
  const [printQueue, setPrintQueue] = useState<PrintQueueState>({});
  const shouldPersistPrintQueueRef = useRef(false);

  const handleCatalogError = useCallback((error: FirebaseRepositoryError) => {
    const message = isPermissionDenied(error)
      ? "Brak dostępu do katalogu. Zalogowany użytkownik nie ma uprawnień do tej bazy."
      : "Nie udało się zapisać lub pobrać danych katalogu.";
    setCatalogError(message);
    setCatalogLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = authService.observeAuth(user => {
      setCurrentUser(user);
      setAuthLoading(false);
      setAuthError("");
      if (user) {
        setCatalogLoading(true);
        shouldPersistPrintQueueRef.current = true;
        setPrintQueue(loadPrintQueueFromStorage(localStorage));
      } else {
        setCatalogItems({});
        setCatalogBrands([]);
        setCatalogError("");
        setCatalogLoading(false);
        shouldPersistPrintQueueRef.current = false;
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeItems = catalogRepository.subscribeCatalogItems({
      next: items => {
        setCatalogItems(items);
        setCatalogError("");
        setCatalogLoading(false);
      },
      error: handleCatalogError
    });

    const unsubscribeBrands = catalogRepository.subscribeCatalogBrands({
      next: brands => setCatalogBrands(brands),
      error: handleCatalogError
    });

    return () => {
      unsubscribeItems();
      unsubscribeBrands();
    };
  }, [currentUser, handleCatalogError]);

  useEffect(() => {
    if (!shouldPersistPrintQueueRef.current) return;
    savePrintQueueToStorage(localStorage, printQueue);
  }, [printQueue]);

  const products = useMemo(() => catalogItemsToProducts(catalogItems), [catalogItems]);
  const brands = useMemo(() => getCatalogBrands(products, catalogBrands), [catalogBrands, products]);
  const userInitials = useMemo(() => getUserInitials(currentUser), [currentUser]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError("");
    try {
      await authService.signIn(email, password);
    } catch (error) {
      setAuthError("Nieprawidłowy email lub hasło.");
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.signOut();
    setMode("print");
    setBulkPromotionOpen(false);
  }, []);

  const addCatalogItem = useCallback(async (item: LegacyCatalogItem) => {
    const key = `item${Date.now()}`;
    try {
      await catalogRepository.saveCatalogItem(key, item);
      setCatalogItems(currentItems => ({
        ...currentItems,
        [key]: item
      }));
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError]);

  const updateCatalogItem = useCallback(async (key: string, updatedItem: LegacyCatalogItem) => {
    try {
      await catalogRepository.saveCatalogItem(key, updatedItem);
      setCatalogItems(currentItems => ({
        ...currentItems,
        [key]: updatedItem
      }));
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError]);

  const removeCatalogItem = useCallback(async (id: string) => {
    try {
      await catalogRepository.deleteCatalogItem(id);
      setCatalogItems(currentItems => {
        const next = { ...currentItems };
        delete next[id];
        return next;
      });
      setPrintQueue(currentQueue => removeFromPrintQueueState(currentQueue, id));
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError]);

  const addToPrintQueue = useCallback((key: string, count: number) => {
    setPrintQueue(currentQueue => addToPrintQueueState(currentQueue, key, count));
  }, []);

  const setPrintQueueQuantity = useCallback((key: string, quantity: number) => {
    setPrintQueue(currentQueue => {
      if (quantity <= 0) return removeFromPrintQueueState(currentQueue, key);
      return {
        ...currentQueue,
        [key]: Math.floor(quantity)
      };
    });
  }, []);

  const removeFromPrintQueue = useCallback((key: string) => {
    setPrintQueue(currentQueue => removeFromPrintQueueState(currentQueue, key));
  }, []);

  const clearPrintQueue = useCallback(() => {
    setPrintQueue(clearPrintQueueState());
  }, []);

  const applyPromotionToItems = useCallback(async (
    productIds: string[],
    options: BulkPromotionOptions
  ) => {
    const updates = productIds.flatMap(productId => {
      const item = catalogItems[productId];
      return item ? [{ productId, item: applyBulkPromotion(item, options) }] : [];
    });

    try {
      await Promise.all(
        updates.map(({ productId, item }) => catalogRepository.saveCatalogItem(productId, item))
      );

      setCatalogItems(currentItems => {
        const next = { ...currentItems };
        updates.forEach(({ productId, item }) => {
          next[productId] = item;
        });
        return next;
      });
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [catalogItems, handleCatalogError]);

  const printTags = useMemo(
    () => buildPrintTagRenderQueue(catalogItems, printQueue)
      .map(({ key, item }) => <PrintTag key={key} item={item} />),
    [catalogItems, printQueue]
  );

  if (authLoading) {
    return (
      <div className="app-loading">
        <span className="pb-mono">PROFI BIKE</span>
        <strong>Ładowanie aplikacji...</strong>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen error={authError} loading={authLoading} onLogin={login} />;
  }

  return (
    <div className="redesign-app">
      {mode === "print" ? (
        <>
          <header className="app-shell-header">
            <div className="app-shell-header__brand">
              <Icon name="bike" size={23} />
              <strong>Profi Bike</strong>
              <span className="pb-mono">CENNIK</span>
            </div>
            <div className="app-shell-header__spacer" />
            <Button icon="pencil" onClick={() => setMode("admin")} variant="ghost">
              Edycja cennika
            </Button>
            <Button aria-label="Wyloguj" icon="logout" onClick={() => void logout()} variant="icon" />
            <div aria-label={`Zalogowany użytkownik ${currentUser.email || ""}`} className="user-avatar pb-mono">
              {userInitials}
            </div>
          </header>

          {catalogError ? <p className="app-error" role="alert">{catalogError}</p> : null}
          {catalogLoading ? <p className="app-loading-line pb-mono">Ładowanie katalogu...</p> : null}

          <main className="print-workflow">
            <ProductList
              brands={brands}
              onAdd={addToPrintQueue}
              printQueue={printQueue}
              products={products}
            />
            <PrintQueuePanel
              onClear={clearPrintQueue}
              onPrint={() => window.print()}
              onRemove={removeFromPrintQueue}
              onSetQuantity={setPrintQueueQuantity}
              printQueue={printQueue}
              products={products}
            />
          </main>
        </>
      ) : (
        <CatalogAdminScreen
          brands={brands}
          catalogError={catalogError}
          onAddProduct={addCatalogItem}
          onBackToPrint={() => setMode("print")}
          onDeleteProduct={removeCatalogItem}
          onOpenBulkPromotion={() => setBulkPromotionOpen(true)}
          onUpdateProduct={updateCatalogItem}
          products={products}
        />
      )}

      {bulkPromotionOpen ? (
        <BulkPromotionModal
          brands={brands}
          onApply={applyPromotionToItems}
          onClose={() => setBulkPromotionOpen(false)}
          products={products}
        />
      ) : null}

      <div className="print-tag-rendering">
        {printTags}
      </div>
    </div>
  );
}

export default App;
