import { JwtPayload, Secret, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entity/RefreshToken';

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      // Resolve path relative to project root, works in both src/ and dist/ directories
      const certsPath = path.resolve(process.cwd(), 'certs', 'private.pem');
      privateKey = fs.readFileSync(certsPath);
    } catch (error) {
      const err = createHttpError(
        500,
        `Failed to read private key: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw err;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-service',
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET as Secret, {
      algorithm: 'HS256',
      expiresIn: '1d',
      issuer: 'auth-service',
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expires_at: new Date(Date.now() + MS_IN_YEAR),
    });
    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepository.delete(tokenId);
  }
}
