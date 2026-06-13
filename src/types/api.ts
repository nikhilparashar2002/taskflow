export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

/** Shape of the JWT payload signed at login. */
export interface JwtPayload {
  userId: string;
  email: string;
}
