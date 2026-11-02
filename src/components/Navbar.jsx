"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  CalendarCheck,
  CalendarCog,
  CalendarPlus,
  HandHeart,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const HOME_LINKS = [{ label: "Upcoming Events", href: "/upcoming-events" }];

const ACCOUNT_LINKS = [
  { label: "Create Event", href: "/create-event", icon: CalendarPlus },
  { label: "Manage Events", href: "/manage-events", icon: CalendarCog },
  { label: "Joined Events", href: "/joined-events", icon: CalendarCheck },
  { label: "Edit Profile", href: "/profile", icon: UserCog },
];

const MOBILE_LINK_CLASSES =
  "rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

const subscribeNoop = () => () => { };
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getInitials(name) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "U";
}

function Logo({ className, onClick }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("flex shrink-0 items-center gap-2", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
        <HandHeart className="size-5" aria-hidden="true" />
      </span>
      <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-lg font-semibold tracking-tight text-transparent">
        ServeTogether
      </span>
    </Link>
  );
}

function ThemeToggle({ className, showLabel = false }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      className={cn(
        showLabel && "w-full justify-start gap-2",
        !showLabel && "size-8",
        className,
      )}
      disabled={!mounted}
      aria-label="Toggle color theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      {showLabel && <span>Switch theme</span>}
    </Button>
  );
}

function AccountAvatar({ size = "default" }) {
  const { user } = useAuth();

  return (
    <Avatar size={size}>
      {user?.image ? (
        <AvatarImage src={user.image} alt={user.name || "User"} />
      ) : null}
      <AvatarFallback className="bg-primary/15 font-medium text-primary">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const mounted = React.useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
        >
          <LogIn className="size-4" aria-hidden="true" />
          Login
        </Link>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "sm" }),
            "gap-1.5 bg-[#0284c7] hover:bg-sky-700 text-white",
          )}
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full cursor-pointer outline-none ring-offset-background transition-opacity hover:opacity-80 focus:ring-2 focus:ring-ring focus:ring-offset-2 inline-flex items-center justify-center"
          aria-label="Open account menu"
          title={user.name || user.email}
        >
          <AccountAvatar />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
              <DropdownMenuItem
                key={href}
                className="cursor-pointer gap-2.5 py-2 text-sm"
                onClick={() => router.push(href)}
              >
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        aria-label="Logout"
        className="gap-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Logout
      </Button>
    </div>
  );
}

function MobileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const close = React.useCallback(() => setOpen(false), []);

  const links = [...HOME_LINKS, ...(user ? ACCOUNT_LINKS : [])];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden cursor-pointer outline-none"
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" aria-hidden="true" />
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[calc(100%-1rem)] flex-col gap-5 overflow-y-auto bg-background p-4 shadow-xl ring-1 ring-foreground/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right">
          <DialogTitle className="sr-only">Navigation menu</DialogTitle>

          <div className="flex items-center justify-between gap-2">
            <Logo onClick={close} />
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={close}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {links.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className={cn(
                    MOBILE_LINK_CLASSES,
                    active && "bg-primary/10 text-primary font-semibold",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
            <ThemeToggle showLabel />
            {user ? (
              <>
                <div className="flex items-center gap-2" title={user.name || user.email}>
                  <AccountAvatar />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => {
                    logout();
                    close();
                  }}
                >
                  <LogOut className="size-4 mr-2" aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className={cn(buttonVariants(), "w-full text-center")}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full text-center")}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />

        <nav aria-label="Primary" className="hidden flex-1 justify-center md:flex">
          {HOME_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block">
            <UserMenu />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}