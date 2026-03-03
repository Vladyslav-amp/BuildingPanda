import { supabase } from "./supabaseClient";

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET;

function publicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function buildProjectImages(project, widths = [400, 1200]) {
  const folder = project.folder;
  const start = project.start ?? 1;
  const count = project.count ?? 0;

  if (!folder || !count) return [];

  const [thumbW, mainW] = widths;

  const images = [];

  for (let i = 0; i < count; i++) {
    const index = start + i;

    const thumbPath = `${folder}/${index}-${thumbW}.webp`;
    const mainPath = `${folder}/${index}-${mainW}.webp`;

    images.push({
      thumbUrl: publicUrl(thumbPath),
      mainUrl: publicUrl(mainPath),
      alt: `${project.name} – ${index}`,
    });
  }

  return images;
}