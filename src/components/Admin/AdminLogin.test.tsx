import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const { clear, auth } = vi.hoisted(() => ({ clear: vi.fn(), auth: vi.fn() }));

vi.mock("../../back-end/db", () => ({
  default: {
    authStore: { clear },
    collection: () => ({ authWithPassword: auth }),
  },
}));

import AdminLogin from "./AdminLogin";

const submit = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
};

afterEach(cleanup);

describe("AdminLogin", () => {
  it("turns away an account without admin access and clears its session", async () => {
    auth.mockResolvedValue({ record: { isAdmin: false } });
    render(<AdminLogin />);
    submit("student@nddu.edu.ph", "pw");
    expect(await screen.findByText(/does not have admin access/i)).toBeInTheDocument();
    expect(clear).toHaveBeenCalled();
  });

  it("shows a friendly message for a wrong password", async () => {
    const { ClientResponseError } = await import("pocketbase");
    auth.mockRejectedValue(new ClientResponseError({ status: 400, data: { message: "Failed to authenticate." } }));
    render(<AdminLogin />);
    submit("a@b.co", "wrong");
    await waitFor(() => expect(screen.getByText("Incorrect email or password.")).toBeInTheDocument());
  });
});
