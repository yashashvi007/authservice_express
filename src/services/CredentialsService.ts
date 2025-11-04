import bcrypt from 'bcrypt';

export class CredentialService {
  async compare(userPassword: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(userPassword, passwordHash);
  }
}
