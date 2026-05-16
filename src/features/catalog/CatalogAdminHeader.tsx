import Button from "@/design-system/Button";
import Icon from "@/design-system/Icon";
import SegmentedControl from "@/design-system/SegmentedControl";
import type { CatalogAdminMode } from "./catalogAdminTypes";

type CatalogAdminHeaderProps = {
  mode: CatalogAdminMode;
  onBackToPrint(): void;
  onModeChange(mode: CatalogAdminMode): void;
  onStartAdding(): void;
};

const CatalogAdminHeader = ({
  mode,
  onBackToPrint,
  onModeChange,
  onStartAdding
}: CatalogAdminHeaderProps) => {
  const bulkMode = mode === "bulk";

  return (
    <>
      <header className="admin-bar">
        <Icon name="pencil" size={14} />
        <span className="pb-mono">EDYCJA CENNIKA</span>
        <div className="admin-bar__spacer" />
        <SegmentedControl<CatalogAdminMode>
          ariaLabel="Tryb edycji cennika"
          className="admin-mode-toggle"
          onChange={onModeChange}
          options={[
            { label: "Edycja", value: "edit" },
            { label: "Edycja zbiorcza", value: "bulk" }
          ]}
          value={mode}
        />
        <Button onClick={onBackToPrint} variant="darkGhost">
          Wróć do druku
        </Button>
      </header>

      <section className="admin-title-row">
        <div>
          <h1>Cennik produktów</h1>
          <p>
            {bulkMode
              ? "Zaznacz produkty w tabeli. Następnie wybierz akcję z paska na dole."
              : "Każda zmiana wymaga zapisania. Wiersze zapisują się niezależnie."}
          </p>
        </div>
        <Button icon="plus" onClick={onStartAdding}>
          Dodaj produkt
        </Button>
      </section>
    </>
  );
};

export default CatalogAdminHeader;
