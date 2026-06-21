# gigly waitlist

The landing page at justgigly.com. Plain HTML/CSS/JS + one Vercel serverless
function. Deployed as its own Vercel project (separate from the app), with
**Root Directory = `waitlist`**.

## How it works

```
visitor → index.html (form) → /api/join (serverless) → Resend
```

- `index.html` / `styles.css` / `join.js` — the public page (no secrets)
- `api/join.js` — server-side; the only place the Resend key is used
- secrets live in Vercel env vars, documented in `.env.example`

## Env vars (set in Vercel, not in git)

| var | where to get it |
| --- | --- |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_AUDIENCE_ID` | resend.com → Audiences → your audience |
| `WAITLIST_FROM` | leave unset until justgigly.com is verified in Resend |

## Local note

There's no build step — it's static files + a function. Vercel serves it as-is.
