import React, { Component } from 'react';
import PropTypes from "prop-types";

import "../styles/Order.css";
import { CSSTransitionGroup } from "react-transition-group";

class Order extends Component {
  constructor() {
    super();
    this.renderOrder = this.renderOrder.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }
  componentDidMount() {
    this.scrollToBottom();
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  scrollToBottom() {
    const list = this._orderList;
    list.scrollTop = list.scrollHeight - list.clientHeight;
  }
  renderOrder(key) {
    const { items, order, removeFromOrder } = this.props;
    const item = items[key];
    const count = order[key];
    const removeButton = <button onClick={() => removeFromOrder(key)}>&times;</button>;
    if(!item) {
      return <li key={key}>Cena tego produktu nie jest już dostępna do druku {removeButton}</li>;
    }
    return (
      <li key={key}>
        <span>
          <strong>
            <CSSTransitionGroup component="span"
                                className="count"
                                transitionName="count"
                                transitionEnterTimeout={250}
                                transitionLeaveTimeout={250}>
              <span key={count}>{count}</span>
            </CSSTransitionGroup>
            szt.
          </strong> 
        {item.name} {item.model}
        </span>
        {removeButton}
      </li>
    );
  }
  render() {
    const { order } = this.props;
    const orderIds = Object.keys(order);
    const total = orderIds.reduce((prevTotal, key) => {
      const count = order[key] || 0;
      return prevTotal + count;
    }, 0);
    return (
      <div className="order" ref={(c) => this._orderList = c}>
        <h2>Ceny do druku</h2>
        <button className="print-button" onClick={() => window.print()}><i className="fa fa-print fa-3x" /></button>
        <CSSTransitionGroup className="order-list" 
                            component="ul" 
                            transitionName="order"
                            transitionEnterTimeout={500}
                            transitionLeaveTimeout={500}>
          {orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Ilość cen do druku: </strong>{total}
          </li>
        </CSSTransitionGroup>
      </div>
    );
  }
}

Order.propTypes = {
  items: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired,
  removeFromOrder: PropTypes.func.isRequired
}

export default Order;