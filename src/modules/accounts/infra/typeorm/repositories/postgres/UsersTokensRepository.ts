import { getRepository, Repository } from 'typeorm';

import { UserTokens } from '../../entities/UserTokens';

import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';

import { ICreateUserTokenDTO } from '@modules/accounts/dtos/ICreateUserTokenDTO';
import { IFindTokenByUserAndRefreshTokenDTO } from '@modules/accounts/dtos/IFindTokenByUserAndRefreshTokenDTO';
import { ITokenType } from '@shared/dtos/ITokenTypeDTO';

class UsersTokensRepositoryPostgres implements IUsersTokensRepository {
  private repository: Repository<UserTokens>;

  constructor() {
    this.repository = getRepository(UserTokens);
  }

  async create(data: ICreateUserTokenDTO): Promise<UserTokens> {
    const userToken = this.repository.create(data);

    await this.repository.save(userToken);

    return userToken;
  }

  async findByUserIdAndRefreshToken({
    user_id,
    refresh_token,
  }: IFindTokenByUserAndRefreshTokenDTO): Promise<UserTokens> {
    const usersTokens = await this.repository.findOne({
      user_id,
      token: refresh_token,
      type: ITokenType.refresh_token,
    });

    return usersTokens;
  }

  async deleteById(token_id: string): Promise<void> {
    await this.repository.delete(token_id);
  }

  async findByToken(token: string): Promise<UserTokens> {
    const userToken = this.repository.findOne({
      where: {
        refresh_token: token,
      },
    });

    return userToken;
  }
}

export { UsersTokensRepositoryPostgres };
