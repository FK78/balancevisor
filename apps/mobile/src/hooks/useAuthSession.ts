export type AuthSessionStatus = "signed-in" | "signed-out";

export function useAuthSession() {
  return {
    status: "signed-out" as AuthSessionStatus,
    session: null,
    signIn: () => undefined,
    signOut: () => undefined,
  };
}
