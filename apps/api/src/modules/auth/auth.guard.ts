import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!this.authService.enabled) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token || !this.authService.verifyToken(token)) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }
    // EventSource cannot set headers, so the SSE endpoint accepts ?token=
    if (request.path.startsWith('/api/v1/sse') && typeof request.query.token === 'string') {
      return request.query.token;
    }
    return null;
  }
}
