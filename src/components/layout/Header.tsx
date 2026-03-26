"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Search, Menu, X, Globe } from "lucide-react";

const navLinks = [
  { key: "home", href: "/" },
  { key: "news", href: "/category/news" },
  { key: "research", href: "/category/research" },
  { key: "about", href: "/about" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchLocale = () => {
    const nextLocale = locale === "zh" ? "en" : "zh";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-brand tracking-tight">
              499
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className={`text-sm font-medium transition-colors hover:text-brand ${
                  pathname === href
                    ? "text-brand"
                    : "text-heading"
                }`}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label={t("search")}
            >
              <Search className="w-5 h-5 text-muted" />
            </Link>

            <button
              onClick={switchLocale}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg hover:bg-surface transition-colors text-muted"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === "zh" ? "EN" : "中"}</span>
            </button>

            <button className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors">
              {t("login")}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === href
                      ? "text-brand bg-surface"
                      : "text-heading hover:bg-surface"
                  }`}
                >
                  {t(key)}
                </Link>
              ))}
              <button className="mx-3 mt-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors">
                {t("login")}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
