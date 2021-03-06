import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/infra/http/errors/AppError';

import { IRentalsRepository } from '@modules/rentals/repositories/IRentalsRepository';
import { ICarsRepository } from '@modules/cars/repositories/ICarsRepository';
import { IDateProvider } from '@shared/container/providers/DateProvider/IDateProvider';

import { IRequestDevolutionRentalDTO } from '@modules/rentals/dtos/IRequestDevolutionRentalDTO';
import { Rental } from '@modules/rentals/infra/typeorm/entities/Rental';

@injectable()
class DevolutionRentalUseCase {
  constructor(
    @inject('RentalsRepository')
    private rentalsRepository: IRentalsRepository,

    @inject('CarsRepository')
    private carsRepository: ICarsRepository,

    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  async execute({
    rental_id,
    user_id,
  }: IRequestDevolutionRentalDTO): Promise<Rental> {
    const minimum_daily = 1;

    const rental = await this.rentalsRepository.findById(rental_id);

    const car = await this.carsRepository.findById(rental.car_id);

    if (!rental) {
      throw new AppError('Rental not found', 404);
    }

    const dateNow = this.dateProvider.dateNow();

    let daily = this.dateProvider.compareInDays({
      start_date: rental.start_date,
      end_date: dateNow,
    });

    if (daily <= 0) {
      daily = minimum_daily;
    }

    const delay = this.dateProvider.compareInDays({
      start_date: dateNow,
      end_date: rental.expected_return_date,
    });

    let total = 0;

    if (delay > 0) {
      const calculate_fine = delay * car.fine_amount;
      total = calculate_fine;
    }

    total += daily * car.daily_rate;

    rental.end_date = dateNow;
    rental.total = total;

    await this.rentalsRepository.create(rental);

    await this.carsRepository.updateAvailable({
      car_id: car.id,
      available: true,
    });

    return rental;
  }
}

export { DevolutionRentalUseCase };
