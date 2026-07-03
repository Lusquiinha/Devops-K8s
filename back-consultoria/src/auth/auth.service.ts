import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { Result, ok, err } from 'neverthrow';
import { User, UserRole } from '../users/user.entity';
import { UUID } from 'node:crypto';

@Injectable()
export class AuthService implements OnModuleInit{
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string): Promise<Result<User, Error>> {
        const user = await this.userService.findByEmailAuth(username);
        if (user.isErr()) {
            return err(new UnauthorizedException());
        }

        const passwordMatch = await bcrypt.compare(password, user.value.password);
        if (!passwordMatch) {
            return err(new UnauthorizedException());
        }

        return user;
    }

    async login(loginDto: LoginDto): Promise<Result<{ accessToken: string; refreshToken: string }, Error>> {
        const userResult = await this.userService.findByEmailAuth(loginDto.email);
        if (userResult.isErr()) {
            return err(new Error('Invalid credentials'));
        }

        const user = userResult.value;
        const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordMatch) {
            return err(new Error('Invalid credentials'));
        }

        const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refreshToken = await this.generateRefreshToken(user.id);
        return ok({ accessToken, refreshToken });
    }

    async register(registerDto: RegisterDto): Promise<Result<UserResponseDto, Error>> {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const userResult = await this.userService.createUser({ ...registerDto, password: hashedPassword, role: UserRole.CLIENT });
        if (userResult.isErr()) {
            return err(userResult.error);
        }

        return ok(userResult.value);
    }

    async generateRefreshToken(userId: string): Promise<string> {
        const refreshToken = this.jwtService.sign({ sub: userId }, { expiresIn: '7d' });
        await this.userService.updateUser(userId as UUID, { refreshToken });
        return refreshToken;
    }

    async refreshToken(refreshToken: string): Promise<Result<{ accessToken: string }, Error>> {
        const userResult = await this.userService.findByRefreshToken(refreshToken);
        if (userResult.isErr()) {
            return err(new Error('Invalid refresh token'));
        }

        const user = userResult.value;
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return ok({ accessToken });
    }

    async onModuleInit() {
        // Create consultant user if not exists
        const consultantEmail = 'consultor@exemplo.com';
        const clientEmail = 'cliente@exemplo.com';

        const consultantExists = await this.userService.findByEmail?.(consultantEmail);
        if (!consultantExists || (consultantExists.isErr && consultantExists.isErr())) {
            const hashedPassword = await bcrypt.hash('teste123', 10);
            await this.userService.createUser({ 
                name: 'Consultant Test', 
                email: consultantEmail, 
                password: hashedPassword, 
                role: UserRole.CONSULTANT 
            });
        }

        const clientExists = await this.userService.findByEmail?.(clientEmail);
        if (!clientExists || (clientExists.isErr && clientExists.isErr())) {
            const hashedPassword = await bcrypt.hash('teste123', 10);
            await this.userService.createUser({ 
                name: 'Client Test', 
                email: clientEmail, 
                password: hashedPassword, 
                role: UserRole.CLIENT 
            });
        }
    }
}
