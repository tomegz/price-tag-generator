import React, { Component } from 'react';
import PropTypes from "prop-types";

import AddItemForm from "./AddItemForm";
import "../styles/Inventory.css";
import base from "../base";
import firebase from "firebase";

class Inventory extends Component {
  constructor() {
    super();
    this.renderItem = this.renderItem.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      uid: null,
      owner: null
    }
  }
  componentDidMount() {
    console.log(firebase.auth());
  }
  handleChange(e, key) {
    const item = this.props.items[key];
    const updatedItem = {
      ...item,
      [e.target.name]: e.target.value
    }
    console.log(updatedItem);
    this.props.updateItem(key, updatedItem);
  }
  renderItem(key) {
    const item = this.props.items[key];
    return (
      <div className="item-edit" key={key}>
        <input type="text" name="name" value={item.name} placeholder="Marka produktu" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="model" value={item.model} placeholder="Nazwa modelu" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="price" value={item.price} placeholder="Cena produktu" onChange={(e) => this.handleChange(e, key)}/>
        <select type="text" name="discountStatus" value={item.discountStatus} placeholder="Status promocji" onChange={(e) => this.handleChange(e, key)}>
          <option value="on">Promocja włączona</option>
          <option value="off">Promocja wyłączona</option>
        </select>
        <input type="text" name="discountPrice" value={item.discountPrice} placeholder="Cena promocyjna" onChange={(e) => this.handleChange(e, key)}/>
      </div>
    );
  }
  authenticate() {
    const email = this.emailInput.value; 
    const password = this.passwordInput.value;
    firebase.auth().signInWithEmailAndPassword(email, password)
                   .then(this.authHandler)
                   .catch((e) => console.log(e.message));
  }
  authHandler(authData) {
    base.fetch(this.props.storeId, {
      context: this
    })
    .then((data) => {
      this.setState({
        uid: authData.uid,
        owner: data.owner
      });
    })
    .catch((err) => console.log(err.message));
  }
  renderLogin() {
    return (
      <div className="login">
        <h2>Zaloguj się, aby korzystać z aplikacji</h2>
        <input type="email" placeholder="Twój email" ref={(input) => this.emailInput = input} />
        <input type="password" placeholder="Twoje hasło" ref={(input) => this.passwordInput = input} />
        <button type="submit" onClick={() => this.authenticate()}>Zaloguj</button>
      </div>
    );
  }
  render() {
    const logout = <button>Wyloguj się</button>;
    const { items } = this.props;
    if(!this.state.uid) {
      return <div className="inventory">{this.renderLogin()}</div>;
    }
    if(this.state.uid !== this.state.owner) {
      return (
        <div>
          Nie masz uprawnień do korzystania z aplikacji dla tego sklepu.
          {logout}
        </div>
      );
    }
    return (
      <div className="inventory">
        <h2>Edycja cen</h2>
        {logout}
        {Object.keys(items)
               .map(this.renderItem)}
        <AddItemForm addItem={this.props.addItem} />
      </div>
    );
  }
}

Inventory.propTypes = {
  items: PropTypes.object.isRequired,
  addItem: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
  storeId: PropTypes.string.isRequired
}

export default Inventory;