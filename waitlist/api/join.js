// Serverless function — runs on Vercel's servers, NOT in the browser.
// This is the only place the secret Resend key is allowed to live.
//
// Flow:
//   1. validate name + email
//   2. add the person to your Resend "audience" (so you can email updates later)
//   3. send them a "you're in" welcome email
//
// Secrets come from environment variables you set in the Vercel dashboard.
// They are never written in this file and never sent to the browser.

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// The audience your contacts get added to (create one in the Resend dashboard).
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

// Who the email comes "from". Until justgigly.com is verified in Resend you
// must use onboarding@resend.dev (and can only email yourself). Once verified,
// set WAITLIST_FROM to something like "gigly <hello@justgigly.com>".
const FROM = process.env.WAITLIST_FROM || "gigly <onboarding@resend.dev>";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email } = req.body || {};
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

    // Server-side validation (the real gatekeeper)
    if (!cleanName || cleanName.length > 80) {
      return res.status(400).json({ error: "Enter your first name." });
    }
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 200) {
      return res.status(400).json({ error: "Enter a valid email." });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return res.status(500).json({ error: "Server not configured yet." });
    }

    // 1. Add to the audience so you can send broadcast updates later.
    //    If they're already in it, Resend errors — we ignore that so a
    //    repeat signup doesn't look broken to the user.
    if (AUDIENCE_ID) {
      try {
        await resend.contacts.create({
          audienceId: AUDIENCE_ID,
          email: cleanEmail,
          firstName: cleanName,
          unsubscribed: false,
        });
      } catch (contactErr) {
        console.warn("contact create skipped:", contactErr?.message);
      }
    }

    // 2. Send the welcome email.
    await resend.emails.send({
      from: FROM,
      to: cleanEmail,
      subject: "you're on the list — gigly",
      text:
        `hey ${cleanName},\n\n` +
        `you're on the gigly waitlist. nice one.\n\n` +
        `gigly is a journal for live music — log every gig, rate it loved / mid / nah, ` +
        `and see how the crowd for your favourite artists really felt.\n\n` +
        `we're building it now. we'll send you a note the moment it's ready.\n\n` +
        `— gigly`,
      html: welcomeHtml(cleanName),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("join error:", err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}

function welcomeHtml(name) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#F4ECD8; padding:32px; color:#2B2018;">
    <div style="max-width:440px; margin:0 auto; background:#EFE3C8; border:1px solid rgba(58,46,34,0.15); border-radius:8px; padding:28px;">
      <div style="font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:#8B3A1F; font-family:'Courier New',monospace;">you're in</div>
      <h1 style="font-size:28px; margin:10px 0 16px; color:#2B2018;">nice one, ${escapeHtml(name)}.</h1>
      <p style="font-size:16px; line-height:1.5; color:#3A2E22; margin:0 0 14px;">
        you're on the gigly waitlist.
      </p>
      <p style="font-size:16px; line-height:1.5; color:#6B5A47; margin:0 0 14px;">
        gigly is a journal for live music — log every gig, rate it
        <b>loved / mid / nah</b>, and see how the crowd for your favourite
        artists really felt.
      </p>
      <p style="font-size:16px; line-height:1.5; color:#6B5A47; margin:0;">
        we're building it now. we'll send you a note the moment it's ready.
      </p>
      <p style="font-size:14px; color:#9A876E; margin:22px 0 0; font-style:italic;">— gigly</p>
    </div>
  </div>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
