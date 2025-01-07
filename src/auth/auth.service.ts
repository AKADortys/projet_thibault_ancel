import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly customersService: CustomersService) {}
  async validateUser(mail: string): Promise<string> {
    const customer = await this.customersService.findByMail(mail);

    if (!customer) {
      throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
    }

    return customer.password;
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
        err,
      );
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const hashedPassword = await this.validateUser(email); //Retrouve le client et renvoie son mdp

      const isPasswordValid = await this.comparePassword(
        hashedPassword,
        password,
      );

      if (!isPasswordValid) {
        throw new HttpException(
          'Mot de passe incorrect',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Connexion réussie',
      };
    } catch (error) {
      throw new HttpException(
        'Erreur interne lors de la connexion',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
