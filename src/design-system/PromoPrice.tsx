import "./components.css";

type PromoPriceProps = {
  oldPrice: string;
  newPrice: string;
  inline?: boolean;
};

const PromoPrice = ({ inline = false, newPrice, oldPrice }: PromoPriceProps) => (
  <span className="ds-promo-price" data-inline={inline ? "true" : "false"}>
    <span className="ds-promo-price__old pb-mono">{oldPrice}</span>
    <span className="ds-promo-price__new pb-mono">{newPrice}</span>
    {!inline ? <span className="ds-promo-price__chip pb-mono">PROMOCJA</span> : null}
  </span>
);

export default PromoPrice;
