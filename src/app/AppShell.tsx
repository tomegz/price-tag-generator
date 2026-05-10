import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  printTags: ReactNode;
};

const AppShell = ({ children, printTags }: AppShellProps) => (
  <div className="redesign-app">
    {children}
    <div className="print-tag-rendering">
      {printTags}
    </div>
  </div>
);

export default AppShell;
