import React, { Component } from 'react';
import PropTypes from "prop-types";

import Tabs from "./Tabs";
import Pane from "./Pane";
import AddCatalogItemForm from "./AddCatalogItemForm";
import AddPromotionForm from "./AddPromotionForm";
import YearDropdown from "./YearDropdown";
import DiscountStatusDropdown from './DiscountStatusDropdown';
import { observeAuth, signIn, signOutUser } from "../services/firebase";

import "../styles/Catalog.css";

class Catalog extends Component {
  constructor() {
    super();
    this.renderCatalogItem = this.renderCatalogItem.bind(this);
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
    this.unsubscribeAuth = observeAuth((user) => {
      if (user) {
        this.setState({
          uid: user.uid
        });
        this.props.authorize(user.uid);
      } else {
        this.setState({ uid: null });
      }
    });
  }
  componentWillUnmount() {
    if(this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }
  handleChange(e, key) {
    const item = this.props.catalogItems[key];
    const name = e.target.name;
    const value = e.target.value;
    const updatedItem = {
      ...item,
      [name]: ["price", "discountPrice"].includes(name) ? Number(value) : value
    }
    this.props.updateCatalogItem(key, updatedItem);
  }
  renderCatalogItem(key) {
    const item = this.props.catalogItems[key];
    return (
      <div className="item-edit" key={key}>
        <input type="text" name="name" value={item.name} placeholder="Marka produktu" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="model" value={item.model} placeholder="Nazwa modelu" onChange={(e) => this.handleChange(e, key)}/>
        <YearDropdown value={item.year} onChange={(e) => this.handleChange(e, key)} />
        <input type="text" name="price" value={item.price} placeholder="Cena produktu" onChange={(e) => this.handleChange(e, key)}/>
        <DiscountStatusDropdown value={item.discountStatus} onChange={(e) => this.handleChange(e, key)} />
        <input type="text" name="discountPrice" value={item.discountPrice} placeholder="Cena promocyjna" onChange={(e) => this.handleChange(e, key)}/>
      </div>
    );
  }
  authenticate(e) {
    e.preventDefault();
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    signIn(email, password)
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
    const uid = authData.user ? authData.user.uid : authData.uid;
    this.setState({ uid });
    this.props.authorize(uid);
  }
  logout() {
    signOutUser();
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
    const { catalogItemIds, addCatalogItem, addPromotion } = this.props;
    if(!this.state.uid) {
      return <div className="catalog">{this.renderLogin()}</div>;
    }
    return (
      <div className="catalog">
        {logout}
        <Tabs>
          <Pane label="Dodaj przedmiot">
            <AddCatalogItemForm addCatalogItem={addCatalogItem} />
          </Pane>
          <Pane label="Oblicz promocję">
            <AddPromotionForm addPromotion={addPromotion}/>
          </Pane>
        </Tabs>
        <h4>Edytuj ceny</h4>
        {catalogItemIds.map(this.renderCatalogItem)}
      </div>
    );
  }
}

Catalog.propTypes = {
  catalogItems: PropTypes.object.isRequired,
  catalogItemIds: PropTypes.array.isRequired,
  searchQuery: PropTypes.string.isRequired,
  addCatalogItem: PropTypes.func.isRequired,
  updateCatalogItem: PropTypes.func.isRequired,
  addPromotion: PropTypes.func.isRequired,
  authorize: PropTypes.func.isRequired,
  removeBinding: PropTypes.func.isRequired
}

export default Catalog;
