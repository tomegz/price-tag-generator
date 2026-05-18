import type { CatalogProduct } from "../domains/catalog/catalogProduct";
import type { PrintQueue } from "../domains/printQueue/printQueue";
import ProductList from "../features/catalog/ProductList";
import PrintQueuePanel from "../features/printQueue/PrintQueuePanel";
import AppHeader from "./AppHeader";
import "./PrintWorkflowScreen.css";

type PrintWorkflowScreenProps = {
  brands: string[];
  catalogError: string;
  catalogLoading: boolean;
  printQueue: PrintQueue;
  products: CatalogProduct[];
  userEmail: string;
  userInitials: string;
  onAddToPrintQueue(productId: string, quantity: number): void;
  onClearPrintQueue(): void;
  onEditCatalog(): void;
  onLogout(): void | Promise<void>;
  onPrint(): void;
  onRemoveFromPrintQueue(productId: string): void;
  onSetPrintQueueQuantity(productId: string, quantity: number): void;
};

const PrintWorkflowScreen = ({
  brands,
  catalogError,
  catalogLoading,
  onAddToPrintQueue,
  onClearPrintQueue,
  onEditCatalog,
  onLogout,
  onPrint,
  onRemoveFromPrintQueue,
  onSetPrintQueueQuantity,
  printQueue,
  products,
  userEmail,
  userInitials
}: PrintWorkflowScreenProps) => (
  <>
    <AppHeader
      onEditCatalog={onEditCatalog}
      onLogout={onLogout}
      userEmail={userEmail}
      userInitials={userInitials}
    />

    {catalogError ? <p className="app-error" role="alert">{catalogError}</p> : null}
    {catalogLoading ? <p className="app-loading-line pb-mono">Ładowanie katalogu...</p> : null}

    <main className="print-workflow">
      <ProductList
        brands={brands}
        onAdd={onAddToPrintQueue}
        printQueue={printQueue}
        products={products}
      />
      <PrintQueuePanel
        onClear={onClearPrintQueue}
        onPrint={onPrint}
        onRemove={onRemoveFromPrintQueue}
        onSetQuantity={onSetPrintQueueQuantity}
        printQueue={printQueue}
        products={products}
      />
    </main>
  </>
);

export default PrintWorkflowScreen;
