import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksClient from 'jwks-rsa';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookie } from '../types/index';

const jwksUri: string = Config.JWKS_URI!;

const getSecret: GetVerificationKey = jwksClient.expressJwtSecret({
  jwksUri,
  cache: true,
  rateLimit: true,
}) as unknown as GetVerificationKey;

export default expressjwt({
  secret: getSecret,
  algorithms: ['RS256'],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.split(' ')[1] !== undefined) {
      const token = authHeader.split(' ')[1];
      if (token) {
        return token;
      }
    }

    const { accessToken } = req.cookies as AuthCookie;
    return accessToken;
  },
});
