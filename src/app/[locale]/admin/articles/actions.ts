"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Validate slug format: lowercase alphanumeric, hyphens only
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const content = formData.get("content") as string;
  const coverImage = formData.get("cover_image") as string;
  const author = (formData.get("author") as string)?.trim();
  const source = formData.get("source") as string;
  const sourceUrl = formData.get("source_url") as string;
  const categoryId = formData.get("category_id") as string;
  const locale = (formData.get("locale") as string) || "zh";
  const isFeatured = formData.get("is_featured") === "on";
  const isPinned = formData.get("is_pinned") === "on";
  const readingTime = parseInt(formData.get("reading_time") as string, 10) || 1;
  const status = (formData.get("status") as string) || "draft";
  const tagsRaw = (formData.get("tags") as string) || "";

  if (!title || title.length > 200) throw new Error("Title is required and must be under 200 characters");
  if (!slug || !isValidSlug(slug)) throw new Error("Slug must be lowercase alphanumeric with hyphens only");
  if (!content?.trim()) throw new Error("Content is required");

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      title,
      slug,
      summary,
      content,
      cover_image: coverImage || null,
      author,
      source: source || null,
      source_url: sourceUrl || null,
      category_id: categoryId || null,
      locale,
      is_featured: isFeatured,
      is_pinned: isPinned,
      reading_time: readingTime,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Handle tags
  if (tagsRaw.trim() && article) {
    await syncTags(supabase, article.id, tagsRaw);
  }

  revalidatePath("/");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const content = formData.get("content") as string;
  const coverImage = formData.get("cover_image") as string;
  const author = (formData.get("author") as string)?.trim();
  const source = formData.get("source") as string;
  const sourceUrl = formData.get("source_url") as string;
  const categoryId = formData.get("category_id") as string;
  const locale = (formData.get("locale") as string) || "zh";
  const isFeatured = formData.get("is_featured") === "on";
  const isPinned = formData.get("is_pinned") === "on";
  const readingTime = parseInt(formData.get("reading_time") as string, 10) || 1;
  const status = (formData.get("status") as string) || "draft";
  const tagsRaw = (formData.get("tags") as string) || "";

  if (!title || title.length > 200) throw new Error("Title is required and must be under 200 characters");
  if (!slug || !isValidSlug(slug)) throw new Error("Slug must be lowercase alphanumeric with hyphens only");
  if (!content?.trim()) throw new Error("Content is required");

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug,
      summary,
      content,
      cover_image: coverImage || null,
      author,
      source: source || null,
      source_url: sourceUrl || null,
      category_id: categoryId || null,
      locale,
      is_featured: isFeatured,
      is_pinned: isPinned,
      reading_time: readingTime,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Handle tags
  await syncTags(supabase, id, tagsRaw);

  revalidatePath("/");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/articles");
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Failed to delete article"
    );
  }
}

export async function changeStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    const updates: Record<string, unknown> = { status };
    if (status === "published") {
      updates.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("articles").update(updates).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/articles");
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Failed to change status"
    );
  }
}

// ---- Helper: sync tags for an article ----

async function syncTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  articleId: string,
  tagsRaw: string
) {
  const tagNames = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // Delete existing article_tags
  await supabase.from("article_tags").delete().eq("article_id", articleId);

  if (tagNames.length === 0) return;

  // Upsert tags
  const { data: tags } = await supabase
    .from("tags")
    .upsert(
      tagNames.map((name) => ({ name })),
      { onConflict: "name" }
    )
    .select("id, name");

  if (!tags) return;

  // Insert article_tags
  const links = tags.map((tag) => ({
    article_id: articleId,
    tag_id: tag.id,
  }));

  await supabase.from("article_tags").insert(links);
}
