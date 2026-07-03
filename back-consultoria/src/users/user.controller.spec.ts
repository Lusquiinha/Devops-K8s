import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'node:crypto';
import { Response } from 'express';
import { UserRole } from './user.entity';

const mockUserService = {
    findAll: jest.fn(),
    createUser: jest.fn(),
    findOne: jest.fn(),
    updateUser: jest.fn(),
    remove: jest.fn(),
    findByEmail: jest.fn(),
};

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAll', () => {
        it('should return all users', async () => {
            const mockUsers = [
                new UserResponseDto({
                    id: uuidv4() as UUID,
                    name: 'Test User',
                    email: 'test@example.com',
                    role: UserRole.CLIENT,
                    createdAt: new Date(),
                }),
            ];
            mockUserService.findAll.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockUsers });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getAll(response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(mockUsers);
        });

        it('should return 500 if an error occurs', async () => {
            mockUserService.findAll.mockResolvedValue({ isErr: () => true, error: new Error('Internal Server Error') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getAll(response);

            expect(response.status).toHaveBeenCalledWith(500);
            expect(response.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
        });
    });

    describe('createUser', () => {
        it('should create a user', async () => {
            const mockUser = new UserResponseDto({
                id: uuidv4() as UUID,
                name: 'Test User',
                email: 'test@example.com',
                role: UserRole.CLIENT,
                createdAt: new Date(),
            });
            mockUserService.createUser.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockUser });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new CreateUserDto();
            dto.name = 'Test User';
            dto.email = 'test@example.com';
            dto.password = 'password123';
            dto.role = UserRole.CLIENT;

            await controller.createUser(dto, response);

            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 400 if creation fails', async () => {
            mockUserService.createUser.mockResolvedValue({ isErr: () => true, error: new Error('Bad Request') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new CreateUserDto();
            dto.name = 'Test User';
            dto.email = 'test@example.com';
            dto.password = 'password123';
            dto.role = UserRole.CLIENT;

            await controller.createUser(dto, response);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: 'Bad Request' });
        });
    });

    describe('getUser', () => {
        it('should return a user by ID', async () => {
            const mockUser = new UserResponseDto({
                id: uuidv4() as UUID,
                name: 'Test User',
                email: 'test@example.com',
                role: UserRole.CLIENT,
                createdAt: new Date(),
            });
            mockUserService.findOne.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockUser });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getUser(mockUser.id as UUID, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 if user not found', async () => {
            mockUserService.findOne.mockResolvedValue({ isErr: () => true, error: new Error('Not Found') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getUser(uuidv4() as UUID, response);

            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ message: 'Not Found' });
        });
    });
});
