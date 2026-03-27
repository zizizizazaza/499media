import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { FileText, Eye, Edit3, Archive } from "lucide-react";

export default async function AdminDashboard() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  // Fetch article counts by status
  const [publishedRes, draftRes, archivedRes] = await Promise.all([
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "archived"),
  ]);

  const stats = [
    {
      label: t("published"),
      value: publishedRes.count ?? 0,
      icon: Eye,
      color: "text-green-600 bg-green-50",
    },
    {
      label: t("drafts"),
      value: draftRes.count ?? 0,
      icon: Edit3,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: t("archived"),
      value: archivedRes.count ?? 0,
      icon: Archive,
      color: "text-gray-600 bg-gray-100",
    },
    {
      label: t("total"),
      value:
        (publishedRes.count ?? 0) +
        (draftRes.count ?? 0) +
        (archivedRes.count ?? 0),
      icon: FileText,
      color: "text-brand bg-brand/10",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading mb-6">
        {t("dashboard")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-heading">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
