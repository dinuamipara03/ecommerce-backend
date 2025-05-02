import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService
  ) {}

   

  async register(userDto: UserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: userDto.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    const user = this.userRepo.create(userDto);
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    user.password = hashedPassword;

    await this.userRepo.save(user);

    const { password, ...result } = user;
    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  async login(email: string, password: string) {
    try {
      // Explicitly select the password field
      const user = await this.userRepo.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'role'], // Include password explicitly
      });
      if (!user) throw new NotFoundException('Invalid email or password');
  
      // Debug logs (optional - remove in production)
      console.log('Provided password:', password);
      console.log('Stored password:', user.password);
  
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
  
      if (!isMatch) throw new NotFoundException('Invalid email or password');
  
      // Generate a JWT token
      const token = this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });
  
      return {
        message: 'Login successful',
        token,
      };
    } catch (error) {
      console.error('Error during login:', error.message, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Login failed');
    }
  }

  async getCurrentUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { password, ...rest } = user;
    return rest;
  }

  
  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: process.env.RESET_PASSWORD_SECRET,
      expiresIn: '15m',
    });

    await this.mailService.sendResetLink(email, token);
    return { message: 'Reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword)
      throw new BadRequestException('Passwords do not match');

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.RESET_PASSWORD_SECRET,
      });

      const user = await this.userRepo.findOne({ where: { email: payload.email } });
      if (!user) throw new NotFoundException('User not found');

      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepo.save(user);

      return { message: 'Password reset successful' };
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }
  }





  async findById(id: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async updateProfile(id:number,updateuserDto:UpdateUserDto){
        try {
          const user = await this.findById(id);
          
          if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
          }
          const existing = await this.userRepo.findOne({
            where: { email: updateuserDto.email },
          });
          if (existing) throw new ConflictException('Email already exists');
          
          const updatedUser = {
            ...user,
            ...updateuserDto
          };

          const result = await this.userRepo.save(updatedUser);
          
          return result;
        } catch (error) {
          console.error('Error updating user:', error);
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new InternalServerErrorException('Failed to update user');
        }
      
  }
}

