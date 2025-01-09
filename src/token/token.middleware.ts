import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new HttpException(
        'Accès refusé. Token manquant.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const decoded: any = jwt.verify(
        token,
        this.configService.get('JWT_SECRET'),
      );

      // Vérification de l'expiration (ajusté pour une meilleure lisibilité)
      const expirationTime = new Date(decoded.exp * 1000);
      const now = new Date();
      if (now >= expirationTime) {
        throw new HttpException('Token expiré', HttpStatus.UNAUTHORIZED);
      }
      req.user = decoded.id; // Ajout du user à la requête pour le middleware suivant

      next();
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      throw new HttpException('Token invalide', HttpStatus.UNAUTHORIZED);
    }
  }
}
