// Runs in the visitor's browser. Intercepts the form, POSTs to /api/join,
// shows success or an error message. No secrets here — this file is public.

const form = document.getElementById("join");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const button = document.getElementById("submit");
const msg = document.getElementById("msg");
const done = document.getElementById("done");
const doneLine = document.getElementById("done-line");

function showError(text) {
  msg.textContent = text;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  // Light client-side checks for instant feedback. The server checks again
  // properly — never trust the browser alone.
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

    if (!res.ok) {
      throw new Error(data.error || "something went wrong. try again.");
    }

    // Success: hide the form, show the stamp
    form.hidden = true;
    msg.textContent = "";
    document.querySelector(".fineprint").hidden = true;
    doneLine.textContent = `nice one, ${name.toLowerCase()}. we'll be in touch.`;
    done.hidden = false;
  } catch (err) {
    showError(err.message);
    button.disabled = false;
    button.textContent = "join the waitlist";
  }
});
