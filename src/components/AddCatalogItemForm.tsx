import { useState, type ChangeEvent, type FormEvent } from "react";

import YearDropdown from './YearDropdown';
import DiscountStatusDropdown from './DiscountStatusDropdown';
import {
  DiscountStatuses,
  type DiscountStatus,
  type LegacyCatalogItem
} from '../domains/catalog/catalog';
import { getCurrentYear } from './yearOptions';

type AddCatalogItemFormProps = {
  addCatalogItem(item: LegacyCatalogItem): void;
};

type AddCatalogItemFormState = {
  name: string;
  price: string;
  model: string;
  discountPrice: string;
  year: string | number;
  discountStatus: DiscountStatus;
};

const initialState: AddCatalogItemFormState = {
  name: '',
  price: '',
  model: '',
  discountPrice: '',
  year: getCurrentYear(),
  discountStatus: DiscountStatuses.OFF,
}

const AddCatalogItemForm = ({ addCatalogItem }: AddCatalogItemFormProps) => {
  const [formState, setFormState] = useState<AddCatalogItemFormState>({ ...initialState });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const field = name as keyof AddCatalogItemFormState;
    const nextValue = field === 'discountStatus' ? value as DiscountStatus : value;

    setFormState(state => ({
      ...state,
      [field]: nextValue,
    }));
  };

  const resetForm = () => {
    setFormState({ ...initialState });
  };

  const createItem = (e: FormEvent<HTMLFormElement>) => {
    addCatalogItem({
      name: formState.name,
      model: formState.model,
      price: Number(formState.price),
      year: formState.year,
      discountPrice: Number(formState.discountPrice),
      discountStatus: formState.discountStatus,
    });
    resetForm();
    e.preventDefault();
  };

  const {
    name,
    model,
    price,
    year,
    discountPrice,
    discountStatus,
  } = formState;

  return (
    <div className="add-item-wrapper">
        <h4>Dodaj nową cenę</h4>
        <form className="add-item" onSubmit={createItem}>
          <input name="name" value={name} onChange={handleChange} type="text" placeholder="Marka" required />
          <input name="model" value={model} onChange={handleChange} type="text" placeholder="Model" required />
          <YearDropdown value={year} onChange={handleChange} />
          <input name="price" value={price} onChange={handleChange} type="text" placeholder="Cena" required />
          <DiscountStatusDropdown value={discountStatus} onChange={handleChange} />
          <input name="discountPrice" value={discountPrice} onChange={handleChange} type="text" placeholder="Cena promocyjna" required />
          <button type="submit"><strong>+ DODAJ</strong></button>
        </form>
      </div>
  );
};

export default AddCatalogItemForm;
