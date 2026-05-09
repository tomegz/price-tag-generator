import { useState, type MouseEvent, type ReactElement } from "react";

import type { PaneProps } from "./Pane";

type TabsProps = {
  children: ReactElement<PaneProps> | Array<ReactElement<PaneProps>>;
};

const Tabs = ({ children }: TabsProps) => {
  const [selected, setSelected] = useState(0);
  const panes = Array.isArray(children) ? children : [children];

  const changeTab = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault();
    setSelected(index);
  };

  return (
    <div className="tabs">
      <ul className="tabs__labels">
        {panes.map((child, index) => {
          const activeClass = selected === index ? "active" : "";
          return (
            <li key={index}>
              <button className={activeClass}
                onClick={(e) => changeTab(e, index)}>
                {child.props.label}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="tabs__content">
        {panes[selected]}
      </div>
    </div>
  );
};

export default Tabs;
