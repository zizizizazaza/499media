/**
 * Scrape OG images from article source URLs and download them.
 * 
 * Usage: npx tsx scripts/scrape-covers.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, join } from "path";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import https from "https";
import http from "http";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const COVERS_DIR = resolve(process.cwd(), "public/images/covers");

// Fetch a URL and return HTML text
async function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        timeout: 15000,
      },
      (res) => {
        // Follow redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchHtml(res.headers.location).then(resolve).catch(reject);
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

// Extract OG image URL from HTML
function extractOgImage(html: string): string | null {
  // Try og:image
  const ogMatch = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
  );
  if (ogMatch) return ogMatch[1];

  // Try twitter:image
  const twMatch = html.match(
    /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i
  );
  if (twMatch) return twMatch[1];

  return null;
}

// Download image to a file, return filename
async function downloadImage(
  imageUrl: string,
  slug: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const client = imageUrl.startsWith("https") ? https : http;
    const req = client.get(
      imageUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
        timeout: 30000,
      },
      (res) => {
        // Follow redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadImage(res.headers.location, slug).then(resolve);
          return;
        }

        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }

        const contentType = res.headers["content-type"] || "";
        let ext = ".jpg";
        if (contentType.includes("png")) ext = ".png";
        else if (contentType.includes("webp")) ext = ".webp";
        else if (contentType.includes("gif")) ext = ".gif";
        else if (contentType.includes("svg")) ext = ".svg";

        const filename = `${slug}${ext}`;
        const filepath = join(COVERS_DIR, filename);

        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length < 1000) {
            // Too small, probably an error page
            resolve(null);
            return;
          }
          writeFileSync(filepath, buffer);
          resolve(filename);
        });
        res.on("error", () => resolve(null));
      }
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function main() {
  console.log("🖼️  Scraping cover images from source URLs...\n");

  if (!existsSync(COVERS_DIR)) {
    mkdirSync(COVERS_DIR, { recursive: true });
  }

  // Get all articles with source URLs
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, slug, source_url, cover_image")
    .order("created_at", { ascending: true });

  if (error || !articles) {
    console.error("Failed to fetch articles:", error);
    process.exit(1);
  }

  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    if (!article.source_url) {
      console.log(`   ⏭  ${article.slug} — no source_url`);
      continue;
    }

    try {
      console.log(`   🔍 ${article.slug} — fetching ${article.source_url}`);
      const html = await fetchHtml(article.source_url);
      const ogImageUrl = extractOgImage(html);

      if (!ogImageUrl) {
        console.log(`   ⚠  ${article.slug} — no OG image found`);
        failed++;
        continue;
      }

      console.log(`   📥 ${article.slug} — downloading ${ogImageUrl.substring(0, 80)}...`);
      const filename = await downloadImage(ogImageUrl, article.slug);

      if (!filename) {
        console.log(`   ⚠  ${article.slug} — download failed`);
        failed++;
        continue;
      }

      // Update database
      const newPath = `/images/covers/${filename}`;
      const { error: updateError } = await supabase
        .from("articles")
        .update({ cover_image: newPath })
        .eq("id", article.id);

      if (updateError) {
        console.log(`   ⚠  ${article.slug} — DB update failed: ${updateError.message}`);
        failed++;
        continue;
      }

      console.log(`   ✅ ${article.slug} → ${filename}`);
      updated++;
    } catch (err) {
      console.log(`   ❌ ${article.slug} — error: ${(err as Error).message}`);
      failed++;
    }

    // Be polite — small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n📊 Done! ${updated} updated, ${failed} failed out of ${articles.length} articles.`);
}

main().catch(console.error);
