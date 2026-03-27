"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { FileText, LayoutDashboard, Tag, FolderOpen } from "lucide-react";

const navItems = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "articles", href: "/admin/articles", icon: FileText },
  { key: "categories", href: "/admin/categories", icon: FolderOpen },
  { key: "tags", href: "/admin/tags", icon: Tag },
] as const;

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-border hidden lg:block">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-heading">{t("title")}</h2>
      </div>
      <nav className="p-3 space-y-1">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:bg-surface hover:text-heading"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {t(key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
