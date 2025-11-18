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
