import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAllUsers() {
    try {
      const users = await this.userRepo.find({
        select: ['id', 'name', 'email', 'role'] // Exclude password
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await this.userRepo.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (user.role === 'ADMIN') {
        throw new InternalServerErrorException('Cannot delete admin users');
      }

      await this.userRepo.remove(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
