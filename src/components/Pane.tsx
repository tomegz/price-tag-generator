import type { ReactNode } from "react";

export type PaneProps = {
  label: string;
  children: ReactNode;
};

const Pane = (props: PaneProps) => {
  return (
    <div>
      {props.children}
    </div>
  );
}

export default Pane;
