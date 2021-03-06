import { inject, injectable } from 'tsyringe';

import auth from '@config/auth';

import { AppError } from '@shared/infra/http/errors/AppError';
import { ITokenType } from '@shared/dtos/ITokenTypeDTO';

import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';

import { IHashProvider } from '@shared/container/providers/HashProvider/IHashProvider';
import { ITokenProvider } from '@shared/container/providers/TokenProvider/ITokenProvider';
import { IDateProvider } from '@shared/container/providers/DateProvider/IDateProvider';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: {
    name: string;
    email: string;
  };
  token: string;
  refresh_token: string;
}

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,

    @inject('TokenProvider')
    private tokenProvider: ITokenProvider,

    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    const {
      expires_in_token,
      expires_in_refresh_token,
      secret_refresh_token,
      secret_token,
      expires_refresh_token_days,
    } = auth;

    if (!user) {
      throw new AppError('Email or password incorrect');
    }

    const passwordMatch = await this.hashProvider.compareHash(
      password,
      user.password,
    );

    if (!passwordMatch) {
      throw new AppError('Email or password incorrect');
    }

    const token = this.tokenProvider.generateToken({
      secret: secret_token,
      subject: user.id,
      expiresIn: expires_in_token,
    });

    const refresh_token = this.tokenProvider.generateToken({
      secret: secret_refresh_token,
      payload: { email },
      subject: user.id,
      expiresIn: expires_in_refresh_token,
    });

    const refresh_token_expires_date = this.dateProvider.addDays(
      expires_refresh_token_days,
    );

    await this.usersTokensRepository.create({
      user_id: user.id,
      token: refresh_token,
      expires_date: refresh_token_expires_date,
      type: ITokenType.refresh_token,
    });

    const tokenReturn: IResponse = {
      token,
      user: {
        name: user.name,
        email: user.email,
      },
      refresh_token,
    };

    return tokenReturn;
  }
}

export { AuthenticateUserUseCase };
