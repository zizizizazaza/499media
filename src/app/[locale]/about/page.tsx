import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Mail, Send } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>

      <div className="bg-surface rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <span className="text-5xl font-black text-brand">499</span>
          <h1 className="mt-4 text-2xl font-bold text-heading">
            {t("title")}
          </h1>
        </div>

        <p className="text-base text-body leading-relaxed mb-8">
          {t("description")}
        </p>

        <h2 className="text-xl font-bold text-heading mb-3">
          {t("mission")}
        </h2>
        <p className="text-base text-body leading-relaxed mb-8">
          {t("missionText")}
        </p>

        <h2 className="text-xl font-bold text-heading mb-4">
          {t("contact")}
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:contact@499.media"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border text-sm text-heading hover:border-brand hover:text-brand transition-colors"
          >
            <Mail className="w-4 h-4" />
            contact@499.media
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border text-sm text-heading hover:border-brand hover:text-brand transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter / X
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border text-sm text-heading hover:border-brand hover:text-brand transition-colors"
          >
            <Send className="w-4 h-4" />
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
