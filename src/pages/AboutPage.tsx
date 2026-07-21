import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Flag, ShieldCheck, Globe2, Sparkles } from "lucide-react";
import { Chakra } from "@/components/flags/FlagStripe";

export function AboutPage() {
  return (
    <div>
      <section className="border-b-3 border-ink bg-navy py-14 text-paper">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-saffron">
            / About
          </div>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
            What is Protest Vault?
          </h1>
          <p className="mt-3 max-w-2xl text-paper/80">
            A small, non-partisan archive of peaceful protest reels from
            across India. Built for one reason: to keep the record straight.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-12 md:grid-cols-2 md:px-6">
        <Principle
          icon={<Flag className="h-6 w-6" />}
          title="Peaceful only"
          color="bg-saffron"
        >
          We index only peaceful, public protest. No incitement, no calls to
          violence, no communal targeting. If a clip crosses that line, it
          doesn't get in.
        </Principle>
        <Principle
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Source preserved"
          color="bg-indiaGreen text-paper"
        >
          Every embed points back to the original Instagram URL. We don't
          host media — we point to it. Credit stays where it belongs.
        </Principle>
        <Principle
          icon={<Globe2 className="h-6 w-6" />}
          title="Indexed & searchable"
          color="bg-navy text-paper"
        >
          By city, state, category, hashtag, and tag. Open the search bar on
          the archive page and find what you need in two seconds.
        </Principle>
        <Principle
          icon={<Sparkles className="h-6 w-6" />}
          title="Open to submit"
          color="bg-hotpink text-paper"
        >
          Anyone can submit a public reel via the Submit button. We review
          within 48 hours. If approved, it joins the archive.
        </Principle>
      </section>

      <section
        id="how-it-works"
        className="border-y-3 border-ink bg-paper py-12"
      >
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
            How it works
          </h2>
          <ol className="mt-6 space-y-4">
            <Step n={1} title="Find a reel on Instagram">
              Open a public reel — anything from a march, a candlelight vigil,
              a mural, a press briefing.
            </Step>
            <Step n={2} title="Copy the URL">
              Tap the share icon → "Copy link" on Instagram.
            </Step>
            <Step n={3} title="Submit here">
              Click the <b>Submit Video</b> button in the header, paste the
              URL, add a few hashtags, hit submit.
            </Step>
            <Step n={4} title="We review & add">
              We review for peaceful, public content. If approved, it joins
              the archive within 48 hours.
            </Step>
          </ol>
        </div>
      </section>

      <section className="bg-saffron py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4 px-4 text-center md:px-6">
          <Chakra className="h-12 w-12 text-navy" />
          <h3 className="font-display text-2xl font-extrabold uppercase">
            A country is the sum of its quiet voices.
          </h3>
          <Link to="/videos">
            <Button variant="info">
              See the archive <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Principle({
  icon,
  title,
  children,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`border-3 border-ink p-5 shadow-brutal ${color}`}>
      <div className="flex items-center gap-2">
        <div className="border-3 border-ink bg-white p-1.5 text-ink shadow-brutal-sm">
          {icon}
        </div>
        <h3 className="font-display text-2xl font-extrabold uppercase">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4 border-3 border-ink bg-white p-4 shadow-brutal">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-ink bg-saffron font-display text-lg font-extrabold shadow-brutal-sm">
        {n}
      </div>
      <div>
        <h4 className="font-display text-lg font-extrabold uppercase">
          {title}
        </h4>
        <p className="mt-1 text-sm text-ink/80">{children}</p>
      </div>
    </li>
  );
}