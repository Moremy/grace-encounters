'use client';
import * as React from 'react';
import { X } from 'lucide-react';

const SidebarContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:relative md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:flex md:h-full
        `}
      >
        {/* Close button on mobile */}
        <button
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-ivory/80 hover:text-ivory md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </>
  );
}