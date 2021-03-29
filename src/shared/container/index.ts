import { container } from 'tsyringe';

import '@modules/accounts/providers';

import { ICategoriesRepository } from '@modules/cars/repositories/ICategoriesRepository';
import { CategoriesRepositoryPostgres } from '@modules/cars/infra/typeorm/repositories/postgres/CategoriesRepository';

import { ISpecificationRepository } from '@modules/cars/repositories/ISpecificationRepository';
import { SpecificationsRepositoryPostgres } from '@modules/cars/infra/typeorm/repositories/postgres/SpecificationRepository';

import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { UsersRepositoryPostgres } from '@modules/accounts/infra/typeorm/repositories/postgres/UsersRepository';

container.registerSingleton<ICategoriesRepository>(
  'CategoriesRepository',
  CategoriesRepositoryPostgres,
);

container.registerSingleton<ISpecificationRepository>(
  'SpecificationsRepository',
  SpecificationsRepositoryPostgres,
);

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepositoryPostgres,
);
