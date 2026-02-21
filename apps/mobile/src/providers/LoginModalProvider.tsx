import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

interface LoginModalContextValue {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo<LoginModalContextValue>(
    () => ({
      open,
      openModal,
      closeModal,
    }),
    [closeModal, open, openModal],
  );

  return <LoginModalContext.Provider value={value}>{children}</LoginModalContext.Provider>;
}

export function useLoginModal(): LoginModalContextValue {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal must be used inside LoginModalProvider");
  }
  return context;
}
