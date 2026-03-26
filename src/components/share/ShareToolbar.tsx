"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link2, MessageCircle, Send, Check } from "lucide-react";
import { getTwitterShareUrl, getTelegramShareUrl, copyToClipboard } from "@/lib/share";

export default function ShareToolbar({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const t = useTranslations("article");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted mr-1">{t("share")}:</span>

      {/* WeChat - copy link */}
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-green-600"
        title={t("shareToWechat")}
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Twitter */}
      <a
        href={getTwitterShareUrl(url, title)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-blue-500"
        title={t("shareToTwitter")}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>

      {/* Telegram */}
      <a
        href={getTelegramShareUrl(url, title)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-blue-400"
        title={t("shareToTelegram")}
      >
        <Send className="w-5 h-5" />
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          copied
            ? "bg-green-50 text-green-600"
            : "bg-surface text-muted hover:text-heading"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            {t("copied")}
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            {t("copyLink")}
          </>
        )}
      </button>
    </div>
  );
}
