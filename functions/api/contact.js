/* Contact form endpoint -- Cloudflare Pages Function, served at /api/contact.
 *
 * Receives the enquiry from the website, checks it, and hands it to Brevo,
 * which emails it to the company inbox. Nothing is stored here.
 *
 * Settings (Cloudflare -> Workers & Pages -> energy-experts -> Settings ->
 * Variables and Secrets). Until BREVO_API_KEY is set the form stays off and
 * visitors are shown the email address instead.
 *   BREVO_API_KEY    secret   Brevo API key
 *   MAIL_TO          text     inbox that receives enquiries, e.g. info@energyexpertsbv.com
 *   MAIL_FROM        text     sender on the authenticated domain, e.g. website@energyexpertsbv.com
 *   ALLOWED_ORIGINS  text     comma-separated, e.g. https://energyexpertsbv.com,https://www.energyexpertsbv.com
 */

const LIMITS = { name: 100, company: 150, email: 200, phone: 40, service: 120, message: 5000 };
const MIN_FILL_MS = 3000;            // humans take longer than this to fill the form
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
const oneLine = (v) => v.replace(/[\r\n]+/g, " ");

export async function onRequestPost({ request, env }) {
  if (!env.BREVO_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) return json(503, { ok: false, error: "not-configured" });

  // only accept submissions made from the website itself
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = request.headers.get("origin") || "";
  if (allowed.length && !allowed.includes(origin)) return json(403, { ok: false, error: "origin" });

  if (!(request.headers.get("content-type") || "").includes("application/json")) return json(415, { ok: false, error: "type" });
  if (Number(request.headers.get("content-length") || 0) > 20000) return json(413, { ok: false, error: "size" });

  let d;
  try { d = await request.json(); } catch { return json(400, { ok: false, error: "json" }); }

  // spam traps: a hidden field humans never fill, and a minimum time on the page
  if (d.website) return json(200, { ok: true });
  if (typeof d.elapsed === "number" && d.elapsed < MIN_FILL_MS) return json(200, { ok: true });

  const f = {
    first: oneLine(clean(d.first, LIMITS.name)),
    last: oneLine(clean(d.last, LIMITS.name)),
    company: oneLine(clean(d.company, LIMITS.company)),
    email: oneLine(clean(d.email, LIMITS.email)),
    phone: oneLine(clean(d.phone, LIMITS.phone)),
    service: oneLine(clean(d.service, LIMITS.service)),
    message: clean(d.message, LIMITS.message),
    lang: ["en", "fr", "nl"].includes(d.lang) ? d.lang : "en",
  };
  if (!f.first || !EMAIL_RE.test(f.email) || !f.message || d.consent !== true) return json(422, { ok: false, error: "invalid" });

  const name = [f.first, f.last].filter(Boolean).join(" ");
  const text = [
    "New enquiry from the website",
    "",
    "Name:     " + name,
    "Company:  " + (f.company || "-"),
    "Email:    " + f.email,
    "Phone:    " + (f.phone || "-"),
    "Service:  " + (f.service || "-"),
    "Language: " + f.lang.toUpperCase(),
    "",
    "Message:",
    f.message,
    "",
    "--",
    "The sender agreed to the privacy policy. Reply to this email to answer them directly.",
  ].join("\n");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Energy Experts website", email: env.MAIL_FROM },
      to: [{ email: env.MAIL_TO }],
      replyTo: { email: f.email, name },
      subject: "Website enquiry: " + name + (f.company ? " (" + f.company + ")" : ""),
      textContent: text,
    }),
  });
  if (!res.ok) return json(502, { ok: false, error: "send" });
  return json(200, { ok: true });
}

export const onRequest = () => json(405, { ok: false, error: "method" });
