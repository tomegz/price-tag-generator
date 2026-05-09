import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import CatalogMenu from "./components/CatalogMenu";
import PrintQueue from "./components/PrintQueue";
import Catalog from "./components/Catalog";
import PrintTag from "./components/PrintTag";

import formatPrice from "./helpers/formatPrice";
import { filterCatalogItemIds } from "./domains/catalog/catalog";
import {
  addToPrintQueue as addToPrintQueueState,
  clearPrintQueue as clearPrintQueueState,
  removeFromPrintQueue as removeFromPrintQueueState
} from "./domains/printQueue/printQueue";
import {
  loadPrintQueueFromStorage,
  savePrintQueueToStorage
} from "./domains/storage/printQueueStorage";
import { buildPrintTagRenderQueue } from "./domains/printTagRendering/printTagRendering";
import {
  catalogRepository,
  isPermissionDenied
} from "./services/firebase";


class App extends Component {
  constructor() {
    super();
    this.addCatalogItem = this.addCatalogItem.bind(this);
    this.enqueuePrintTags = this.enqueuePrintTags.bind(this);
    this.addPromotion = this.addPromotion.bind(this);
    this.removeFromPrintQueue = this.removeFromPrintQueue.bind(this);
    this.clearPrintQueue = this.clearPrintQueue.bind(this);
    this.updateCatalogItem = this.updateCatalogItem.bind(this);
    this.removeCatalogItem = this.removeCatalogItem.bind(this);
    this.getVisibleCatalogItemIds = this.getVisibleCatalogItemIds.bind(this);
    this.setSearchQuery = this.setSearchQuery.bind(this);
    this.getCatalogItems = this.getCatalogItems.bind(this);
    this.connectCatalogForUser = this.connectCatalogForUser.bind(this);
    this.removeBinding = this.removeBinding.bind(this);
    this.handleCatalogError = this.handleCatalogError.bind(this);
    this.state = {
      catalogItems: {},
      printQueue: {},
      searchQuery: "",
      catalogError: ""
    };
  }
  getCatalogItems() {
    if(this.ref) return;
    /* Since there's only one store, it is hardcoded for now */
    this.ref = catalogRepository.subscribeCatalogItems({
      next: (catalogItems) => {
        this.setState({ catalogItems, catalogError: "" });
      },
      error: (error) => {
        this.ref = null;
        this.handleCatalogError(error);
      }
    });

    this.setState({
      printQueue: loadPrintQueueFromStorage(localStorage)
    });
  }
  connectCatalogForUser(user) {
    if(user) {
      this.getCatalogItems();
    }
  }
  componentWillUnmount() {
    this.removeBinding();
  }
  componentDidUpdate(prevProps, prevState) {
    if(prevState.printQueue === this.state.printQueue) return;
    savePrintQueueToStorage(localStorage, this.state.printQueue);
  }
  addCatalogItem(item) {
    const catalogItems = {...this.state.catalogItems};
    const timestamp = Date.now();
    const key = `item${timestamp}`;
    catalogItems[key] = item;
    this.setState({ catalogItems });
    catalogRepository.saveCatalogItem(key, item).catch(this.handleCatalogError);
  }
  updateCatalogItem(key, updatedItem) {
    const catalogItems = {...this.state.catalogItems};
    catalogItems[key] = updatedItem;
    this.setState({ catalogItems });
    catalogRepository.saveCatalogItem(key, updatedItem).catch(this.handleCatalogError);
  }
  removeCatalogItem(id) {
    catalogRepository.deleteCatalogItem(id).catch(this.handleCatalogError);
  }
  getVisibleCatalogItemIds() {
    const { catalogItems, searchQuery } = this.state;
    return filterCatalogItemIds(catalogItems, searchQuery);
  }
  setSearchQuery(text) {
    const searchQuery = text.toLowerCase();
    this.setState({ searchQuery });
  }
  enqueuePrintTags(key, c) {
    this.setState({
      printQueue: addToPrintQueueState(this.state.printQueue, key, c)
    });
  }
  addPromotion(options) {
    /* Update every visible catalog item without deleting unrelated records. */
    const keys = this.getVisibleCatalogItemIds();
    keys.forEach(key => {
      const item = this.state.catalogItems[key];
      const updatedItem = {
        ...item,
        discountPrice: formatPrice(item.price, options)
      };
      this.updateCatalogItem(key, updatedItem);
    });
  }
  removeFromPrintQueue(key) {
    this.setState({
      printQueue: removeFromPrintQueueState(this.state.printQueue, key)
    });
  }
  clearPrintQueue() {
    this.setState({ printQueue: clearPrintQueueState() });
  }
  handleCatalogError(error) {
    const catalogError = isPermissionDenied(error)
      ? "Brak dostępu do katalogu. Zalogowany użytkownik nie ma uprawnień do tej bazy."
      : "Nie udało się zapisać lub pobrać danych katalogu.";
    this.setState({ catalogError });
  }
  removeBinding() {
    if(this.ref) {
      this.ref();
      this.ref = null;
    }
  }
  render() {
    const { catalogItems, printQueue, searchQuery, catalogError } = this.state;
    const catalogItemIds = this.getVisibleCatalogItemIds();
    const printTags = buildPrintTagRenderQueue(catalogItems, printQueue)
      .map(({ key, item }) => <PrintTag key={key} item={item} />);
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Profi Bike - Drukowanie cen</h2>
        </div>
        <div className="wrapper">
          <CatalogMenu catalogItems={catalogItems}
                       catalogItemIds={catalogItemIds}
                       searchQuery={searchQuery}
                       enqueuePrintTags={this.enqueuePrintTags}
                       setSearchQuery={this.setSearchQuery}
                       removeCatalogItem={this.removeCatalogItem} />
          <PrintQueue catalogItems={catalogItems}
                      printQueue={printQueue}
                      removeFromPrintQueue={this.removeFromPrintQueue}
                      clearPrintQueue={this.clearPrintQueue} />
          <Catalog catalogItems={catalogItems}
                   catalogItemIds={catalogItemIds}
                   searchQuery={searchQuery}
                   addCatalogItem={this.addCatalogItem}
                   updateCatalogItem={this.updateCatalogItem}
                   addPromotion={this.addPromotion}
                   catalogError={catalogError}
                   connectCatalogForUser={this.connectCatalogForUser}
                   removeBinding={this.removeBinding} />
        </div>
        <footer className="App-footer"></footer>
        <div className="print-tag-rendering">
          {printTags}
        </div>
      </div>
    );
  }
}

export default App;
