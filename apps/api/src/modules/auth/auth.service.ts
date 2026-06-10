import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, createHash, timingSafeEqual } from 'crypto';
import { EncryptionService } from '../../common/crypto/encryption.service';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface TokenPayload {
  u: string;
  exp: number;
}

@Injectable()
export class AuthService {
  private secret: Buffer | null = null;

  constructor(
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) {}

  get enabled(): boolean {
    return Boolean(
      this.configService.get<string>('AUTH_USERNAME') &&
        this.configService.get<string>('AUTH_PASSWORD'),
    );
  }

  // Derived lazily so EncryptionService has loaded its key by first use
  private getSecret(): Buffer {
    if (!this.secret) {
      this.secret = this.encryptionService.hmac('queuepilot-auth-token-v1');
    }
    return this.secret;
  }

  login(username: string, password: string): { token: string; expiresAt: number } {
    const validUser = this.safeEquals(username, this.configService.get<string>('AUTH_USERNAME', ''));
    const validPass = this.safeEquals(password, this.configService.get<string>('AUTH_PASSWORD', ''));

    if (!validUser || !validPass) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: TokenPayload = { u: username, exp: Date.now() + TOKEN_TTL_MS };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `${body}.${this.sign(body)}`;
    return { token, expiresAt: payload.exp };
  }

  verifyToken(token: string): boolean {
    const [body, signature] = token.split('.');
    if (!body || !signature) return false;

    if (!this.safeEquals(signature, this.sign(body))) return false;

    try {
      const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      return typeof payload.exp === 'number' && payload.exp > Date.now();
    } catch {
      return false;
    }
  }

  private sign(body: string): string {
    return createHmac('sha256', this.getSecret()).update(body).digest('base64url');
  }

  // Constant-time comparison of variable-length strings
  private safeEquals(a: string, b: string): boolean {
    const hashA = createHash('sha256').update(a).digest();
    const hashB = createHash('sha256').update(b).digest();
    return timingSafeEqual(hashA, hashB);
  }
}
