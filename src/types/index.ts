import { Request } from 'express';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterRequest extends Request {
  body: UserData;
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
  };
}

export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};

export interface IRefreshToken {
  payload: {
    id: string;
  };
}

export interface ITenant {
  name: string;
  address: string;
}

export interface CreateTenantRequest extends Request {
  body: ITenant;
}
