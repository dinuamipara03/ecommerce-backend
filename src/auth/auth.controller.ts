import { Controller, Post, Body, Get, UseGuards, Req, Put, Param, Request, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserDto } from './dto/user.dto';
// import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

 @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Param('id') id: number, @Body() updateuserDto: UpdateUserDto, @Request() req) {
    return this.authService.updateProfile(id, updateuserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: any }) {
    return this.authService.getCurrentUser((req.user as any).id);
  }

 
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Headers('authorization') authHeader:string,
    @Body('newPassword') newPassword: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    const token = authHeader?.split(' ')[1];
    return this.authService.resetPassword(token, newPassword, confirmPassword);
  }


}
