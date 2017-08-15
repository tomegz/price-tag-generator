import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Menu from "./components/Menu";
import Order from "./components/Order";
import Inventory from "./components/Inventory";
import Pricetag from "./components/Pricetag";

import base from "./base";

import samplePricetags from "./helpers/samplePricetags";

class App extends Component {
  constructor() {
    super();
    this.addItem = this.addItem.bind(this);
    this.addToOrder = this.addToOrder.bind(this);
    this.state = {
      items: {},
      order: {}
    };
  }
  componentWillMount() {
    this.ref = base.syncState(`${this.props.match.params.storeId}/items`, {
      context: this,
      state: "items"
    });
  }
  componentWillUnmount() {
    base.removeBinding(this.ref);
  }
  addItem(item) {
    const items = {...this.state.items};
    const timestamp = Date.now();
    items[`item${timestamp}`] = item;
    this.setState({ items });
  }
  addToOrder(key) {
    const order = {...this.state.order};
    order[key] = order[key] + 1 || 1;
    this.setState({ order });
  }
  render() {
    const { items, order } = this.state;
    const pricetags = [];
    Object.keys(order)
          .forEach(key => {
            for(var i=0; i<order[key]; i++) {
              pricetags.push(<Pricetag key={`${key}-${i}`} details={items[key]} />);
            }
          });
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Price Tag Generator</h2>
        </div>
        <div className="wrapper">
          <Menu items={items} addToOrder={this.addToOrder} />
          <Order items={items} order={order} />
          <Inventory items={items} addItem={this.addItem} />
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
