import React from "react";

const AddPromotionForm = ({ addPromotion }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      percent: Number(this.percent.value),
      roundDown: this.roundDown.checked
    }
    addPromotion(options);
  }
  return (
    <div className="add-promotion-wrapper">
      <h4>Oblicz promocję</h4>
      <form className="add-promotion" onSubmit={(e) => handleSubmit(e)}>
        <div className="percentage-input">
          %<input type="number" min="1" max="30" id="percent" ref={(input) => this.percent = input} required/>
        </div>
        <div className="check-div">
          <input type="checkbox" id="promotion" ref={(input) => this.roundDown = input} defaultChecked />
          <label htmlFor="promotion">Zaokrąglij</label>
        </div>
        <button type="submit">Oblicz promocję</button>
      </form>
    </div>
  );
}

export default AddPromotionForm;