import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FlagStripe, Chakra } from "@/components/flags/FlagStripe";
import { SubmitVideoDialog } from "@/components/submit/SubmitVideoDialog";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/videos", label: "All Videos" },
  { to: "/about", label: "About" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40">
      <FlagStripe />
      <div className="border-b-3 border-ink bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link
            to="/"
            className="group flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative flex h-12 w-12 items-center justify-center border-3 border-ink bg-saffron shadow-brutal-sm transition-transform group-hover:-rotate-6">
              <Flag className="h-6 w-6 text-navy" strokeWidth={2.5} />
              <Chakra className="absolute -bottom-1 -right-1 h-5 w-5 text-navy" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-extrabold uppercase tracking-tight md:text-xl">
                Protest Vault
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                Voices · Streets · Reels
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "border-3 border-ink px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "bg-saffron shadow-brutal-sm -translate-y-[1px]"
                      : "bg-white hover:bg-saffron"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <SubmitVideoDialog
              trigger={<Button variant="primary">Submit Video</Button>}
            />
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="border-3 border-ink bg-white p-2 shadow-brutal-sm md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t-3 border-ink bg-paper md:hidden">
            <div className="space-y-2 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block border-3 border-ink px-3 py-2 font-display text-sm font-bold uppercase tracking-wider",
                      isActive
                        ? "bg-saffron shadow-brutal-sm"
                        : "bg-white"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <SubmitVideoDialog
                trigger={
                  <Button variant="primary" className="w-full">
                    Submit Video
                  </Button>
                }
                onOpenChange={(o) => !o && setMobileOpen(false)}
              />
            </div>
            {/* Helper so users know where they are */}
            <div className="border-t-3 border-ink bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60">
              Current: {location.pathname}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}