import React, { Component } from 'react';
import PropTypes from "prop-types";
import firebase from "firebase";

import Tabs from "./Tabs";
import Pane from "./Pane";
import AddItemForm from "./AddItemForm";
import AddPromotionForm from "./AddPromotionForm";
import YearDropdown from "./YearDropdown";

import "../styles/Inventory.css";

class Inventory extends Component {
  constructor() {
    super();
    this.renderItem = this.renderItem.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      uid: null
    }
  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          uid: user.uid
        });
        this.props.authorize(this.state.uid);
      } else {
        this.setState({ uid: null });
      }
    });
  }
  handleChange(e, key) {
    const item = this.props.items[key];
    const name = e.target.name;
    const value = e.target.value;
    const updatedItem = {
      ...item,
      [name]: ["price", "discountPrice"].includes(name) ? Number(value) : value
    }
    this.props.updateItem(key, updatedItem);
  }
  renderItem(key) {
    const item = this.props.items[key];
    return (
      <div className="item-edit" key={key}>
        <input type="text" name="name" value={item.name} placeholder="Marka produktu" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="model" value={item.model} placeholder="Nazwa modelu" onChange={(e) => this.handleChange(e, key)}/>
        <YearDropdown value={item.year} onChange={(e) => this.handleChange(e, key)} />
        <input type="text" name="price" value={item.price} placeholder="Cena produktu" onChange={(e) => this.handleChange(e, key)}/>
        <select type="text" name="discountStatus" value={item.discountStatus} placeholder="Status promocji" onChange={(e) => this.handleChange(e, key)}>
          <option value="on">Promocja włączona</option>
          <option value="off">Promocja wyłączona</option>
        </select>
        <input type="text" name="discountPrice" value={item.discountPrice} placeholder="Cena promocyjna" onChange={(e) => this.handleChange(e, key)}/>
      </div>
    );
  }
  authenticate(e) {
    e.preventDefault();
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    firebase.auth().signInWithEmailAndPassword(email, password)
                   .then(this.authHandler)
                   .catch((e) => console.log(e.message));
  }
  authHandler(authData) {
    /*base.fetch(this.props.storeId, {
      context: this
    })
    .then((data) => {
      this.setState({
        uid: authData.uid,
      });
      this.props.authorize(authData.uid);
    })
    .catch((err) => console.log(err.message));*/
    const uid = authData.uid;
    this.setState({ uid });
    this.props.authorize(uid);
  }
  logout() {
    firebase.auth().signOut();
    this.props.removeBinding();
  }
  renderLogin() {
    return (
      <form onSubmit={(e) => this.authenticate(e)} className="login">
        <h2>Zaloguj się, aby korzystać z aplikacji</h2>
        <input type="email" placeholder="Twój email" ref={(input) => this.emailInput = input} />
        <input type="password" placeholder="Twoje hasło" ref={(input) => this.passwordInput = input} />
        <button type="submit">Zaloguj</button>
      </form>
    );
  }
  render() {
    const logout = <button className="btn-logout" onClick={() => this.logout()}><i className="fa fa-sign-out fa-3x" /></button>;
    const { itemsToRender, addItem, addPromotion } = this.props;
    if(!this.state.uid) {
      return <div className="inventory">{this.renderLogin()}</div>;
    }
    return (
      <div className="inventory">
        {logout}
        <Tabs>
          <Pane label="Dodaj przedmiot">
            <AddItemForm addItem={addItem} />
          </Pane>
          <Pane label="Oblicz promocję">
            <AddPromotionForm addPromotion={addPromotion}/>
          </Pane>
        </Tabs>
        <h4>Edytuj ceny</h4>
        {itemsToRender.map(this.renderItem)}
      </div>
    );
  }
}

Inventory.propTypes = {
  items: PropTypes.object.isRequired,
  itemsToRender: PropTypes.array.isRequired,
  searchQuery: PropTypes.string.isRequired,
  addItem: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
  removeBinding: PropTypes.func.isRequired
}

export default Inventory;