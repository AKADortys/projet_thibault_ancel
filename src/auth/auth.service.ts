import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    private readonly jwtService: JwtService,
    private readonly customersService: CustomersService,
    private readonly configService: ConfigService,
  ) {}

  private handleError(message: string, status: HttpStatus): never {
    this.logger.error(message);
    throw new HttpException(message, status);
  }

  async validateUser(mail: string): Promise<any> {
    const customer = await this.customersService.findByMail(mail);

    if (!customer) {
      this.handleError('utilisateur introuvable', HttpStatus.NOT_FOUND);
    }

    return customer;
  }

  async comparePassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (err) {
      this.handleError(
        'Erreur lors de la vérification du mot de passe',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(email: string, password: string, res: Response): Promise<any> {
    try {
      const user = await this.validateUser(email);

      const isPasswordValid = await this.comparePassword(
        user.password,
        password,
      );

      if (!isPasswordValid) {
        this.handleError('Mot de passe incorrect', HttpStatus.UNAUTHORIZED);
      }
      // Génération des tokens
      const accessToken = this.jwtService.sign(
        { id: user._id, role: user.role },
        { expiresIn: '15m' },
      );
      const refreshToken = this.jwtService.sign(
        { id: user._id },
        { expiresIn: '7d' },
      );

      // Stockage des tokens dans les cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: this.configService.get('COOKIE_SECURE'),
        maxAge: 1000 * 60 * 15,
        sameSite: 'strict',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: this.configService.get('COOKIE_SECURE'),
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'strict',
      });

      const response = { ...user };
      delete response.password;
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Connexion réussie',
        user: response,
      };
    } catch (error) {
      this.handleError(
        'Erreur lors de la connexion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
