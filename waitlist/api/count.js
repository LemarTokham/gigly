// Returns how many people are on the waitlist (size of the Resend audience).
// Cached at Vercel's edge for 60s so we don't hammer Resend on every visit.

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export default async function handler(req, res) {
  // Cache: serve the same number for 60s, refresh in the background after.
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  try {
    if (!AUDIENCE_ID || !process.env.RESEND_API_KEY) {
      return res.status(200).json({ count: 0 });
    }
    const { data, error } = await resend.contacts.list({ audienceId: AUDIENCE_ID });
    if (error) {
      console.warn("count error:", error);
      return res.status(200).json({ count: 0 });
    }
    // Resend returns { data: { data: [...] } }; be defensive about the shape.
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return res.status(200).json({ count: arr.length });
  } catch (err) {
    console.warn("count exception:", err);
    return res.status(200).json({ count: 0 });
  }
}
