import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './auth.guard';
import { EmailService } from 'src/email/email.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly emailService: EmailService) {}

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() response: Response) {
        const result = await this.authService.login(loginDto);
        if (result.isErr()) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: result.error.message });
        }
        response.status(HttpStatus.OK).json(result.value);
    }

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res() response: Response) {
        const result = await this.authService.register(registerDto);
        if (result.isErr()) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: result.error.message });
        }
        this.emailService.sendWelcomeEmail(result.value.email, result.value.name);
        response.status(HttpStatus.CREATED).json(result.value);
    }
    
    @Public()
    @Post('refresh')
    async refreshToken(@Body('refreshToken') refreshToken: string, @Res() response: Response) {
        const result = await this.authService.refreshToken(refreshToken);
        if (result.isErr()) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: result.error.message });
        }
        response.status(HttpStatus.OK).json(result.value);
    }
}
