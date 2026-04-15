/**
 * Public API host (no trailing slash, no /api).
 * Used for <img src> and Socket.IO when VITE_SOCKET_URL is unset.
 *
 * Set VITE_API_URL on Vercel to your backend, e.g. https://api.yourapp.com/api
 * (with or without /api — both work). Redeploy after changing env vars.
 */
export function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
 if (!raw) {
  if (import.meta.env.PROD) {
    throw new Error(
      'VITE_API_URL is missing in production. Set it in Vercel environment variables.'
    );
  }
  return 'http://localhost:5000';
}

  const withProto = raw.startsWith('http') ? raw : `https://${raw}`;
  const noTrail = withProto.replace(/\/+$/, '');
  if (noTrail.endsWith('/api')) {
    return noTrail.slice(0, -4);
  }
  return noTrail;
}

/** Axios baseURL: origin + /api */
export function getAxiosBaseUrl(): string {
  return `${getApiOrigin()}/api`;
}
