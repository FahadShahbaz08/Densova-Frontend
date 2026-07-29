const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function resolveApiOrigin(rawUrl) {
  const normalized = rawUrl.trim().replace(/\/\/+/g, "/");
  try {
    return new URL(rawUrl).origin;
  } catch {
    const fallback = rawUrl.startsWith("http") ? rawUrl : `http://${rawUrl}`;
    try {
      return new URL(fallback).origin;
    } catch {
      return "http://localhost:8000";
    }
  }
}

const BACKEND_ORIGIN = resolveApiOrigin(apiUrl);

export function resolveImageUrl(src) {
  if (!src) return src;
  const trimmed = String(src).trim();
  if (!trimmed) return trimmed;

  if (/^(data:|https?:\/\/)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^:\d+\//.test(trimmed) && typeof window !== "undefined") {
    const parsed = new URL(BACKEND_ORIGIN);
    return `${parsed.protocol}//${parsed.hostname}${trimmed}`;
  }

  if (/^\/\//.test(trimmed)) {
    return `${window.location.protocol}${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }

  return `${BACKEND_ORIGIN}/${trimmed}`;
}
