import { Category } from '@modules/cars/infra/typeorm/entities/Category';
import { ICategoriesRepository } from '@modules/cars/repositories/ICategoriesRepository';
import { ICreateCategoryDTO } from '@modules/cars/dtos/ICreateCategoryDTO';

class CategoriesRepositoryInMemory implements ICategoriesRepository {
  categories: Category[] = [];

  async findByName(name: string): Promise<Category> {
    const category = this.categories.find(category => category.name === name);

    return category;
  }

  async list(): Promise<Category[]> {
    const categories = this.categories;

    return categories;
  }

  async create({ name, description }: ICreateCategoryDTO): Promise<void> {
    const category = new Category();

    Object.assign(category, {
      name,
      description,
    });

    this.categories.push(category);
  }
}

export { CategoriesRepositoryInMemory };