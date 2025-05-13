
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { Menu } from 'lucide-react'; // Keep for mobile header

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger, 
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/common/app-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; 
import { SidebarNavigation } from '@/components/layout/sidebar-navigation'; // Import the new SidebarNavigation component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Emergency Assist',
  description: 'Your guide to handling medical emergencies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
        <SidebarProvider defaultOpen={true}>
          <SidebarNavigation /> {/* Use the new client component for the sidebar */}
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:hidden">
                <Link href="/" className="flex items-center gap-2">
                  <AppLogo className="h-7 w-7 text-primary" />
                  <span className="text-lg font-semibold">Emergency Assist</span>
                </Link>
                <SidebarTrigger asChild>
                   <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SidebarTrigger>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
