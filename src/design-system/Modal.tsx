import type { ReactNode } from "react";
import Button from "./Button";
import "./components.css";

type ModalProps = {
  children: ReactNode;
  labelledBy: string;
  onClose(): void;
};

const Modal = ({ children, labelledBy, onClose }: ModalProps) => (
  <div className="ds-modal-overlay" role="presentation">
    <section aria-labelledby={labelledBy} aria-modal="true" className="ds-modal" role="dialog">
      <Button aria-label="Zamknij" className="ds-modal__close" icon="x" onClick={onClose} variant="icon" />
      {children}
    </section>
  </div>
);

export default Modal;
