import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, next: NextFunction) {
    const token =
      req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new HttpException(
        'Accès refusé. Token manquant.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Vérifier le token JWT
      console.log(process.env.JWT_SECRET);
      jwt.verify(token, this.configService.get('JWT_SECRET') || 'production');
      console.log('Authenticated');

      // Passer à la prochaine fonction middleware ou route
      next();
    } catch (error) {
      throw new HttpException(
        'Token invalide ou expiré',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
