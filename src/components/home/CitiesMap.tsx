import { Link } from "react-router-dom";
import { VIDEOS } from "@/data/videos";

const cityMeta: Record<string, { x: number; y: number; color: string }> = {
  // approx coordinates on the schematic India map (very rough)
  Delhi: { x: 38, y: 22, color: "bg-saffron" },
  Chandigarh: { x: 35, y: 18, color: "bg-saffron" },
  Mumbai: { x: 27, y: 56, color: "bg-hotpink" },
  Bengaluru: { x: 41, y: 76, color: "bg-lime" },
  Kolkata: { x: 65, y: 48, color: "bg-navy text-paper" },
  Hyderabad: { x: 42, y: 64, color: "bg-sun" },
  Chennai: { x: 47, y: 80, color: "bg-indiaGreen text-paper" },
  Pune: { x: 30, y: 58, color: "bg-hotpink" },
  Jaipur: { x: 30, y: 30, color: "bg-saffron" },
  Lucknow: { x: 50, y: 32, color: "bg-sun" },
  Ahmedabad: { x: 25, y: 42, color: "bg-saffron" },
  Srinagar: { x: 30, y: 6, color: "bg-indiaGreen text-paper" },
  Guwahati: { x: 70, y: 32, color: "bg-lime" },
  Bhopal: { x: 38, y: 46, color: "bg-sun" },
  "Thiruvananthapuram": { x: 40, y: 90, color: "bg-indiaGreen text-paper" },
  Bhubaneswar: { x: 60, y: 50, color: "bg-navy text-paper" },
  Indore: { x: 36, y: 46, color: "bg-hotpink" },
  Visakhapatnam: { x: 56, y: 60, color: "bg-saffron" },
  Patna: { x: 55, y: 34, color: "bg-lime" },
  Dehradun: { x: 36, y: 20, color: "bg-indiaGreen text-paper" },
};

export function CitiesMap() {
  const byCity = VIDEOS.reduce<Record<string, number>>((acc, v) => {
    acc[v.city] = (acc[v.city] || 0) + 1;
    return acc;
  }, {});
  const cities = Object.entries(byCity).sort((a, b) => b[1] - a[1]);
  return (
    <section className="border-b-3 border-ink bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="nb-badge bg-ink text-paper">From the map</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
              Cities on the Record
            </h2>
            <p className="mt-1 text-ink/70">
              Every pin is a city with at least one reel in the archive.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {/* schematic map */}
          <div className="relative aspect-[5/6] border-3 border-ink bg-white p-2 shadow-brutal md:col-span-3">
            <div className="grid-noise absolute inset-0 opacity-40" />
            <div className="relative h-full w-full">
              {/* rough India silhouette */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full"
                aria-hidden
              >
                <path
                  d="M30 6 L36 4 L42 7 L48 6 L54 9 L60 8 L66 12 L70 18 L74 24 L78 30 L80 36 L82 42 L80 48 L78 54 L74 60 L70 66 L66 72 L60 80 L52 86 L46 92 L42 94 L40 88 L38 80 L36 72 L34 64 L30 58 L26 52 L22 46 L20 38 L22 30 L26 22 L28 14 Z"
                  fill="#FFFBF0"
                  stroke="#0A0A0A"
                  strokeWidth="0.6"
                />
              </svg>
              {cities.map(([city, count]) => {
                const meta = cityMeta[city];
                if (!meta) return null;
                return (
                  <div
                    key={city}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${meta.x}%`, top: `${meta.y}%` }}
                  >
                    <div
                      className={`flex h-7 min-w-[28px] items-center justify-center border-2 border-ink px-1.5 font-mono text-[10px] font-bold shadow-brutal-sm ${meta.color}`}
                    >
                      {count}
                    </div>
                    <div className="mt-0.5 text-center font-mono text-[8px] font-bold uppercase">
                      {city}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ul className="md:col-span-2 grid grid-cols-2 gap-2">
            {cities.map(([city, count]) => (
              <li key={city}>
                <Link
                  to={`/videos?q=${encodeURIComponent(city)}`}
                  className="nb-card flex items-center justify-between bg-white px-3 py-2 hover:bg-saffron"
                >
                  <span className="font-display text-sm font-extrabold uppercase">
                    {city}
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}