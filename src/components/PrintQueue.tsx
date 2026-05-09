import { useEffect, useRef, type ReactNode } from 'react';

import { getPrintQueueTotal } from "../domains/printQueue/printQueue";
import type { CatalogItemsById } from "../domains/catalog/catalog";
import type { PrintQueue as PrintQueueState } from "../domains/printQueue/printQueue";
import "../styles/PrintQueue.css";

type PrintQueueProps = {
  catalogItems: CatalogItemsById;
  printQueue: PrintQueueState;
  removeFromPrintQueue(itemId: string): void;
  clearPrintQueue(): void;
};

const PrintQueue = ({
  catalogItems,
  printQueue,
  removeFromPrintQueue,
  clearPrintQueue
}: PrintQueueProps) => {
  const printQueueList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const list = printQueueList.current;
      if (!list) return;
      list.scrollTop = list.scrollHeight - list.clientHeight;
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  });

  const renderPrintQueueItem = (key: string): ReactNode => {
    const item = catalogItems[key];
    const count = printQueue[key];
    const removeButton = <button onClick={() => removeFromPrintQueue(key)}>&times;</button>;
    if(!item) {
      return <li key={key}>Cena tego produktu nie jest już dostępna do druku {removeButton}</li>;
    }
    return (
      <li key={key}>
        <span>
          <strong>
            <span className="count">{count}szt. </span>
          </strong> 
         {item.name} {item.model}
        </span>
        {removeButton}
      </li>
    );
  };

  const printQueueIds = Object.keys(printQueue);
  const total = getPrintQueueTotal(printQueue);
  return (
    <div className="print-queue" ref={printQueueList}>
      <h2>Ceny do druku</h2>
      <ul className="print-queue-list">
        {printQueueIds.map(renderPrintQueueItem)}
      </ul>
      <button className="print-button" onClick={() => window.print()}><i className="fa fa-print fa-2x" /></button>
      <button className="remove-button" onClick={clearPrintQueue}><i className="fa fa-remove fa-2x" /></button>
      <p className="total"><strong>Ilość cen do druku: </strong>{total}</p>
    </div>
  );
};

export default PrintQueue;
