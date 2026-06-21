// Returns how many people are on the waitlist, counted from Supabase
// (the source of truth). Cached at Vercel's edge so we don't query on
// every single page view.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    // Not configured yet — report 0 so the page degrades gracefully.
    return res.status(200).json({ count: 0, configured: false });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    // head:true + count:'exact' returns the count WITHOUT pulling any rows.
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.warn("count error:", error.message);
      return res.status(200).json({ count: 0 });
    }
    return res.status(200).json({ count: count ?? 0, configured: true });
  } catch (err) {
    console.warn("count exception:", err?.message);
    return res.status(200).json({ count: 0 });
  }
}
