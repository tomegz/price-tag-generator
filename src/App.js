import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Menu from "./components/Menu";
import Order from "./components/Order";
import Inventory from "./components/Inventory";
import Pricetag from "./components/Pricetag";

import base from "./base";


class App extends Component {
  constructor() {
    super();
    this.addItem = this.addItem.bind(this);
    this.addToOrder = this.addToOrder.bind(this);
    this.removeFromOrder = this.removeFromOrder.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.state = {
      items: {},
      order: {}
    };
  }
  componentWillMount() {
    const storeId = this.props.match ? this.props.match.params.storeId : this.props.params.storeId;
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
  componentWillUnmount() {
    base.removeBinding(this.ref);
  }
  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem(`order-${this.props.match.params.storeId}`, 
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
  addToOrder(key) {
    const order = {...this.state.order};
    order[key] = order[key] + 1 || 1;
    this.setState({ order });
  }
  removeFromOrder(key) {
    const order = {...this.state.order};
    delete order[key];
    this.setState({ order });
  }
  render() {
    const { items, order } = this.state;
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
          <Menu items={items} addToOrder={this.addToOrder} />
          <Order items={items} 
                 order={order}
                 removeFromOrder={this.removeFromOrder} />
          <Inventory items={items} addItem={this.addItem} updateItem={this.updateItem} />
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
