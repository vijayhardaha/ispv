import { Link } from "react-router-dom";
import { FlagStripe, Chakra } from "@/components/flags/FlagStripe";
import { Heart, ShieldAlert, GitCommitHorizontal, Mail, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t-3 border-ink">
      <FlagStripe />
      <div className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-saffron">
              <Chakra className="h-7 w-7" />
              <span className="font-display text-xl font-extrabold uppercase tracking-tight">
                Protest Vault
              </span>
            </div>
            <p className="mt-3 text-sm text-paper/80">
              A peaceful archive of India's protest movement. Reels, marches,
              candlelight vigils, art on the walls — collected, indexed, and
              kept open.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="nb-badge bg-saffron text-ink">#PeacefulProtest</span>
              <span className="nb-badge bg-white text-ink">#India</span>
              <span className="nb-badge bg-indiaGreen text-paper">#OpenArchive</span>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-saffron">
              Info
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="hover:text-saffron" to="/about">
                  About the project
                </Link>
              </li>
              <li>
                <Link className="hover:text-saffron" to="/categories">
                  Browse categories
                </Link>
              </li>
              <li>
                <Link className="hover:text-saffron" to="/videos">
                  All videos
                </Link>
              </li>
              <li>
                <a className="hover:text-saffron" href="#how-it-works">
                  How submissions work
                </a>
              </li>
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-saffron">
              Useful Links
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  className="hover:text-saffron"
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram (open)
                </a>
              </li>
              <li>
                <a
                  className="hover:text-saffron"
                  href="https://www.bbc.com/news/world/asia/india"
                  target="_blank"
                  rel="noreferrer"
                >
                  BBC India coverage
                </a>
              </li>
              <li>
                <a
                  className="hover:text-saffron"
                  href="https://indianexpress.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Indian Express
                </a>
              </li>
              <li>
                <a
                  className="hover:text-saffron"
                  href="https://thewire.in/"
                  target="_blank"
                  rel="noreferrer"
                >
                  The Wire
                </a>
              </li>
              <li>
                <a
                  className="hover:text-saffron"
                  href="https://scroll.in/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Scroll.in
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-saffron">
              Resources
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-saffron" />
                <a
                  className="hover:text-saffron"
                  href="https://knowindia.india.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Know India — Government of India
                </a>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-saffron" />
                <a
                  className="hover:text-saffron"
                  href="https://en.wikipedia.org/wiki/Freedom_of_speech_in_India"
                  target="_blank"
                  rel="noreferrer"
                >
                  Freedom of speech in India
                </a>
              </li>
              <li className="flex items-start gap-2">
                <GitCommitHorizontal className="mt-0.5 h-4 w-4 text-saffron" />
                <a
                  className="hover:text-saffron"
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Source on GitHub
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-saffron" />
                <a className="hover:text-saffron" href="mailto:hi@protest.vault">
                  hi@protest.vault
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-3 border-paper/20 bg-ink px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2 text-sm text-paper/80">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-saffron" />
              <p className="max-w-3xl">
                <span className="font-bold uppercase text-saffron">Disclaimer:</span>{" "}
                Protest Vault is an independent, non-partisan archive of
                publicly-shared Instagram reels. It is not affiliated with
                Instagram/Meta, the Government of India, or any political
                party. All clips remain the property of their original
                creators. If you believe a video should be removed, email
                <a
                  className="ml-1 underline hover:text-saffron"
                  href="mailto:hi@protest.vault"
                >
                  hi@protest.vault
                </a>{" "}
                and we will review it within 48 hours. We do not host any
                media files — embeds point back to Instagram.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-paper/60">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-hotpink text-hotpink" />
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}