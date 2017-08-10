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
    this.state = {
      pricetags: samplePricetags
    };
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Price Tag Generator</h2>
        </div>
        <div className="wrapper">
          <Menu />
          <Order />
          <Inventory pricetags={this.state.pricetags} />
        </div>
        <footer className="App-footer"></footer>
        {/* Here price tags must be rendered and hidden*/}
        <div className="pricetag-list">
          {Object.keys(this.state.pricetags)
                 .map(key => {
                        return (
                          <Pricetag key={key} details={this.state.pricetags[key]} />
                        );
                      })} 
        </div>
      </div>
    );
  }
}

export default App;
