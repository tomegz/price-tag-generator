import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Menu from "./components/Menu";
import Order from "./components/Order";
import Inventory from "./components/Inventory";
import Pricetag from "./components/Pricetag";

import samplePricetags from "./helpers/samplePricetags";

class App extends Component {
  constructor() {
    super();
    this.addItem = this.addItem.bind(this);
    this.state = {
      items: samplePricetags,
      order: {}
    };
  }
  addItem(item) {
    const items = {...this.state.items};
    const timestamp = Date.now();
    items[`item${timestamp}`] = item;
    this.setState({ items });
  }
  render() {
    const { items } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Price Tag Generator</h2>
        </div>
        <div className="wrapper">
          <Menu items={items}/>
          <Order />
          <Inventory items={items} addItem={this.addItem} />
        </div>
        <footer className="App-footer"></footer>
        {/* Here price tags must be rendered and hidden*/}
        <div className="pricetag-list">
          {Object.keys(items)
                 .map(key => <Pricetag key={key} details={items[key]} />)} 
        </div>
      </div>
    );
  }
}

export default App;
