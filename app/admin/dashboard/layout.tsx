'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, FileText, Users, LogOut, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NavLinks = () => {
    const currentPath = usePathname();
    const links = [
        { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
        { href: "/admin/dashboard/quizzes", icon: FileText, label: "Quizzes" },
        { href: "/admin/dashboard/flashcards", icon: Book, label: "Flashcards" },
        { href: "/admin/dashboard/users", icon: Users, label: "User Attempts" },
    ];

    return (
        <>
            {links.map(link => {
                const Icon = link.icon;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            currentPath === link.href && "bg-muted text-primary"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                );
            })}
        </>
    );
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
              <LogOut className="h-6 w-6 text-primary" />
              <span className="">LearnLog Admin</span>
            </Link>
          </div>
          <nav className="flex-1 grid items-start px-2 text-sm font-medium lg:px-4">
             <NavLinks />
          </nav>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold font-headline mb-4">
                  <LogOut className="h-6 w-6 text-primary" />
                  <span>LearnLog Admin</span>
                </Link>
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" />
                    <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={logout}>
                <DropdownMenuItem asChild>
                    <button type="submit" className="w-full">Logout</button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
