import type { CatalogItemsById } from "../../domains/catalog/catalogItem";
import type { PrintQueue } from "../../domains/printQueue/printQueue";
import { buildPrintTagRenderQueue } from "../../domains/printTagRendering/printTagRendering";
import PrintTag from "./PrintTag";

type PrintTagRendererProps = {
  catalogItems: CatalogItemsById;
  printQueue: PrintQueue;
};

const PrintTagRenderer = ({ catalogItems, printQueue }: PrintTagRendererProps) => (
  <>
    {buildPrintTagRenderQueue(catalogItems, printQueue).map(({ key, item }) => (
      <PrintTag key={key} item={item} />
    ))}
  </>
);

export default PrintTagRenderer;
