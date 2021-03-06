import { User } from '@modules/accounts/infra/typeorm/entities/User';

import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';

interface IUsersRepository {
  create(data: ICreateUserDTO): Promise<void>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(user_id: string): Promise<User | undefined>;
}

export { IUsersRepository };
