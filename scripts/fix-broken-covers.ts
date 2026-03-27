/**
 * Re-download broken cover images from me.news articles.
 * These articles' OG images are just the site's 80x80 logo.
 * We instead grab the first large content image from each article page.
 */

import { config } from "dotenv";
import { resolve, join } from "path";
import { writeFileSync, statSync } from "fs";
import https from "https";

config({ path: resolve(process.cwd(), ".env.local") });

const COVERS_DIR = resolve(process.cwd(), "public/images/covers");

const BROKEN_ARTICLES = [
  { slug: "fear-greed-index-drops-to-10", url: "https://www.me.news/contents/266894" },
  { slug: "circle-compliance-storm", url: "https://www.me.news/contents/266737" },
  { slug: "top-5-super-ipos-2026", url: "https://www.me.news/contents/266652" },
  { slug: "gate-polymarket-legal-risk", url: "https://www.me.news/contents/266925" },
  { slug: "delphi-labs-china-ai-ecosystem", url: "https://www.me.news/contents/266903" },
  { slug: "ai-agent-infrastructure-report", url: "https://www.me.news/contents/266830" },
];

function fetchUrl(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doFetch = (u: string, redirects = 0) => {
      if (redirects > 5) return reject(new Error("Too many redirects"));
      https.get(u, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "*/*",
        },
        timeout: 30000,
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doFetch(res.headers.location, redirects + 1);
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    };
    doFetch(url);
  });
}

function extractContentImages(html: string): string[] {
  // Find all image URLs from res.me.news in the article content (not icons)
  const matches = [...html.matchAll(/https:\/\/res\.me\.news\/resources\/[^"'\s)]+/g)];
  return matches.map(m => m[0]).filter(url => {
    // Filter out small icons and UI assets
    return !url.includes("assets/images") && !url.includes("aboutus") && !url.includes("tab/");
  });
}

function getExtFromUrl(url: string): string {
  if (url.includes(".png")) return ".png";
  if (url.includes(".jpg") || url.includes(".jpeg")) return ".jpg";
  if (url.includes(".webp")) return ".webp";
  return ".jpg";
}

async function main() {
  console.log("🔧 Re-downloading broken me.news cover images...\n");

  for (const { slug, url } of BROKEN_ARTICLES) {
    try {
      console.log(`📄 ${slug} — fetching ${url}`);
      const htmlBuf = await fetchUrl(url);
      const html = htmlBuf.toString("utf-8");

      const images = extractContentImages(html);
      if (images.length === 0) {
        console.log(`   ⚠ No content images found`);
        continue;
      }

      console.log(`   Found ${images.length} content images, trying first one...`);

      // Try to download the first good image (>10KB)
      let downloaded = false;
      for (const imgUrl of images) {
        console.log(`   📥 Trying: ${imgUrl.substring(0, 80)}...`);
        try {
          const imgBuf = await fetchUrl(imgUrl);
          if (imgBuf.length < 10000) {
            console.log(`   ⏭ Too small (${imgBuf.length}B), skipping`);
            continue;
          }

          const ext = getExtFromUrl(imgUrl);
          // Remove old broken file
          const oldPath = join(COVERS_DIR, `${slug}.png`);
          const newPath = join(COVERS_DIR, `${slug}${ext}`);

          writeFileSync(newPath, imgBuf);
          console.log(`   ✅ Saved: ${slug}${ext} (${(imgBuf.length / 1024).toFixed(1)}KB)`);

          // If ext changed from .png, remove old .png
          if (ext !== ".png") {
            try {
              const { unlinkSync } = require("fs");
              unlinkSync(oldPath);
              console.log(`   🗑 Removed old: ${slug}.png`);
            } catch {}
          }

          downloaded = true;
          break;
        } catch (e) {
          console.log(`   ⚠ Failed: ${(e as Error).message}`);
        }
      }

      if (!downloaded) {
        console.log(`   ❌ Could not find a suitable image`);
      }
    } catch (e) {
      console.log(`   ❌ Error: ${(e as Error).message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n📊 Done! Check file sizes:");
  for (const { slug } of BROKEN_ARTICLES) {
    try {
      // Check for any extension
      for (const ext of [".png", ".jpg", ".webp"]) {
        const p = join(COVERS_DIR, `${slug}${ext}`);
        try {
          const stat = statSync(p);
          console.log(`   ${stat.size > 10000 ? "✅" : "❌"} ${slug}${ext}: ${(stat.size / 1024).toFixed(1)}KB`);
        } catch {}
      }
    } catch {}
  }
}

main().catch(console.error);
