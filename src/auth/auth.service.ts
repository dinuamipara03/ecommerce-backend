import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async register(userDto: UserDto) {
    const existing = await this.userRepo.findOne({ where: { email: userDto.email } });
    if (existing) throw new ConflictException('Email already exists');

    const user = this.userRepo.create(userDto);
    await this.userRepo.save(user);

    const { ...result } = user;   //  const {password, ...result } = user; omit password
    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email, password } });
    if (!user) throw new NotFoundException('Invalid email or password');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      token,
    };
  }

  async getCurrentUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { ...rest } = user;
    return rest;
  }
}
