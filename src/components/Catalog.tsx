import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import Tabs from "./Tabs";
import Pane from "./Pane";
import AddCatalogItemForm from "./AddCatalogItemForm";
import AddPromotionForm from "./AddPromotionForm";
import YearDropdown from "./YearDropdown";
import DiscountStatusDropdown from './DiscountStatusDropdown';
import {
  authService,
  type AuthSignInResult
} from "../services/firebase";
import type {
  CatalogItemsById,
  LegacyCatalogItem
} from "../domains/catalog/catalog";
import type { DiscountOptions } from "../domains/pricing/discount";

import "../styles/Catalog.css";

type CatalogProps = {
  catalogItems: CatalogItemsById;
  catalogItemIds: string[];
  searchQuery: string;
  addCatalogItem(item: LegacyCatalogItem): void;
  updateCatalogItem(itemId: string, item: LegacyCatalogItem): void;
  addPromotion(options: DiscountOptions): void;
  catalogError: string;
  connectCatalogForUser(userId: string): void;
  removeBinding(): void;
};

const Catalog = ({
  catalogItems,
  catalogItemIds,
  addCatalogItem,
  updateCatalogItem,
  addPromotion,
  catalogError,
  connectCatalogForUser,
  removeBinding
}: CatalogProps) => {
  const [uid, setUid] = useState<string | null>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAuth = authService.observeAuth((user) => {
      if (user) {
        setUid(user.uid);
        connectCatalogForUser(user.uid);
      } else {
        setUid(null);
      }
    });

    return unsubscribeAuth;
  }, [connectCatalogForUser]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, key: string) => {
    const item = catalogItems[key];
    const name = e.target.name as keyof LegacyCatalogItem;
    const value = e.target.value;
    const updatedItem = {
      ...item,
      [name]: ["price", "discountPrice"].includes(name) ? Number(value) : value
    } as LegacyCatalogItem;
    updateCatalogItem(key, updatedItem);
  };

  const renderCatalogItem = (key: string) => {
    const item = catalogItems[key];
    return (
      <div className="item-edit" key={key}>
        <input type="text" name="name" value={item.name} placeholder="Marka produktu" onChange={(e) => handleChange(e, key)}/>
        <input type="text" name="model" value={item.model} placeholder="Nazwa modelu" onChange={(e) => handleChange(e, key)}/>
        <YearDropdown value={item.year} onChange={(e) => handleChange(e, key)} />
        <input type="text" name="price" value={item.price} placeholder="Cena produktu" onChange={(e) => handleChange(e, key)}/>
        <DiscountStatusDropdown value={item.discountStatus} onChange={(e) => handleChange(e, key)} />
        <input type="text" name="discountPrice" value={item.discountPrice} placeholder="Cena promocyjna" onChange={(e) => handleChange(e, key)}/>
      </div>
    );
  };

  const authHandler = (authData: AuthSignInResult | { uid: string }) => {
    const userId = "user" in authData ? authData.user.uid : authData.uid;
    setUid(userId);
    connectCatalogForUser(userId);
  };

  const authenticate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailInput.current || !passwordInput.current) return;

    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    authService.signIn(email, password)
      .then(authHandler)
      .catch((e) => console.log(e.message));
  };

  const logout = () => {
    authService.signOut();
    removeBinding();
  };

  const renderLogin = () => {
    return (
      <form onSubmit={authenticate} className="login">
        <h2>Zaloguj się, aby korzystać z aplikacji</h2>
        <input type="email" placeholder="Twój email" ref={emailInput} />
        <input type="password" placeholder="Twoje hasło" ref={passwordInput} />
        <button type="submit">Zaloguj</button>
      </form>
    );
  };

  const logoutButton = <button className="btn-logout" onClick={logout}><i className="fa fa-sign-out fa-3x" /></button>;
  if(!uid) {
    return <div className="catalog">{renderLogin()}</div>;
  }
  return (
    <div className="catalog">
      {logoutButton}
      {catalogError ? <p className="catalog-error">{catalogError}</p> : null}
      <Tabs>
        <Pane label="Dodaj przedmiot">
          <AddCatalogItemForm addCatalogItem={addCatalogItem} />
        </Pane>
        <Pane label="Oblicz promocję">
          <AddPromotionForm addPromotion={addPromotion}/>
        </Pane>
      </Tabs>
      <h4>Edytuj ceny</h4>
      {catalogItemIds.map(renderCatalogItem)}
    </div>
  );
};

export default Catalog;
