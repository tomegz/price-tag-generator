import Button from "../design-system/Button";
import Icon from "../design-system/Icon";
import ProfileMenu from "./ProfileMenu";

type AppHeaderProps = {
  userEmail: string;
  userInitials: string;
  onEditCatalog(): void;
  onLogout(): void | Promise<void>;
};

const AppHeader = ({ onEditCatalog, onLogout, userEmail, userInitials }: AppHeaderProps) => (
  <header className="app-shell-header">
    <div className="app-shell-header__brand">
      <Icon name="bike" size={23} />
      <strong>Profi Bike</strong>
      <span className="pb-mono">CENNIK</span>
    </div>
    <div className="app-shell-header__spacer" />
    <Button icon="pencil" onClick={onEditCatalog} variant="ghost">
      Edycja cennika
    </Button>
    <ProfileMenu email={userEmail} initials={userInitials} onLogout={onLogout} />
  </header>
);

export default AppHeader;
