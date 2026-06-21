// Runs in the visitor's browser. Intercepts the form, POSTs to /api/join,
// shows success or an error message. Also loads the live signup counter.
// No secrets here — this file is public.

const form = document.getElementById("join");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const button = document.getElementById("submit");
const msg = document.getElementById("msg");
const countEl = document.getElementById("count");
const done = document.getElementById("done");
const doneLine = document.getElementById("done-line");
const foundingCta = document.getElementById("founding-cta");

const FOUNDING_CAP = 100;
let lastCount = 0;

function showError(text) {
  msg.textContent = text;
}

function renderCount(n) {
  lastCount = n;
  if (n < FOUNDING_CAP) {
    const left = FOUNDING_CAP - n;
    countEl.innerHTML = `<b>${left}</b> founding ${left === 1 ? "spot" : "spots"} left`;
  } else {
    countEl.textContent = `join ${n.toLocaleString()} music fans on the list`;
  }
}

async function loadCount() {
  try {
    const r = await fetch("/api/count");
    const { count } = await r.json();
    if (typeof count === "number") renderCount(count);
  } catch {
    /* counter is non-critical — fail silently */
  }
}

// "claim your spot" scrolls back up to the form
if (foundingCta) {
  foundingCta.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => nameInput.focus(), 400);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name) return showError("what's your first name?");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return showError("that email doesn't look right.");

  button.disabled = true;
  button.textContent = "adding you…";

  try {
    const res = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "something went wrong. try again.");

    form.hidden = true;
    msg.textContent = "";
    document.querySelector(".fineprint").hidden = true;
    renderCount(lastCount + 1); // optimistic bump
    doneLine.textContent = `nice one, ${name.toLowerCase()}. we'll be in touch.`;
    done.hidden = false;
  } catch (err) {
    showError(err.message);
    button.disabled = false;
    button.textContent = "join the waitlist";
  }
});

loadCount();
