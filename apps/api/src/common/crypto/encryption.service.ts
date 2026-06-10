import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv, createHmac } from 'crypto';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private key: Buffer;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // 1. ENCRYPTION_KEY from the environment or a .env file (ConfigModule
    //    reads both) always wins
    let hexKey = this.configService.get<string>('ENCRYPTION_KEY');

    // 2. Key file stored next to the database, so in Docker it lives on the
    //    data volume and survives container recreation (the old .env location
    //    was on the ephemeral container filesystem and lost on every rm/run)
    const keyFilePath = this.getKeyFilePath();
    if (!hexKey && existsSync(keyFilePath)) {
      hexKey = readFileSync(keyFilePath, 'utf-8').trim();
    }

    if (!hexKey) {
      hexKey = randomBytes(32).toString('hex');
      writeFileSync(keyFilePath, hexKey + '\n', { mode: 0o600 });
      console.log(`Generated new encryption key and saved to ${keyFilePath}`);
    }

    this.key = Buffer.from(hexKey, 'hex');
  }

  private getKeyFilePath(): string {
    const dbPath =
      this.configService.get<string>('DATABASE_PATH') ||
      join(process.cwd(), 'queuepilot.db');
    return join(dirname(dbPath), '.encryption-key');
  }

  hmac(data: string): Buffer {
    return createHmac('sha256', this.key).update(data).digest();
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(ciphertext: string): string {
    const data = Buffer.from(ciphertext, 'base64');
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
