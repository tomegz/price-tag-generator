import { useCallback, useEffect, useState } from "react";

import CatalogAdminRoute from "./app/CatalogAdminRoute";
import AppShell from "./app/AppShell";
import PrintWorkflowScreen from "./app/PrintWorkflowScreen";
import type { AppMode } from "./app/appMode";
import PrintTagRenderer from "./features/printTags/PrintTagRenderer";
import LoginScreen from "./features/auth/LoginScreen";
import { useAuthSession } from "./features/auth/useAuthSession";
import { useBulkPromotionActions } from "./features/bulkPromotion/useBulkPromotionActions";
import { getUserInitials } from "./domains/auth/authUser";
import { useCatalog } from "./features/catalog/useCatalog";
import { useCatalogMutations } from "./features/catalog/useCatalogMutations";
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
        <PrintWorkflowScreen
          brands={brands}
          catalogError={catalogError}
          catalogLoading={catalogLoading}
          onAddToPrintQueue={addToPrintQueue}
          onClearPrintQueue={clearPrintQueue}
          onEditCatalog={() => setMode("admin")}
          onLogout={handleLogout}
          onPrint={handlePrint}
          onRemoveFromPrintQueue={removeFromPrintQueue}
          onSetPrintQueueQuantity={setPrintQueueQuantity}
          printQueue={printQueue}
          products={products}
          userEmail={currentUser.email || ""}
          userInitials={getUserInitials(currentUser)}
        />
      ) : (
        <CatalogAdminRoute
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
