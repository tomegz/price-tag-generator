import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import CatalogMenu from "./components/CatalogMenu";
import PrintQueue from "./components/PrintQueue";
import Catalog from "./components/Catalog";
import PrintTag from "./components/PrintTag";

import formatPrice from "./helpers/formatPrice";
import {
  filterCatalogItemIds,
  type CatalogItemsById,
  type LegacyCatalogItem
} from "./domains/catalog/catalog";
import type { DiscountOptions } from "./domains/pricing/discount";
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
  catalogRepository,
  isPermissionDenied,
  type FirebaseRepositoryError
} from "./services/firebase";

function App() {
  const [catalogItems, setCatalogItems] = useState<CatalogItemsById>({});
  const [printQueue, setPrintQueue] = useState<PrintQueueState>({});
  const [searchQuery, setSearchQueryState] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const catalogUnsubscribeRef = useRef<(() => void) | null>(null);
  const shouldPersistPrintQueueRef = useRef(false);

  const handleCatalogError = useCallback((error: FirebaseRepositoryError) => {
    const message = isPermissionDenied(error)
      ? "Brak dostępu do katalogu. Zalogowany użytkownik nie ma uprawnień do tej bazy."
      : "Nie udało się zapisać lub pobrać danych katalogu.";
    setCatalogError(message);
  }, []);

  const removeBinding = useCallback(() => {
    if(catalogUnsubscribeRef.current) {
      catalogUnsubscribeRef.current();
      catalogUnsubscribeRef.current = null;
    }
  }, []);

  const getCatalogItems = useCallback(() => {
    if(catalogUnsubscribeRef.current) return;
    /* Since there's only one store, it is hardcoded for now */
    catalogUnsubscribeRef.current = catalogRepository.subscribeCatalogItems({
      next: (items) => {
        setCatalogItems(items);
        setCatalogError("");
      },
      error: (error) => {
        catalogUnsubscribeRef.current = null;
        handleCatalogError(error);
      }
    });

    shouldPersistPrintQueueRef.current = true;
    setPrintQueue(loadPrintQueueFromStorage(localStorage));
  }, [handleCatalogError]);

  const connectCatalogForUser = useCallback((user: string | null) => {
    if(user) {
      getCatalogItems();
    }
  }, [getCatalogItems]);

  useEffect(() => removeBinding, [removeBinding]);

  useEffect(() => {
    if(!shouldPersistPrintQueueRef.current) return;
    savePrintQueueToStorage(localStorage, printQueue);
  }, [printQueue]);

  const addCatalogItem = useCallback((item: LegacyCatalogItem) => {
    const timestamp = Date.now();
    const key = `item${timestamp}`;

    setCatalogItems(currentCatalogItems => ({
      ...currentCatalogItems,
      [key]: item
    }));
    catalogRepository.saveCatalogItem(key, item).catch(handleCatalogError);
  }, [handleCatalogError]);

  const updateCatalogItem = useCallback((key: string, updatedItem: LegacyCatalogItem) => {
    setCatalogItems(currentCatalogItems => ({
      ...currentCatalogItems,
      [key]: updatedItem
    }));
    catalogRepository.saveCatalogItem(key, updatedItem).catch(handleCatalogError);
  }, [handleCatalogError]);

  const removeCatalogItem = useCallback((id: string) => {
    catalogRepository.deleteCatalogItem(id).catch(handleCatalogError);
  }, [handleCatalogError]);

  const visibleCatalogItemIds = useMemo(
    () => filterCatalogItemIds(catalogItems, searchQuery),
    [catalogItems, searchQuery]
  );

  const setSearchQuery = useCallback((text: string) => {
    setSearchQueryState(text.toLowerCase());
  }, []);

  const enqueuePrintTags = useCallback((key: string, count: number) => {
    setPrintQueue(currentPrintQueue => addToPrintQueueState(currentPrintQueue, key, count));
  }, []);

  const addPromotion = useCallback((options: DiscountOptions) => {
    /* Update every visible catalog item without deleting unrelated records. */
    visibleCatalogItemIds.forEach(key => {
      const item = catalogItems[key];
      const updatedItem = {
        ...item,
        discountPrice: formatPrice(item.price, options)
      };
      updateCatalogItem(key, updatedItem);
    });
  }, [catalogItems, updateCatalogItem, visibleCatalogItemIds]);

  const removeFromPrintQueue = useCallback((key: string) => {
    setPrintQueue(currentPrintQueue => removeFromPrintQueueState(currentPrintQueue, key));
  }, []);

  const clearPrintQueue = useCallback(() => {
    setPrintQueue(clearPrintQueueState());
  }, []);

  const printTags = useMemo(
    () => buildPrintTagRenderQueue(catalogItems, printQueue)
      .map(({ key, item }) => <PrintTag key={key} item={item} />),
    [catalogItems, printQueue]
  );

  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Profi Bike - Drukowanie cen</h2>
      </div>
      <div className="wrapper">
        <CatalogMenu catalogItems={catalogItems}
                     catalogItemIds={visibleCatalogItemIds}
                     searchQuery={searchQuery}
                     enqueuePrintTags={enqueuePrintTags}
                     setSearchQuery={setSearchQuery}
                     removeCatalogItem={removeCatalogItem} />
        <PrintQueue catalogItems={catalogItems}
                    printQueue={printQueue}
                    removeFromPrintQueue={removeFromPrintQueue}
                    clearPrintQueue={clearPrintQueue} />
        <Catalog catalogItems={catalogItems}
                 catalogItemIds={visibleCatalogItemIds}
                 searchQuery={searchQuery}
                 addCatalogItem={addCatalogItem}
                 updateCatalogItem={updateCatalogItem}
                 addPromotion={addPromotion}
                 catalogError={catalogError}
                 connectCatalogForUser={connectCatalogForUser}
                 removeBinding={removeBinding} />
      </div>
      <footer className="App-footer"></footer>
      <div className="print-tag-rendering">
        {printTags}
      </div>
    </div>
  );
}

export default App;
