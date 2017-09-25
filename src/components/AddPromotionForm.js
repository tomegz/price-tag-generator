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
        <input type="number" min="1" max="30" id="percent" ref={(input) => this.percent = input} required/>
        <label htmlFor="percentage">%</label>
        <input type="checkbox" id="promotion" ref={(input) => this.roundDown = input} defaultChecked />
        <label htmlFor="promotion">Zaokrąglij</label>
        <button type="submit">Oblicz promocję</button>
      </form>
    </div>
  );
}

export default AddPromotionForm;