import React from "react";
import PropTypes from "prop-types";

const Item = ({details, index, addToOrder}) => {
  const isOnDiscount = details.discountStatus === "on";
  return (
      <li className="menu-item">
        <div>
          <div className="desc">  
            <h5><strong>{`${details.name} ${details.model}`}</strong></h5>
            <p><i className="fa fa-calendar" /> {`${details.year || "-"}`}</p>
            <p>
              <i className="fa fa-money" />
              <span className={isOnDiscount ? "price" : ""}> {details.price} </span>
              {isOnDiscount ? <span>{details.discountPrice}</span> : ""}
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