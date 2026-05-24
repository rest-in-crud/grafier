class HttpError extends Error {
  constructor(
    public status: number,
    public body?: unknown,
  ) {
    super(`HTTP ${status}`);
  }
}

type CreateApiClientOptions = {
  baseUrl: string;
  getToken: () => string | null;
  onRefresh: () => Promise<void>;
  onUnauthorized: () => void;
};

type RequestOptions = {
  skipAuthRefresh?: boolean;
  token?: string;
};

const createApiClient = (options: CreateApiClientOptions) => {
  let refreshPromise: Promise<void> | null = null;

  const request = async (
    method: string,
    path: string,
    body?: unknown,
    requestOptions?: RequestOptions,
  ) => {
    const token = requestOptions?.token ?? options.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${options.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (response.status === 401 && !requestOptions?.skipAuthRefresh) {
      if (!refreshPromise) {
        refreshPromise = options.onRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      try {
        await refreshPromise;
      } catch {
        options.onUnauthorized();
        throw new HttpError(401, null);
      }

      return request(method, path, body, { skipAuthRefresh: true });
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new HttpError(response.status, errorBody);
    }

    if (response.status === 204) {
      return undefined;
    }

    return response.json();
  };

  return {
    get: (path: string, requestOptions?: RequestOptions) =>
      request('GET', path, undefined, requestOptions),
    post: (path: string, body?: unknown, requestOptions?: RequestOptions) =>
      request('POST', path, body, requestOptions),
    put: (path: string, body?: unknown, requestOptions?: RequestOptions) =>
      request('PUT', path, body, requestOptions),
    patch: (path: string, body?: unknown, requestOptions?: RequestOptions) =>
      request('PATCH', path, body, requestOptions),
    delete: (path: string, requestOptions?: RequestOptions) =>
      request('DELETE', path, undefined, requestOptions),
  };
};

export { createApiClient, HttpError };
