import type { CatalogItemInput } from "../domains/catalog/catalogItem";
import type { CatalogProduct } from "../domains/catalog/catalogProduct";
import type { BulkPromotionOptions } from "../domains/pricing/bulkPromotion";
import CatalogAdminScreen from "../features/catalog/CatalogAdminScreen";

type CatalogAdminRouteProps = {
  brands: string[];
  catalogError: string;
  products: CatalogProduct[];
  onAddProduct(item: CatalogItemInput): Promise<void>;
  onApplyBulkPromotion(productIds: string[], options: BulkPromotionOptions): Promise<void>;
  onBackToPrint(): void;
  onDeleteProduct(productId: string): Promise<void>;
  onDeleteProducts(productIds: string[]): Promise<void>;
  onUpdateProduct(productId: string, item: CatalogItemInput): Promise<void>;
};

const CatalogAdminRoute = ({
  brands,
  catalogError,
  onAddProduct,
  onApplyBulkPromotion,
  onBackToPrint,
  onDeleteProduct,
  onDeleteProducts,
  onUpdateProduct,
  products
}: CatalogAdminRouteProps) => (
  <CatalogAdminScreen
    brands={brands}
    catalogError={catalogError}
    onAddProduct={onAddProduct}
    onApplyBulkPromotion={onApplyBulkPromotion}
    onBackToPrint={onBackToPrint}
    onDeleteProduct={onDeleteProduct}
    onDeleteProducts={onDeleteProducts}
    onUpdateProduct={onUpdateProduct}
    products={products}
  />
);

export default CatalogAdminRoute;
