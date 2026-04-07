export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpClient {
  request<TResponse>(
    path: string,
    init: { method: HttpMethod; body?: unknown }
  ): Promise<TResponse>;
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
