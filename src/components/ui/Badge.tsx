import { cn } from "@/lib/utils";

type Tone = "default" | "saffron" | "green" | "navy" | "sun" | "pink" | "lime";

const toneClasses: Record<Tone, string> = {
  default: "bg-white",
  saffron: "bg-saffron",
  green: "bg-indiaGreen text-paper",
  navy: "bg-navy text-paper",
  sun: "bg-sun",
  pink: "bg-hotpink text-paper",
  lime: "bg-lime"
};

export function Badge({
  className,
  tone = "default",
  children
}: {
  className?: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return <span className={cn("nb-badge", toneClasses[tone], className)}>{children}</span>;
}
