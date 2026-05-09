import React, { Component } from 'react';
import PropTypes from "prop-types";

import { getPrintQueueTotal } from "../domains/printQueue/printQueue";
import "../styles/PrintQueue.css";

class PrintQueue extends Component {
  constructor() {
    super();
    this.renderPrintQueueItem = this.renderPrintQueueItem.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }
  componentDidMount() {
    setTimeout(this.scrollToBottom, 500);
  }
  componentDidUpdate() {
    setTimeout(this.scrollToBottom, 500);
  }
  scrollToBottom() {
    const list = this._printQueueList;
    list.scrollTop = list.scrollHeight - list.clientHeight;
  }
  renderPrintQueueItem(key) {
    const { catalogItems, printQueue, removeFromPrintQueue } = this.props;
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
  }
  render() {
    const { printQueue } = this.props;
    const printQueueIds = Object.keys(printQueue);
    const total = getPrintQueueTotal(printQueue);
    return (
      <div className="print-queue" ref={(c) => this._printQueueList = c}>
        <h2>Ceny do druku</h2>
        <ul className="print-queue-list">
          {printQueueIds.map(this.renderPrintQueueItem)}
        </ul>
        <button className="print-button" onClick={() => window.print()}><i className="fa fa-print fa-2x" /></button>
        <button className="remove-button" onClick={this.props.clearPrintQueue}><i className="fa fa-remove fa-2x" /></button>
        <p className="total"><strong>Ilość cen do druku: </strong>{total}</p>
      </div>
    );
  }
}

PrintQueue.propTypes = {
  catalogItems: PropTypes.object.isRequired,
  printQueue: PropTypes.object.isRequired,
  removeFromPrintQueue: PropTypes.func.isRequired,
  clearPrintQueue: PropTypes.func.isRequired
}

export default PrintQueue;
