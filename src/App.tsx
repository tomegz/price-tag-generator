import { useCallback, useState } from "react";
import "./App.css";

import AppHeader from "./app/AppHeader";
import AppShell from "./app/AppShell";
import type { AppMode } from "./app/appMode";
import PrintTagRenderer from "./components/PrintTagRenderer";
import LoginScreen from "./features/auth/LoginScreen";
import { useAuthSession } from "./features/auth/useAuthSession";
import BulkPromotionModal from "./features/bulkPromotion/BulkPromotionModal";
import { useBulkPromotionActions } from "./features/bulkPromotion/useBulkPromotionActions";
import CatalogAdminScreen from "./features/catalog/CatalogAdminScreen";
import { getUserInitials } from "./features/catalog/catalogViewModel";
import ProductList from "./features/catalog/ProductList";
import { useCatalog } from "./features/catalog/useCatalog";
import { useCatalogMutations } from "./features/catalog/useCatalogMutations";
import PrintQueuePanel from "./features/printQueue/PrintQueuePanel";
import { usePrintQueue } from "./features/printQueue/usePrintQueue";
import { authService, catalogRepository } from "./services/firebase";

function App() {
  const [bulkPromotionOpen, setBulkPromotionOpen] = useState(false);
  const [mode, setMode] = useState<AppMode>("print");
  const {
    authError,
    authLoading,
    currentUser,
    login,
    logout
  } = useAuthSession(authService);
  const {
    brands,
    catalogError,
    catalogItems,
    catalogLoading,
    handleCatalogError,
    products,
    setCatalogItems
  } = useCatalog(currentUser, catalogRepository);
  const {
    addToPrintQueue,
    clearPrintQueue,
    printQueue,
    removeFromPrintQueue,
    setPrintQueueQuantity
  } = usePrintQueue(currentUser, localStorage);
  const {
    addCatalogItem,
    removeCatalogItem,
    updateCatalogItem
  } = useCatalogMutations({
    handleCatalogError,
    onCatalogItemRemoved: removeFromPrintQueue,
    repository: catalogRepository,
    setCatalogItems
  });
  const { applyPromotionToItems } = useBulkPromotionActions({
    catalogItems,
    handleCatalogError,
    repository: catalogRepository,
    setCatalogItems
  });

  const handleLogout = useCallback(async () => {
    await logout();
    setMode("print");
    setBulkPromotionOpen(false);
  }, [logout]);

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
    <AppShell printTags={<PrintTagRenderer catalogItems={catalogItems} printQueue={printQueue} />}>
      {mode === "print" ? (
        <>
          <AppHeader
            onEditCatalog={() => setMode("admin")}
            onLogout={handleLogout}
            userEmail={currentUser.email || ""}
            userInitials={getUserInitials(currentUser)}
          />

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
    </AppShell>
  );
}

export default App;
