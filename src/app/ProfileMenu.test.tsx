import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProfileMenu from "./ProfileMenu";

describe("ProfileMenu", () => {
  it("opens from the profile initials and delegates logout", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<ProfileMenu email="owner@example.test" initials="OE" onLogout={onLogout} />);

    await user.click(screen.getByRole("button", { name: /zalogowany użytkownik/i }));

    expect(screen.getByRole("menu", { name: "Menu użytkownika" })).toBeInTheDocument();
    expect(screen.getByText("owner@example.test")).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: /wyloguj/i }));

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu", { name: "Menu użytkownika" })).not.toBeInTheDocument();
  });

  it("closes the open menu with Escape", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu email="owner@example.test" initials="OE" onLogout={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /zalogowany użytkownik/i }));
    expect(screen.getByRole("menu", { name: "Menu użytkownika" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu", { name: "Menu użytkownika" })).not.toBeInTheDocument();
  });
});
