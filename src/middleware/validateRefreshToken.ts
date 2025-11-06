import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { AuthCookie } from '../types/index';
import { AppDataSource } from '../data-source';
import { RefreshToken } from '../entity/RefreshToken';
import logger from '../config/logger';
import { Request } from 'express';
import { Secret, Jwt, JwtPayload } from 'jsonwebtoken';

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET as Secret,
  algorithms: ['HS256'],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
  async isRevoked(req: Request, token: Jwt | undefined) {
    try {
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const payload = token?.payload as JwtPayload | undefined;
      const refreshToken = await refreshTokenRepository.findOne({
        where: {
          id: Number(payload?.id),
          user: { id: Number(payload?.sub) },
        },
      });

      return refreshToken === null;
    } catch {
      const payload = token?.payload as JwtPayload | undefined;
      logger.error('Error while getting the refresh token', {
        id: Number(payload?.id),
      });
    }

    return true;
  },
});
