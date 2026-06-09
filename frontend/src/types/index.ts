// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// API types
export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
