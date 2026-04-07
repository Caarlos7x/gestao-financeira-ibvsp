import { HttpError, type HttpClient, type HttpMethod } from '@/services/api/httpClient';

type CreateFetchHttpClientParams = {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
};

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function createFetchHttpClient({
  baseUrl,
  defaultHeaders = {},
}: CreateFetchHttpClientParams): HttpClient {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return {
    async request<TResponse>(
      path: string,
      init: { method: HttpMethod; body?: unknown }
    ): Promise<TResponse> {
      const url = `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
      const headers: Record<string, string> = { ...defaultHeaders };

      let body: string | undefined;
      if (init.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(init.body);
      }

      const response = await fetch(url, {
        method: init.method,
        headers,
        body,
      });

      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new HttpError('Request failed', response.status, payload);
      }

      return payload as TResponse;
    },
  };
}
