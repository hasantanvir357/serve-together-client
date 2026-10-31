"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  UserPlus,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const HOME_LINKS = [{ label: "Upcoming Events", href: "/upcoming-events" }];

const ACCOUNT_LINKS = [
  { label: "Create Event", href: "/create-event", icon: CalendarPlus },
  { label: "Manage Events", href: "/manage-events", icon: CalendarCog },
  { label: "Joined Events", href: "/joined-events", icon: CalendarCheck },
];

const MOBILE_LINK_CLASSES =
  "rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

// Client-only detection without setState-in-effect: the server snapshot is
// `false`, and React re-renders with `true` right after hydration.
const subscribeNoop = () => () => {};
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
      <span className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400">
        <HandHeart className="size-5" aria-hidden="true" />
      </span>
      <span className="bg-gradient-to-r from-teal-600 to-amber-500 bg-clip-text text-lg font-semibold tracking-tight text-transparent dark:from-teal-400 dark:to-amber-400">
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

  // Avoid rendering the wrong icon before next-themes resolves the theme
  // (would cause a hydration mismatch against server HTML).
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
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      {showLabel && <span>Switch theme</span>}
    </Button>
  );
}

function AccountAvatar({ size = "default" }) {
  const { user } = useAuth();

  return (
    <Avatar size={size}>
      <AvatarFallback className="bg-teal-500/15 font-medium text-teal-700! dark:text-teal-400!">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * Desktop avatar dropdown (shadcn <DropdownMenu> on Base UI Menu).
 * Always rendered — shows Login when logged out, account links + Logout
 * when logged in, so clicking the avatar always opens the menu.
 */
function UserMenu() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Open account menu"
          />
        }
      >
        <AccountAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {/* DropdownMenuLabel is Menu.GroupLabel and must live inside a Group
            or Base UI throws "MenuGroupContext is missing" on open. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block text-sm font-medium text-foreground">
              {user ? user.name : "Welcome"}
            </span>
            <span className="block text-xs text-muted-foreground">
              {user ? user.email : "Sign in to sync your events"}
            </span>
          </DropdownMenuLabel>
          {user &&
            ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
              <DropdownMenuItem key={href} render={<Link href={href} />}>
                <Icon aria-hidden="true" />
                {label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOut aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem render={<Link href="/sign-in" />}>
              <LogIn aria-hidden="true" />
              Login
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/sign-in" />}>
              <UserPlus aria-hidden="true" />
              Register
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Mobile: hamburger opening a right-hand drawer built from Base UI Dialog. */
function MobileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const close = React.useCallback(() => setOpen(false), []);

  const links = [...HOME_LINKS, ...(user ? ACCOUNT_LINKS : [])];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu aria-hidden="true" />
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[calc(100%-1rem)] flex-col gap-5 overflow-y-auto bg-background p-4 shadow-xl ring-1 ring-foreground/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right">
          <DialogTitle className="sr-only">Navigation menu</DialogTitle>

          <div className="flex items-center justify-between gap-2">
            <Logo onClick={close} />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close navigation menu"
              onClick={close}
            >
              <X aria-hidden="true" />
            </Button>
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
                    active &&
                      "bg-teal-500/10 text-teal-700 dark:text-teal-400",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {Icon ? <Icon aria-hidden="true" /> : null}
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
                <div className="flex items-center gap-2">
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
                  className="w-full"
                  onClick={() => {
                    logout();
                    close();
                  }}
                >
                  <LogOut aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                render={<Link href="/sign-in" onClick={close} />}
              >
                Sign In
              </Button>
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        {/* Left: logo */}
        <Logo />

        {/* Center: upcoming events (desktop) */}
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
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: theme toggle + auth */}
        <div className="flex shrink-0 items-center gap-1">
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
