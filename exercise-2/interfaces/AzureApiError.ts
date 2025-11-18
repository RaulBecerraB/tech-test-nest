export interface AzureApiError {
  statusCode: number;
  message: string;
  retryAfter?: number;
}
