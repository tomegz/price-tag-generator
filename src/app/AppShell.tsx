import type { ReactNode } from "react";
import "./AppShell.css";
import "../features/printTags/printVisibility.css";

type AppShellProps = {
  children: ReactNode;
  printTags: ReactNode;
};

const AppShell = ({ children, printTags }: AppShellProps) => (
  <div className="redesign-app">
    {children}
    <div className="print-tag-rendering" data-testid="print-tag-rendering">
      {printTags}
    </div>
  </div>
);

export default AppShell;
