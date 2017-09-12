import React from "react";
import PropTypes from "prop-types";

const Item = ({details, index, addToOrder}) => {
  const isOnDiscount = details.discountStatus === "on";
  return (
      <li className="menu-item">
        <div>
          <div className="desc">  
            <h5><strong>{`${details.name} ${details.model}`}</strong></h5>
            <p><i className="fa fa-calendar" /> 2017</p>
            <p>
              <i className="fa fa-money" />
              <span className="price"> {details.price} </span>
              {isOnDiscount ? <span className="discount-price">{details.discountPrice}</span> : ""}
            </p>
          </div>
          <div className="adding-section">
            <button onClick={() => addToOrder(index)}>+</button>
          </div>
        </div>
      </li>
  );
};

Item.propTypes = {
  details: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
  addToOrder: PropTypes.func.isRequired
}

export default Item;