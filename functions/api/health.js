import { makeJsonResponse } from "./_shared.js";

export async function onRequest() {
  return makeJsonResponse({ status: "ok", service: "OTP/Password Fullstack API" });
}
