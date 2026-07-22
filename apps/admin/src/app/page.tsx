import { redirect } from "next/navigation";
import type { JSX } from "react";

import { createServerSupabase } from "@/lib/supabase";

export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: total } = await supabase.from('videos').select('*', { count: 'exact', head: true });
  const { count: draft } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'draft');
  const { count: pending } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'pending_review');
  const { count: published } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { count: rejected } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
  const stats = [
    { label: "Total", color: "bg-black", count: total ?? 0 },
    { label: "Draft", color: "bg-gray-400", count: draft ?? 0 },
    { label: "Pending", color: "bg-yellow-400", count: pending ?? 0 },
    { label: "Published", color: "bg-green-500", count: published ?? 0 },
    { label: "Rejected", color: "bg-red-500", count: rejected ?? 0 }
  ];

  return (
    <div className="p-6">
      <h1 className="mb-8 text-3xl font-extrabold uppercase">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#18181b]">
            <div className={`mb-2 h-3 w-3 ${s.color}`} />
            <div className="text-3xl font-extrabold">{s.count}</div>
            <div className="text-xs font-bold uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
