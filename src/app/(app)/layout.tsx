import * as React from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider, SidebarShell } from '@/components/layout/sidebar-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <SidebarShell>
          <AppSidebar className="flex" />
        </SidebarShell>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <AppHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}