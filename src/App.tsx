import { useCallback, useEffect, useState } from "react";
import "./App.css";

import AppHeader from "./app/AppHeader";
import AppShell from "./app/AppShell";
import type { AppMode } from "./app/appMode";
import PrintTagRenderer from "./components/PrintTagRenderer";
import LoginScreen from "./features/auth/LoginScreen";
import { useAuthSession } from "./features/auth/useAuthSession";
import { useBulkPromotionActions } from "./features/bulkPromotion/useBulkPromotionActions";
import CatalogAdminScreen from "./features/catalog/CatalogAdminScreen";
import { getUserInitials } from "./domains/auth/authUser";
import ProductList from "./features/catalog/ProductList";
import { useCatalog } from "./features/catalog/useCatalog";
import { useCatalogMutations } from "./features/catalog/useCatalogMutations";
import PrintQueuePanel from "./features/printQueue/PrintQueuePanel";
import { usePrintQueue } from "./features/printQueue/usePrintQueue";
import type { AuthService, CatalogRepository } from "./services/firebase";
import { authService, catalogRepository } from "./services/firebase/runtime";
import type { StorageLike } from "./domains/storage/printQueueStorage";
import {
  observability as defaultObservability,
  type ObservabilityService,
  workflowTelemetry
} from "./services/observability";

type AppProps = {
  auth?: AuthService;
  catalog?: CatalogRepository;
  observability?: ObservabilityService;
  print?: () => void;
  storage?: StorageLike;
};

function App({
  auth = authService,
  catalog = catalogRepository,
  observability = defaultObservability,
  print = () => window.print(),
  storage = localStorage
}: AppProps = {}) {
  const [mode, setMode] = useState<AppMode>("print");
  const {
    authError,
    authLoading,
    currentUser,
    login,
    logout
  } = useAuthSession(auth, observability);
  const {
    brands,
    catalogError,
    catalogItems,
    catalogLoading,
    handleCatalogError,
    products
  } = useCatalog(currentUser, catalog, observability);
  const {
    addToPrintQueue,
    clearPrintQueue,
    printQueue,
    removeFromPrintQueue,
    setPrintQueueQuantity
  } = usePrintQueue(currentUser, storage, observability);
  const {
    addCatalogItem,
    removeCatalogItem,
    removeCatalogItems,
    updateCatalogItem
  } = useCatalogMutations({
    handleCatalogError,
    onCatalogItemRemoved: removeFromPrintQueue,
    observability,
    repository: catalog
  });
  const { applyPromotionToItems } = useBulkPromotionActions({
    catalogItems,
    handleCatalogError,
    observability,
    repository: catalog
  });

  const handleLogout = useCallback(async () => {
    await logout();
    setMode("print");
  }, [logout]);

  const handlePrint = useCallback(() => {
    workflowTelemetry.trackPrintStarted(observability, printQueue);
    print();
  }, [observability, print, printQueue]);

  useEffect(() => {
    if (!currentUser) return;
    workflowTelemetry.trackScreenView(observability, mode);
  }, [currentUser, mode, observability]);

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
              onPrint={handlePrint}
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
          onApplyBulkPromotion={applyPromotionToItems}
          onBackToPrint={() => setMode("print")}
          onDeleteProduct={removeCatalogItem}
          onDeleteProducts={removeCatalogItems}
          onUpdateProduct={updateCatalogItem}
          products={products}
        />
      )}
    </AppShell>
  );
}

export default App;
