import { Resend } from "resend";
import { getVenue } from "@/lib/rinks";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const from = process.env.EMAIL_FROM || "AJHL <noreply@example.com>";

export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.log("[Email not configured] To:", to, "Subject:", subject);
    return { ok: true };
  }
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

const ZELLE_EMAIL = "ajhl20@gmail.com";

export function getZellePaymentHtml(amount?: number, eventName?: string): string {
  const amountLine = amount != null ? `<p><strong>Amount: $${amount.toFixed(2)}</strong></p>` : "";
  const eventLine = eventName ? `<p>Event: ${eventName}</p>` : "";
  return `
    <p>Pay via Zelle to:</p>
    <p><strong>${ZELLE_EMAIL}</strong></p>
    ${amountLine}
    ${eventLine}
    <p>Please include your name and the event in the memo.</p>
  `;
}

/** Returns HTML block with address, phone, and Directions links (Google, Waze, Apple Maps). */
export function getDirectionsHtml(venueKey: string | null): string {
  const venue = getVenue(venueKey);
  if (!venue) return "";
  return `
    <p><strong>${venue.name}</strong><br/>
    ${venue.address}<br/>
    Phone: <a href="tel:${venue.phone.replace(/\D/g, "")}">${venue.phone}</a></p>
    <p><strong>Directions:</strong><br/>
    <a href="${venue.googleMapsUrl}">Google Maps</a> &nbsp;|&nbsp;
    <a href="${venue.wazeUrl}">Waze</a> &nbsp;|&nbsp;
    <a href="${venue.appleMapsUrl}">Apple Maps</a></p>
  `;
}

export async function sendPasswordResetCode(to: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const subject = "AJHL password reset code";
  const html = `
    <h2>Password reset</h2>
    <p>Your reset code is: <strong>${code}</strong></p>
    <p>Enter this code on the reset password page. The code expires in 1 hour.</p>
    <p>If you didn't request this, you can ignore this email.</p>
  `;
  return sendEmail(to, subject, html);
}

export async function sendWaitlistPromotedEmail(
  to: string,
  eventName: string,
  startTime: string,
  location: string,
  venueKey?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const subject = `You're in! Added to ${eventName}`;
  const directionsBlock = getDirectionsHtml(venueKey ?? null);
  const html = `
    <h2>You've been added to the event</h2>
    <p>You were on the waitlist and a spot opened up. You're now confirmed for:</p>
    <p><strong>${eventName}</strong></p>
    <p>When: ${startTime}</p>
    <p>Where: ${location}</p>
    ${directionsBlock}
    <p>See you there!</p>
  `;
  return sendEmail(to, subject, html);
}

export async function sendEventReminderEmail(
  to: string,
  eventName: string,
  startTime: string,
  location: string,
  venueKey?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const subject = `Reminder: ${eventName}`;
  const directionsBlock = getDirectionsHtml(venueKey ?? null);
  const html = `
    <h2>Event reminder</h2>
    <p>This is a reminder for your upcoming event:</p>
    <p><strong>${eventName}</strong></p>
    <p>When: ${startTime}</p>
    <p>Where: ${location}</p>
    ${directionsBlock}
    <p>See you there!</p>
  `;
  return sendEmail(to, subject, html);
}

export { ZELLE_EMAIL };
