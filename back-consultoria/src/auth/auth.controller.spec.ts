import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';

const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
};

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return access and refresh tokens on successful login', async () => {
            const mockTokens = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };
            mockAuthService.login.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockTokens });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new LoginDto();
            dto.email = 'test@example.com';
            dto.password = 'password123';

            await controller.login(dto, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(mockTokens);
        });

        it('should return 401 if login fails', async () => {
            mockAuthService.login.mockResolvedValue({ isErr: () => true, error: new Error('Invalid credentials') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new LoginDto();
            dto.email = 'test@example.com';
            dto.password = 'wrongPassword';

            await controller.login(dto, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });
    });

    describe('register', () => {
        it('should return success message on successful registration', async () => {
            const mockMessage = { message: 'User registered successfully' };
            mockAuthService.register.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockMessage });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new RegisterDto();
            dto.name = 'Test User';
            dto.email = 'test@example.com';
            dto.password = 'password123';

            await controller.register(dto, response);

            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith(mockMessage);
        });

        it('should return 400 if registration fails', async () => {
            mockAuthService.register.mockResolvedValue({ isErr: () => true, error: new Error('Bad request') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new RegisterDto();
            dto.name = 'Test User';
            dto.email = 'test@example.com';
            dto.password = 'password123';

            await controller.register(dto, response);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: 'Bad request' });
        });
    });

    describe('refreshToken', () => {
        it('should return new access token on successful refresh', async () => {
            const mockAccessToken = { accessToken: 'newMockAccessToken' };
            mockAuthService.refreshToken.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockAccessToken });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const refreshToken = 'mockRefreshToken';

            await controller.refreshToken(refreshToken, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(mockAccessToken);
        });

        it('should return 401 if refresh token is invalid', async () => {
            mockAuthService.refreshToken.mockResolvedValue({ isErr: () => true, error: new Error('Invalid refresh token') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const refreshToken = 'invalidRefreshToken';

            await controller.refreshToken(refreshToken, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalledWith({ message: 'Invalid refresh token' });
        });
    });
});
