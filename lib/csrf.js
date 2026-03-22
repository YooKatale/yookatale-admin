/**
 * Double-Submit Cookie CSRF Protection
 *
 * Generates a cryptographically random token, stores it in a same-site cookie,
 * and provides a header value. Backend should verify cookie === header.
 */

const CSRF_COOKIE = "ykt_csrf";
const CSRF_HEADER = "x-csrf-token";

function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCsrfToken() {
  if (typeof document === "undefined") return "";

  // Check if token already exists in cookie
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  if (match) return match[1];

  // Generate new token and set as same-site strict cookie
  const token = generateToken();
  document.cookie = `${CSRF_COOKIE}=${token}; path=/; SameSite=Strict; Secure`;
  return token;
}

export function getCsrfHeader() {
  return { [CSRF_HEADER]: getCsrfToken() };
}

export { CSRF_HEADER, CSRF_COOKIE };
