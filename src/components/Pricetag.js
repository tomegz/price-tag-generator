import React from "react";
import "../styles/Pricetag.css";

class Pricetag extends React.Component {
  render() {
    const { details } = this.props;
    return (
      <div>
        <div className="half-tag">
          <div className="text-content">
            <h2>{details.name}</h2>
            <h4>{details.model}</h4>
            <p>{details.price},-</p>
          </div>
        </div>
        <div className="half-tag">
          <div className="text-content">
            <h2>{details.name}</h2>
            <h4>{details.model}</h4>
            <p>{details.price},-</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Pricetag;