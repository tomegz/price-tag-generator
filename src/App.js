import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Menu from "./components/Menu";
import Order from "./components/Order";
import Inventory from "./components/Inventory";

class App extends Component {
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
          <Inventory />
        </div>
        <footer className="App-footer"></footer>
      </div>
    );
  }
}

export default App;
