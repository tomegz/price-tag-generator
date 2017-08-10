import React, { Component } from 'react';
import "../styles/Inventory.css";

class Inventory extends Component {
  render() {
    return (
      <div className="inventory">
        <h2>Inventory</h2>
        {Object.keys(this.props.pricetags)
               .map(key => <p key={key}>{this.props.pricetags[key].name}</p>)}
      </div>
    );
  }
}

export default Inventory;