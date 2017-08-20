import React, { Component } from 'react';
import "../styles/Order.css";

class Order extends Component {
  constructor() {
    super();
    this.renderOrder = this.renderOrder.bind(this);
  }
  renderOrder(key) {
    const item = this.props.items[key];
    const count = this.props.order[key];
    const removeButton = <button onClick={() => this.props.removeFromOrder(key)}>&times;</button>;
    if(!item) {
      return <li key={key}>Cena tego produktu nie jest już dostępna do druku {removeButton}</li>;
    }
    return (
      <li key={key}>
        <span><strong>{count}szt.</strong> {item.name} {item.model}</span>
        {removeButton}
      </li>
    );
  }
  render() {
    const orderIds = Object.keys(this.props.order);
    const total = orderIds.reduce((prevTotal, key) => {
      const count = this.props.order[key] || 0;
      return prevTotal + count;
    }, 0);
    return (
      <div className="order">
        <h2>Ceny do druku</h2>
        <button className="print-button" onClick={() => window.print()}><i className="fa fa-print fa-3x" /></button>
        <ul className="order-list">
          {orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Ilość cen do druku: </strong>{total}
          </li>
        </ul>
      </div>
    );
  }
}

export default Order;