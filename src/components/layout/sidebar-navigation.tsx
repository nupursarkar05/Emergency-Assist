
"use client";

import Link from 'next/link';
import { BotMessageSquare, Youtube, AlertTriangle } from 'lucide-react';

import { AppLogo } from '@/components/common/app-logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/layout/nav-link';

export function SidebarNavigation() {
  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group/logo">
          <AppLogo className="h-8 w-8 text-primary transition-transform group-hover/logo:scale-110" />
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Emergency Assist</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <NavLink href="/" tooltip="AI Chatbot" icon={BotMessageSquare}>AI Chatbot</NavLink>
          <NavLink href="/video-guide" tooltip="Video Guide" icon={Youtube}>Video Guide</NavLink>
          <NavLink href="/emergency-notification" tooltip="Notify Loved Ones" icon={AlertTriangle}>Notify Loved Ones</NavLink>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
