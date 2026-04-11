import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private key: Buffer;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    let hexKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!hexKey) {
      const envPath = join(process.cwd(), '.env');
      if (existsSync(envPath)) {
        const content = readFileSync(envPath, 'utf-8');
        const match = content.match(/^ENCRYPTION_KEY=(.+)$/m);
        if (match) {
          hexKey = match[1];
        }
      }
    }

    if (!hexKey) {
      hexKey = randomBytes(32).toString('hex');
      const envPath = join(process.cwd(), '.env');
      const line = `ENCRYPTION_KEY=${hexKey}\n`;
      if (existsSync(envPath)) {
        const content = readFileSync(envPath, 'utf-8');
        writeFileSync(envPath, content + line);
      } else {
        writeFileSync(envPath, line);
      }
      console.log('Generated new encryption key and saved to .env');
    }

    this.key = Buffer.from(hexKey, 'hex');
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
