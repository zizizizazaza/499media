import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from("articles")
    .select("slug, cover_image")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  for (const row of data ?? []) {
    const isSvg = row.cover_image?.endsWith(".svg");
    const marker = isSvg ? "❌ SVG" : "✅ Real";
    console.log(`${marker}  ${row.slug}  →  ${row.cover_image}`);
  }
}

check();
