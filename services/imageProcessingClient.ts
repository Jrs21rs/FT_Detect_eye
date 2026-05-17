import { env } from '../config/env';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30000;

const buildUrl = (path: string) => `${env.imageProcessingBaseUrl}${path}`;

const parseResponseBody = async <T>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

export const imageProcessingClient = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...requestOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      ...requestOptions,
      headers,
      signal: controller.signal,
    });

    const data = await parseResponseBody<T & { message?: string; error?: string }>(response);

    if (!response.ok) {
      const message = data && typeof data === 'object'
        ? data.error || data.message || `Error del microservicio (${response.status})`
        : `Error del microservicio (${response.status})`;
      throw new Error(message);
    }

    return (data ?? ({} as T)) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('El procesamiento de la imagen tardó demasiado tiempo');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
