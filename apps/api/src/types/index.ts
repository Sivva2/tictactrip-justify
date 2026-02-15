export interface TokenPayload {
  email: string;
}

export interface TokenRecord {
  email: string;
  createdAt: Date;
}

export interface RateLimitRecord {
  wordCount: number;
  resetAt: Date;
}

export interface TokenRequest {
  email: string;
}

export interface TokenResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}
