import { supabase } from "./supabaseClient";
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET;

export function storagePublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}