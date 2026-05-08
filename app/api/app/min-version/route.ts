// app/api/app/min-version/route.ts
// Minimum-required-version gate for the Crow's Eye mobile app.
//
// The mobile app fetches this on launch and compares its own app.json
// version (via Constants.expoConfig.version) against `minVersion`. If the
// app's version is below the minimum, the mobile client shows a full-
// screen "Update Required" modal that the user can't dismiss — only path
// forward is the Play Store.
//
// Configuration:
//   OCWS_MIN_APP_VERSION    — semver string of the minimum required version
//                             (e.g. "2.0.21"). Default "0.0.0" means no
//                             enforcement (every app passes the gate).
//   OCWS_LATEST_APP_VERSION — informational latest version (defaults to
//                             min if unset). Currently unused by the
//                             client but useful for analytics.
//
// To force everyone to update to a new release: set OCWS_MIN_APP_VERSION
// in the Vercel project's production environment, redeploy. All apps
// fetching this endpoint after the deploy land on the modal.
//
// Fail-open contract: this endpoint is best-effort. Mobile clients
// silently skip the check if the request fails, the server is offline,
// or the response is malformed — we never want to brick the app because
// a server hiccup. The only path that triggers the modal is a successful
// 200 response with a `minVersion` greater than the client's own version.

export const runtime = "nodejs";

const MIN_VERSION    = process.env.OCWS_MIN_APP_VERSION    || "0.0.0";
const LATEST_VERSION = process.env.OCWS_LATEST_APP_VERSION || MIN_VERSION;
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.oldcrowswireless.crowseye";

export async function GET() {
  return Response.json({
    minVersion:    MIN_VERSION,
    latestVersion: LATEST_VERSION,
    playStoreUrl:  PLAY_STORE_URL,
    // Reserved for future expansion — the client currently always treats
    // a below-min version as a hard force-update. If we later want a
    // soft-recommendation banner instead, the server can flip this to
    // false and the client can show non-blocking UI.
    forceUpdate:   true,
  });
}
