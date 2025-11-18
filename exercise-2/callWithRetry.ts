// exercise-2/callWithRetry.ts

export interface AzureApiError {
  statusCode: number;
  message: string;
  retryAfter?: number;
}

export interface RetryOptions {

  maxAttempts?: number;
  baseDelayMs?: number;
  retryStatusCodes?: number[];

  logger?: {
    log?: (...args: any[]) => void;
    warn?: (...args: any[]) => void;
    error?: (...args: any[]) => void;
  };
}

interface AttemptDetail {
  attempt: number;
  statusCode?: number | undefined;
  message: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callWithRetry<T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    retryStatusCodes = [429, 500, 503],
    logger = console,
  } = options;

  const attempts: AttemptDetail[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Intento de ejecución
      const result = await apiCall();
      if (attempt > 1) {
        logger.log?.(
          `API call succeeded on attempt ${attempt}/${maxAttempts}`,
        );
      }
      return result;
    } catch (error: any) {
      const statusCode: number | undefined =
        error?.statusCode ?? error?.response?.status;

      let retryAfterSeconds: number | undefined = error?.retryAfter;

      const retryAfterHeader =
        error?.response?.headers?.['retry-after'] ??
        error?.response?.headers?.['Retry-After'];

      if (retryAfterHeader && retryAfterSeconds == null) {
        const parsed = Number(retryAfterHeader);
        if (!isNaN(parsed)) {
          retryAfterSeconds = parsed;
        }
      }

      const message: string = error?.message ?? 'Unknown error';

      attempts.push({
        attempt,
        statusCode,
        message,
      });

      const isRetryable =
        statusCode !== undefined && retryStatusCodes.includes(statusCode);

      if (!isRetryable || attempt === maxAttempts) {
        logger.error?.(
          `API call failed on attempt ${attempt}/${maxAttempts}. ` +
            `Status: ${statusCode ?? 'N/A'}, message: ${message}`,
        );

        const finalError = new Error(
          `Failed after ${attempt} attempt(s). Last error: ${message}`,
        );
        (finalError as any).attempts = attempts;
        (finalError as any).lastError = error;
        throw finalError;
      }

      const retryAfterMs =
        retryAfterSeconds != null ? retryAfterSeconds * 1000 : undefined;

      const backoffMs =
        retryAfterMs ?? baseDelayMs * Math.pow(2, attempt - 1); 

      logger.warn?.(
        `Retryable error on attempt ${attempt}/${maxAttempts}. ` +
          `Status: ${statusCode}. Retrying in ${backoffMs}ms...`,
      );

      await sleep(backoffMs);
    }
  }

  throw new Error('Unexpected retry flow reached');
}
