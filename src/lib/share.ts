const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://499.media";

export function getShareUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function getTwitterShareUrl(url: string, text: string): string {
  const params = new URLSearchParams({ url, text });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getTelegramShareUrl(url: string, text: string): string {
  const params = new URLSearchParams({ url, text });
  return `https://t.me/share/url?${params.toString()}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
