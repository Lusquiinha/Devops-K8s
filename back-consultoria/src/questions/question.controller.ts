import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UUID } from 'node:crypto';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create.question.dto';
import { QuestionStatus } from './question.entity';
import { AllowRoles } from 'src/guards/decorator/role.decorator';
import { User, UserRole } from 'src/users/user.entity';



@Controller("question")
export class QuestionController {
    constructor(private readonly questionService: QuestionService ) {}

    @AllowRoles(UserRole.ADMIN)
    @Get()
    async getAll(@Res() response: Response) {
        const questions = await this.questionService.findAll();
        if (questions.isErr()) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: questions.error.message });
        }
        response.status(HttpStatus.OK).json(questions.value);
    }
    @AllowRoles(UserRole.CLIENT)
    @Post()
    async createQuestion(@Body() question: CreateQuestionDto, @Res() response: Response) {
        const newQuestion = await this.questionService.createQuestion(question);
        if (newQuestion.isErr()) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: newQuestion.error.message });
        }
        response.status(HttpStatus.CREATED).json(newQuestion.value);
    }
    @AllowRoles(UserRole.CONSULTANT)
    @Get('status/:status')
    async getByStatus(@Param('status') status: QuestionStatus, @Req() request: any, @Res() response: Response) {
        const consultantId: UUID = request.user.id;
        const questions = await this.questionService.findByStatus(status, consultantId);
        if (questions.isErr()) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: questions.error.message });
        }
        response.status(HttpStatus.OK).json(questions.value);
    }

    @AllowRoles(UserRole.CLIENT)
    @Get('client')
    async getByClientId(@Req() request: any, @Res() response: Response) {
        const id: UUID = request.user.id;
        const questions = await this.questionService.findByClientId(id);
        if (questions.isErr()) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: questions.error.message });
        }
        response.status(HttpStatus.OK).json(questions.value);
    }

    @AllowRoles(UserRole.CONSULTANT)
    @Post('claim/:questionId')
    async claimQuestion(
        @Param('questionId') questionId: UUID,
        @Req() request: any,
        @Res() response: Response
    ) {
        const consultantId: UUID = request.user.id;
        const result = await this.questionService.reivindicar(questionId, consultantId);
        if (result.isErr()) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: result.error.message });
        }
        response.status(HttpStatus.OK).json(result.value);
    }
}