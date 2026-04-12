import React from "react";
import { render, screen } from "@testing-library/react-native";
import App from "../../App";

jest.mock("../hooks/useAuthSession", () => ({
  useAuthSession: () => ({
    status: "signed-out",
    session: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}));

describe("mobile app shell", () => {
  it("renders the sign-in screen when there is no session", () => {
    render(<App />);
    expect(screen.getByText("BalanceVisor")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });
});
