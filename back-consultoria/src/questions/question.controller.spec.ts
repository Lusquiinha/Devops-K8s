import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create.question.dto';
import { QuestionStatus } from './question.entity';
import { QuestionResponseDto } from './dto/question.response.dto';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'node:crypto';
import { Response } from 'express';
import { UserRole } from '../users/user.entity';

const mockQuestionService = {
    findAll: jest.fn(),
    createQuestion: jest.fn(),
    findByStatus: jest.fn(),
    findByClientId: jest.fn(),
};

describe('QuestionController', () => {
    let controller: QuestionController;
    let service: QuestionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionController],
            providers: [
                {
                    provide: QuestionService,
                    useValue: mockQuestionService,
                },
            ],
        }).compile();

        controller = module.get<QuestionController>(QuestionController);
        service = module.get<QuestionService>(QuestionService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAll', () => {
        it('should return all questions', async () => {
            const mockQuestions = [
                new QuestionResponseDto({
                    id: uuidv4() as UUID,
                    content: 'Test',
                    client: {
                        id: uuidv4() as UUID,
                        name: 'Client Name',
                        email: 'client@example.com',
                        password: 'password123',
                        role: UserRole.CLIENT,
                        createdAt: new Date(),
                        refreshToken: 'mockRefreshToken',
                    },
                    consultant: null,
                    status: QuestionStatus.PENDING,
                    createdAt: new Date(),
                }),
            ];
            mockQuestionService.findAll.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockQuestions });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getAll(response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(mockQuestions);
        });

        it('should return 404 if no questions found', async () => {
            mockQuestionService.findAll.mockResolvedValue({ isErr: () => true, error: new Error('Not found') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getAll(response);

            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ message: 'Not found' });
        });
    });

    describe('createQuestion', () => {
        it('should create a question', async () => {
            const mockQuestion = new QuestionResponseDto({
                id: uuidv4() as UUID,
                content: 'Test',
                client: {
                    id: uuidv4() as UUID,
                    name: 'Client Name',
                    email: 'client@example.com',
                    password: 'password123',
                    role: UserRole.CLIENT,
                    createdAt: new Date(),
                    refreshToken: 'mockRefreshToken',
                },
                consultant: null,
                status: QuestionStatus.PENDING,
                createdAt: new Date(),
            });
            mockQuestionService.createQuestion.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockQuestion });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new CreateQuestionDto();
            dto.content = 'Test';
            dto.client = uuidv4() as UUID;

            await controller.createQuestion(dto, response);

            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith(mockQuestion);
        });

        it('should return 400 if creation fails', async () => {
            mockQuestionService.createQuestion.mockResolvedValue({ isErr: () => true, error: new Error('Bad request') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const dto = new CreateQuestionDto();
            dto.content = 'Test';
            dto.client = uuidv4() as UUID;

            await controller.createQuestion(dto, response);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: 'Bad request' });
        });
    });

    describe('getByStatus', () => {
        it('should return questions by status', async () => {
            const mockQuestions = [
                new QuestionResponseDto({
                    id: uuidv4() as UUID,
                    content: 'Test',
                    client: {
                        id: uuidv4() as UUID,
                        name: 'Client Name',
                        email: 'client@example.com',
                        password: 'password123',
                        role: UserRole.CLIENT,
                        createdAt: new Date(),
                        refreshToken: 'mockRefreshToken',
                    },
                    consultant: null,
                    status: QuestionStatus.PENDING,
                    createdAt: new Date(),
                }),
            ];
            mockQuestionService.findByStatus.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockQuestions });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getByStatus(QuestionStatus.PENDING, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(mockQuestions);
        });

        it('should return 404 if no questions found by status', async () => {
            mockQuestionService.findByStatus.mockResolvedValue({ isErr: () => true, error: new Error('Not found') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getByStatus(QuestionStatus.PENDING, response);

            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ message: 'Not found' });
        });
    });

    describe('getByClientId', () => {
        it('should return questions by client ID', async () => {
            const mockQuestions = [
                new QuestionResponseDto({
                    id: uuidv4() as UUID,
                    content: 'Test',
                    client: {
                        id: uuidv4() as UUID,
                        name: 'Client Name',
                        email: 'client@example.com',
                        password: 'password123',
                        role: UserRole.CLIENT,
                        createdAt: new Date(),
                        refreshToken: 'mockRefreshToken',
                    },
                    consultant: null,
                    status: QuestionStatus.PENDING,
                    createdAt: new Date(),
                }),
            ];
            mockQuestionService.findByClientId.mockResolvedValue({ isErr: () => false, isOk: () => true, value: mockQuestions });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getByClientId(uuidv4() as UUID, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(mockQuestions);
        });

        it('should return 404 if no questions found by client ID', async () => {
            mockQuestionService.findByClientId.mockResolvedValue({ isErr: () => true, error: new Error('Not found') });

            const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            await controller.getByClientId(uuidv4() as UUID, response);

            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ message: 'Not found' });
        });
    });
});
