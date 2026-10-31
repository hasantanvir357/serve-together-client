import Link from "next/link";
import {
  Camera,
  Clock,
  HandHeart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Video,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Upcoming Events", href: "/upcoming-events" },
  { label: "Create Event", href: "/create-event" },
  { label: "About Us", href: "/#about" },
];

const SOCIALS = [
  { label: "Facebook", icon: MessageCircle, href: "#" },
  { label: "Instagram", icon: Camera, href: "#" },
  { label: "YouTube", icon: Video, href: "#" },
  { label: "WhatsApp", icon: Send, href: "#" },
  { label: "Email", icon: Mail, href: "mailto:help@servetogether.org" },
];

const CONTACTS = [
  { icon: ShieldCheck, text: "Emergency: 999" },
  { icon: Phone, text: "Volunteer hotline: +880 1700-123 456" },
  { icon: Mail, text: "help@servetogether.org" },
  { icon: Clock, text: "Hotline open 24/7" },
  { icon: MapPin, text: "Dhaka, Bangladesh" },
];

function FooterHeading({ children }) {
  return (
    <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
      {children}
    </h3>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-zinc-400">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2 sm:col-span-2">
            <Link href="/" className="flex w-fit items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 ring-1 ring-teal-400/30">
                <HandHeart className="size-5" aria-hidden="true" />
              </span>
              <span className="bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
                ServeTogether
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
              Empowering rural communities across Bangladesh through
              volunteer-led drives — planting trees, serving blood camps,
              delivering relief, and caring for neighbors.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:border-teal-400/50 hover:bg-teal-500/15 hover:text-teal-300"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-teal-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Emergency contact */}
          <div>
            <FooterHeading>Emergency Contact</FooterHeading>
            <ul className="flex flex-col gap-3">
              {CONTACTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-sm">
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-amber-400"
                    aria-hidden="true"
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row">
          <p>© 2026 ServeTogether. All rights reserved.</p>
          <p className="text-zinc-500">
            Made with 💚 by volunteers, for volunteers.
          </p>
        </div>
      </div>
    </footer>
  );
}
