"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type MobileNavbarContextType = {
  showMobileNavbar: boolean;
  setShowMobileNavbar: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

const MobileNavbarContext =
  createContext<MobileNavbarContextType | undefined>(undefined);

export function MobileNavbarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [showMobileNavbar, setShowMobileNavbar] = useState(true);

  return (
    <MobileNavbarContext.Provider
      value={{ showMobileNavbar, setShowMobileNavbar }}
    >
      {children}
    </MobileNavbarContext.Provider>
  );
}

export function useMobileNavbar() {
  const context = useContext(MobileNavbarContext);

  if (!context) {
    throw new Error(
      "useMobileNavbar must be used inside MobileNavbarProvider"
    );
  }

  return context;
}