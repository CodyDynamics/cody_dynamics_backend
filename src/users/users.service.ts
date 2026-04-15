import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(params: {
    email: string;
    passwordHash: string;
    name?: string | null;
  }): Promise<User> {
    const user = this.usersRepo.create({
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      name: params.name?.trim() || null,
    });
    return this.usersRepo.save(user);
  }
}
