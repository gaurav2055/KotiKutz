import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase-admin";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"KotiKutz" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send to", to, err);
  }
}

export async function getUserEmailAndPrefs(userId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("email, first_name, notification_preferences")
    .eq("id", userId)
    .single();
  return {
    email: data?.email ?? null,
    name: data?.first_name ?? "there",
    prefs: {
      booking: true,
      reminder: true,
      cancellation: true,
      offers: true,
      ...(data?.notification_preferences as Record<string, boolean> ?? {}),
    },
  };
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

function wrapper(body: string) {
  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
<div style="border-bottom:3px solid #00ff2a;padding-bottom:12px;margin-bottom:24px">
  <span style="font-size:22px;font-weight:bold;letter-spacing:1px">KotiKutz</span>
</div>
${body}
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999">
  KotiKutz Premium Barbershop &bull; <a href="https://kotikutz.com" style="color:#999">kotikutz.com</a>
</div>
</body></html>`;
}

export function bookingConfirmationEmail(p: {
  name: string; date: string; time: string;
  location: string; services: string; price: string;
}) {
  return {
    subject: "Your KotiKutz appointment is confirmed ✓",
    html: wrapper(`
<p>Hi ${p.name},</p>
<p>Your appointment has been <strong>confirmed</strong>. Here are the details:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:40%">Date</td><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${formatDate(p.date)}</strong></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Time</td><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${p.time}</strong></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Location</td><td style="padding:8px 0;border-bottom:1px solid #eee">${p.location}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Services</td><td style="padding:8px 0;border-bottom:1px solid #eee">${p.services}</td></tr>
  <tr><td style="padding:8px 0;color:#666">Total</td><td style="padding:8px 0"><strong>${p.price}</strong></td></tr>
</table>
<p>See you soon!</p>`),
  };
}

export function cancellationEmail(p: {
  name: string; date: string; time: string; location: string;
}) {
  return {
    subject: "Your KotiKutz appointment has been cancelled",
    html: wrapper(`
<p>Hi ${p.name},</p>
<p>Your appointment has been <strong>cancelled</strong>:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:40%">Date</td><td style="padding:8px 0;border-bottom:1px solid #eee">${formatDate(p.date)}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Time</td><td style="padding:8px 0;border-bottom:1px solid #eee">${p.time}</td></tr>
  <tr><td style="padding:8px 0;color:#666">Location</td><td style="padding:8px 0">${p.location}</td></tr>
</table>
<p>We hope to see you again soon. <a href="https://kotikutz.com/appointments" style="color:#0c8ce9">Book a new appointment</a>.</p>`),
  };
}

export function reminderEmail(p: {
  name: string; date: string; time: string; location: string; services: string;
}) {
  return {
    subject: "Reminder: Your KotiKutz appointment is tomorrow",
    html: wrapper(`
<p>Hi ${p.name},</p>
<p>Just a reminder — you have an appointment <strong>tomorrow</strong>:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:40%">Date</td><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${formatDate(p.date)}</strong></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Time</td><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${p.time}</strong></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Location</td><td style="padding:8px 0;border-bottom:1px solid #eee">${p.location}</td></tr>
  <tr><td style="padding:8px 0;color:#666">Services</td><td style="padding:8px 0">${p.services}</td></tr>
</table>
<p>See you tomorrow!</p>`),
  };
}

export function offerEmail(p: {
  name: string; title: string; description: string; bulletPoints?: string[];
}) {
  const bullets = p.bulletPoints?.filter(Boolean)
    .map(b => `<li style="margin:4px 0">${b}</li>`).join("") ?? "";
  return {
    subject: `New offer from KotiKutz: ${p.title}`,
    html: wrapper(`
<p>Hi ${p.name},</p>
<p>We have an exciting new offer for you!</p>
<h2 style="font-size:20px;margin:16px 0 8px">${p.title}</h2>
${p.description ? `<p>${p.description}</p>` : ""}
${bullets ? `<ul style="padding-left:20px;margin:12px 0">${bullets}</ul>` : ""}
<p style="margin-top:24px"><a href="https://kotikutz.com/appointments" style="background:#00ff2a;color:#000;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Book Now</a></p>`),
  };
}
