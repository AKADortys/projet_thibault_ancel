import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly customersService: CustomersService,
  ) {}

  async validateUser(mail: string): Promise<any> {
    const customer = await this.customersService.findByMail(mail);

    if (!customer) {
      throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
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
      throw new HttpException(
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
        throw new HttpException(
          'Mot de passe incorrect',
          HttpStatus.UNAUTHORIZED,
        );
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
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 15,
        sameSite: 'strict',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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
      console.error(error);
      throw new HttpException(
        'Erreur interne lors de la connexion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
