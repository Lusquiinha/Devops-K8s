import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, FindOptionsWhere, Repository } from 'typeorm';
import { Question, QuestionStatus } from './question.entity';
import { err, ok, Result } from 'neverthrow';
import { UUID } from 'node:crypto';
import { User } from 'src/users/user.entity';
import { CreateQuestionDto } from './dto/create.question.dto';
import { QuestionResponseDto } from './dto/question.response.dto';
import { UserRole } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { QuestionGateway } from './question.gateway';
import { Console } from 'node:console';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Question)
        private questionsRepository: Repository<Question>,
        private userService: UserService,
        private QuestionGateway: QuestionGateway,
        private emailService: EmailService,
    ) {}



    findAll(): Promise<Result<QuestionResponseDto[], Error>> {
        return this.questionsRepository.find({
            relations: ['client', 'consultant'],
        })
            .then((questions) => ok(questions.map((q) => new QuestionResponseDto(q))))
            .catch((error) => err(new Error('Error finding questions: ' + error.message)));
    }

    findAllBy(filter: FindOptionsWhere<Question>): Promise<Result<QuestionResponseDto[], Error>> {
        return this.questionsRepository.find({
            where: filter,
            relations: ['client', 'consultant', 'answer'],
        })
            .then((questions) => {
                return ok(questions.map((q) => new QuestionResponseDto(q)));
            })
            .catch((error) => err(new Error('Error finding questions by filter: ' + error.message)));
    }

    findByStatus(status: QuestionStatus, consultantId: UUID): Promise<Result<QuestionResponseDto[], Error>> {
        switch (status) {
            case QuestionStatus.PENDING:
                return this.findAllBy({ status });
            case QuestionStatus.CLAIMED:
            case QuestionStatus.ANSWERED:
                if (!consultantId) {
                    return Promise.resolve(err(new Error('Consultant ID is required for CLAIMED or ANSWERED status')));
                }
                return this.findAllBy({ status, consultant: { id: consultantId } });
            default:
                return Promise.resolve(err(new Error('Invalid status')));
        }
    }

    findByClientId(userId: UUID): Promise<Result<QuestionResponseDto[], Error>> {
        return this.findAllBy({ client: { id: userId } });
    }

    async createQuestion(question: CreateQuestionDto): Promise<Result<QuestionResponseDto, Error>> {
        const client = await this.userService.findOne(question.client);
        if (client.isErr()) {
            return err(client.error);
        }
        const newQuestion = this.questionsRepository.create(question.toPartialQuestion());
        return this.questionsRepository.save(newQuestion)
            .then((savedQuestion) => {
                this.QuestionGateway.notifyNewQuestion(savedQuestion);
                return ok(new QuestionResponseDto(savedQuestion));
            })
            .catch((error) => err(new Error('Error creating question: ' + error.message)));
    }

    async reivindicar(perguntaId: UUID, consultorId: UUID): Promise<Result<QuestionResponseDto, Error>> {
        const consultor = await this.userService.findEntity(consultorId); // Fetch full User entity
        if (consultor.isErr()) {
            return err(new Error('Consultor não encontrado.'));
        }

        const pergunta = await this.questionsRepository.findOne({ where: { id: perguntaId }, relations: ['client'] });
        if (!pergunta) {
            return err(new Error('Pergunta não encontrada.'));
        }

        if (pergunta.status !== QuestionStatus.PENDING) {
            return err(new Error('Esta pergunta não está mais disponível.'));
        }

        pergunta.consultant = consultor.value; // Assign full User entity
        pergunta.status = QuestionStatus.CLAIMED;
        pergunta.claimedAt = new Date();

        const perguntaAtualizada = await this.questionsRepository.save(pergunta);

        // Notifica que a pergunta foi reivindicada
        this.QuestionGateway.notifyQuestionClaimed(pergunta.id, consultor.value.name);
        this.QuestionGateway.notifyClientClaimed(pergunta.client.id);

        this.emailService.sendQuestionClaimedEmail(
            pergunta.client.email,
            pergunta.client.name,
            pergunta.content,
            consultor.value.name
        )

        return ok(new QuestionResponseDto(perguntaAtualizada));
    }
}
