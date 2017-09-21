import React from "react";

const AddPromotionForm = () => {
  return (
    <form>
      <input type="number" min="1" max="30" />
      <h4>Zaokrąglij do .99</h4>
      <select>
        <option value={true}>Tak</option>
        <option value={false}>Nie</option>
      </select>
      <button type="submit">Nadaj promocję</button>
    </form>
  );
}

export default AddPromotionForm;