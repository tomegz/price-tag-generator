import React, { useRef } from "react";

const AddPromotionForm = ({ addPromotion }) => {
  const percent = useRef(null);
  const roundDown = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      percent: Number(percent.current.value),
      roundDown: roundDown.current.checked
    }
    addPromotion(options);
  }
  return (
    <div className="add-promotion-wrapper">
      <h4>Oblicz promocję</h4>
      <form className="add-promotion" onSubmit={(e) => handleSubmit(e)}>
        <div className="percentage-input">
          %<input type="number" min="1" max="30" id="percent" ref={percent} required/>
        </div>
        <div className="check-div">
          <input type="checkbox" id="promotion" ref={roundDown} defaultChecked />
          <label htmlFor="promotion">Zaokrąglij</label>
        </div>
        <button type="submit">Oblicz promocję</button>
      </form>
    </div>
  );
}

export default AddPromotionForm;
