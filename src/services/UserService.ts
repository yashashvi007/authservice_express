import { Brackets, Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData, UserQueryParams } from '../types/index';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password, role, tenantId }: UserData) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const err = createHttpError(400, 'Email already in use');
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const userData: Partial<User> = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      };

      if (typeof tenantId === 'number') {
        // TypeORM allows setting relations with just { id } - this is safe at runtime
        userData.tenant = { id: tenantId } as User['tenant'];
      }

      return await this.userRepository.save(userData);
    } catch {
      const err = createHttpError(500, 'Failed to create user in database');
      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id }, relations: { tenant: true } });
  }

  async getAllUsers(validatedData: UserQueryParams): Promise<[User[], number]> {
    const { perPage, currentPage, q, role } = validatedData;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (q) {
      const searchTerm = `%${q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where(
            '(user.firstName ILike :searchTerm OR user.lastName ILike :searchTerm OR user.email ILike :searchTerm)',
            { searchTerm },
          );
        }),
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    const result = await queryBuilder
      .skip((currentPage - 1) * perPage)
      .take(perPage)
      .orderBy('user.id', 'DESC')
      .getManyAndCount();
    return result;
  }
}
