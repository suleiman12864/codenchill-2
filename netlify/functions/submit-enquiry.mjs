const MAX_BODY_LENGTH = 20_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const readRequiredSettings = () => {
  const settings = {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
    whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    whatsappTemplateName: process.env.WHATSAPP_TEMPLATE_NAME,
  };
  const missing = Object.entries(settings)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  return { settings, missing };
};

const sendEmail = async ({ apiKey, from, to, replyTo, subject, text, html }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
};

const sendWhatsAppConfirmation = async ({ accessToken, phoneNumberId, templateName, to, name, websiteType }) => {
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0";
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to.replace(/^\+/, ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en" },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: name },
            { type: "text", text: websiteType },
          ],
        }],
      },
    }),
  });
  if (!response.ok) throw new Error(`WhatsApp provider returned ${response.status}`);
};

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Use POST to submit a project enquiry." });
  }

  if (!event.body || event.body.length > MAX_BODY_LENGTH) {
    return jsonResponse(413, { error: "The enquiry is empty or too large. Please shorten it and try again." });
  }

  let enquiry;
  try {
    enquiry = JSON.parse(event.body);
  } catch {
    return jsonResponse(400, { error: "The enquiry could not be read. Please check the form and try again." });
  }

  if (!enquiry || typeof enquiry !== "object" || Array.isArray(enquiry)) {
    return jsonResponse(400, { error: "The enquiry details are invalid." });
  }
  const name = typeof enquiry.name === "string" ? enquiry.name.trim() : "";
  const email = typeof enquiry.email === "string" ? enquiry.email.trim() : "";
  const whatsapp = typeof enquiry.whatsapp === "string" ? enquiry.whatsapp.trim() : "";
  const service = typeof enquiry.service === "string" ? enquiry.service.trim() : "";
  const websiteType = typeof enquiry.websiteType === "string" ? enquiry.websiteType.trim() : "";
  const message = typeof enquiry.message === "string" ? enquiry.message.trim() : "";
  const details = Array.isArray(enquiry.details) ? enquiry.details : [];

  if (!name || name.length > 120 || !EMAIL_PATTERN.test(email) || email.length > 254) {
    return jsonResponse(400, { error: "Enter your name and a valid email address." });
  }
  if (!PHONE_PATTERN.test(whatsapp)) {
    return jsonResponse(400, { error: "Enter your WhatsApp number in international format, starting with +." });
  }
  if (!service || service.length > 120 || !websiteType || websiteType.length > 120 || !message || message.length > 5_000) {
    return jsonResponse(400, { error: "Complete the project details and try again." });
  }
  if (!enquiry.contactConsent || details.length > 12) {
    return jsonResponse(400, { error: "Please confirm contact consent and check the project details." });
  }
  const safeDetails = details
    .filter((detail) => detail && typeof detail.question === "string" && typeof detail.answer === "string")
    .map(({ question, answer }) => ({
      question: question.slice(0, 200),
      answer: answer.trim().slice(0, 2_000),
    }));
  if (safeDetails.length !== details.length) {
    return jsonResponse(400, { error: "One or more project-specific answers are invalid." });
  }

  const { settings, missing } = readRequiredSettings();
  if (missing.length) {
    return jsonResponse(503, {
      error: "The enquiry service is not fully configured yet. Please try again later or contact the developer directly.",
      missingConfiguration: missing,
    });
  }

  const recipient = process.env.CONTACT_TO_EMAIL || "maestra7586@gmail.com";
  if (!EMAIL_PATTERN.test(recipient)) {
    return jsonResponse(500, { error: "The enquiry service has an invalid studio email configuration." });
  }

  const projectLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `WhatsApp: ${whatsapp}`,
    `Service: ${service}`,
    `Website type: ${websiteType}`,
    ...safeDetails.map(({ question, answer }) => `${question}: ${answer}`),
    `Additional message: ${message}`,
  ];
  const ownerText = `New project enquiry\n\n${projectLines.join("\n")}`;
  const ownerHtml = `<h1>New project enquiry</h1><dl>${projectLines.map((line) => {
    const separator = line.indexOf(": ");
    return `<dt><strong>${escapeHtml(line.slice(0, separator))}</strong></dt><dd>${escapeHtml(line.slice(separator + 2))}</dd>`;
  }).join("")}</dl>`;
  const customerText = `Hi ${name},\n\nThanks for reaching out about your ${websiteType.toLowerCase()}. Your project enquiry has been received. I'll review the details and get back to you as soon as possible.\n\n— Code N Chill`;
  const customerHtml = `<p>Hi ${escapeHtml(name)},</p><p>Thanks for reaching out about your ${escapeHtml(websiteType.toLowerCase())}. Your project enquiry has been received. I'll review the details and get back to you as soon as possible.</p><p>— Code N Chill</p>`;

  const notifications = await Promise.allSettled([
    sendEmail({
      apiKey: settings.resendApiKey,
      from: settings.fromEmail,
      to: recipient,
      replyTo: email,
      subject: `New ${websiteType} enquiry — ${name}`,
      text: ownerText,
      html: ownerHtml,
    }),
    sendEmail({
      apiKey: settings.resendApiKey,
      from: settings.fromEmail,
      to: email,
      replyTo: recipient,
      subject: "We received your project enquiry",
      text: customerText,
      html: customerHtml,
    }),
    sendWhatsAppConfirmation({
      accessToken: settings.whatsappAccessToken,
      phoneNumberId: settings.whatsappPhoneNumberId,
      templateName: settings.whatsappTemplateName,
      to: whatsapp,
      name,
      websiteType,
    }),
  ]);

  const notificationStatus = {
    studioEmail: notifications[0].status === "fulfilled" ? "sent" : "failed",
    customerEmail: notifications[1].status === "fulfilled" ? "sent" : "failed",
    whatsapp: notifications[2].status === "fulfilled" ? "sent" : "failed",
  };

  if (notifications.some((notification) => notification.status === "rejected")) {
    console.error("Project enquiry notification delivery failed", notificationStatus);
    return jsonResponse(502, {
      error: "We received your enquiry, but some notifications could not be delivered. Please email maestra7586@gmail.com to confirm your request.",
      notifications: notificationStatus,
    });
  }

  return jsonResponse(200, { ok: true, notifications: notificationStatus });
};
