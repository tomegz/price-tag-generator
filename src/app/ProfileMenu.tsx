import { useEffect, useRef, useState } from "react";
import Icon from "../design-system/Icon";

type ProfileMenuProps = {
  email: string;
  initials: string;
  onLogout(): void | Promise<void>;
};

const ProfileMenu = ({ email, initials, onLogout }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-label={`Zalogowany użytkownik ${email}`}
        className="user-avatar pb-mono"
        onClick={() => setOpen(currentOpen => !currentOpen)}
        type="button"
      >
        {initials}
      </button>
      {open ? (
        <div aria-label="Menu użytkownika" className="profile-menu__popover" role="menu">
          <span className="profile-menu__email pb-mono">{email || "Użytkownik"}</span>
          <button
            className="profile-menu__item"
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
            role="menuitem"
            type="button"
          >
            <Icon name="logout" size={14} />
            Wyloguj
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
