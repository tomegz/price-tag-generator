import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Menu from "./components/Menu";
import Order from "./components/Order";
import Inventory from "./components/Inventory";
import Pricetag from "./components/Pricetag";

import firebase from "firebase";
import base from "./base";


class App extends Component {
  constructor() {
    super();
    this.addItem = this.addItem.bind(this);
    this.addToOrder = this.addToOrder.bind(this);
    this.removeFromOrder = this.removeFromOrder.bind(this);
    this.removeWholeOrder = this.removeWholeOrder.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.setSearchQuery = this.setSearchQuery.bind(this);
    this.getItems = this.getItems.bind(this);
    this.authorize = this.authorize.bind(this);
    this.removeBinding = this.removeBinding.bind(this);
    this.state = {
      items: {},
      order: {},
      searchQuery: ""
    };
  }
  getItems() {
    /* Since there's only one store, it is hardcoded for now */
    const storeId = "profi-bike";
    this.ref = base.syncState(`${storeId}/items`, {
      context: this,
      state: "items"
    });

    const localStorageRef = localStorage.getItem(`order-${storeId}`);
    if(localStorageRef) {
      this.setState({
        order: JSON.parse(localStorageRef)
      });
    }

  }
  authorize(user) {
    firebase.database()
            .ref("profi-bike/owners")
            .once("value")
            .then((snapshot) => {
                const owners = snapshot.val();
                if(owners.includes(user)) {
                  this.getItems();
                }
            });
  }
  componentWillUnmount() {
    this.removeBinding();
  }
  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem(`order-profi-bike`, 
      JSON.stringify(nextState.order));
  }
  addItem(item) {
    const items = {...this.state.items};
    const timestamp = Date.now();
    items[`item${timestamp}`] = item;
    this.setState({ items });
  }
  updateItem(key, updatedItem) {
    const items = {...this.state.items};
    items[key] = updatedItem;
    this.setState({ items });
  }
  setSearchQuery(text) {
    const searchQuery = text.toLowerCase();
    this.setState({ searchQuery });
  }
  addToOrder(key, c) {
    if(typeof c !== "number" || c < 1) return;
    const count = Math.floor(c);
    const order = {...this.state.order};
    order[key] = order[key] + count || count;
    this.setState({ order });
  }
  removeFromOrder(key) {
    const order = {...this.state.order};
    delete order[key];
    this.setState({ order });
  }
  removeWholeOrder() {
    const order = {};
    this.setState({ order });
  }
  removeBinding() {
    base.removeBinding(this.ref);
  }
  render() {
    const { items, order, searchQuery } = this.state;
    const pricetags = [];
    Object.keys(order)
        .forEach(key => {
          for(var i=0; i<order[key]; i++) {
            pricetags.push(<Pricetag key={`${key}-${i}`} 
                                      details={items[key]} />);
          }
        });
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Profi Bike - Drukowanie cen</h2>
        </div>
        <div className="wrapper">
          <Menu items={items} 
                searchQuery={searchQuery}
                addToOrder={this.addToOrder}
                setSearchQuery={this.setSearchQuery} />
          <Order items={items} 
                 order={order}
                 removeFromOrder={this.removeFromOrder}
                 removeWholeOrder={this.removeWholeOrder} />
          <Inventory items={items} 
                     searchQuery={searchQuery}
                     addItem={this.addItem} 
                     updateItem={this.updateItem} 
                     /*storeId={this.props.match.params.storeId}*/
                     authorize={this.authorize} 
                     removeBinding={this.removeBinding} />
        </div>
        <footer className="App-footer"></footer>
        {/* Here price tags must be rendered and hidden*/}
        <div className="pricetag-list">
          {pricetags}
        </div>
      </div>
    );
  }
}

export default App;
