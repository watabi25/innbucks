import { makeJsonResponse, makeTextResponse, getDataStore } from "../../_shared.js";

export async function onRequest(context) {
  const { request, params } = context;
  if (request.method === "OPTIONS") return makeTextResponse("", 204);
  if (request.method !== "GET") return makeJsonResponse({ error: "Method not allowed" }, 405);

  const { requestId } = params;
  const store = getDataStore("otp");

  if (!store.has(requestId)) {
    return makeJsonResponse({ error: "Request not found" }, 404);
  }

  const requestData = store.get(requestId);
  return makeJsonResponse({
    approved: !!requestData.approved,
    rejected: !!requestData.rejectedReason,
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
