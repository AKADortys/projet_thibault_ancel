import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies?.refreshToken;

    if (!token) {
      throw new HttpException(
        'Accès refusé. Token manquant.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Décoder le token sans vérifier la signature pour récupérer les données
      const decoded: any = jwt.decode(token);

      if (!decoded || !decoded.exp) {
        throw new HttpException('Token invalide', HttpStatus.UNAUTHORIZED);
      }

      // Vérifier si le token est expiré
      const now = Math.floor(Date.now() / 1000); // En secondes
      if (decoded.exp < now) {
        if (!refreshToken) {
          throw new HttpException(
            'Le token est expiré et aucun refreshToken n’est disponible.',
            HttpStatus.UNAUTHORIZED,
          );
        }

        // Rafraîchir le token
        const newToken = await this.refreshToken(refreshToken);
        if (!newToken) {
          throw new HttpException(
            'Impossible de rafraîchir le token.',
            HttpStatus.UNAUTHORIZED,
          );
        }

        // Envoyer le nouveau token dans un cookie
        res.cookie('accessToken', newToken, {
          httpOnly: true,
          secure: true, // Activez ceci si vous utilisez HTTPS
          sameSite: 'strict',
        });

        req.headers.authorization = `Bearer ${newToken}`;
      } else {
        // Si le token est encore valide, le vérifier
        jwt.verify(token, this.configService.get('JWT_SECRET'));
      }

      // Ajouter l'utilisateur dans la requête pour une utilisation ultérieure
      req.user = decoded.id;

      next();
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error.message);
      throw new HttpException(
        'Token invalide ou expiré.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async refreshToken(token: string): Promise<string | null> {
    try {
      // Vérifier la validité du refreshToken
      const decoded: any = jwt.verify(
        token,
        this.configService.get('JWT_SECRET'),
      );

      // Générer un nouveau accessToken
      const newAccessToken = jwt.sign(
        { id: decoded.id },
        this.configService.get('JWT_SECRET'),
        { expiresIn: '15m' },
      );

      return newAccessToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error.message);
      return null;
    }
  }
}
