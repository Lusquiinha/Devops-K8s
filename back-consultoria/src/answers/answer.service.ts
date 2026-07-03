import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Answer } from "./answer.entity";
import { Repository } from "typeorm";
import { AnswerCreateDto } from "./dto/answer.create.dto";
import { Question, QuestionStatus } from "../questions/question.entity";
import { User } from "../users/user.entity";
import { err, ok, Result } from "neverthrow";
import { AnswerResponseDto } from "./dto/answer.response.dto";
import { QuestionGateway } from "src/questions/question.gateway";
import { EmailService } from "src/email/email.service";

@Injectable()
export class AnswerService {
    constructor(
        @InjectRepository(Answer)
        private answerRepository: Repository<Answer>,
        private readonly questionGateway: QuestionGateway,
        private readonly emailService: EmailService
    ) {}

    async createAnswer(answer: AnswerCreateDto): Promise<Result<AnswerResponseDto, Error>> {
        try {
            // Load related entities to ensure valid relations
            const questionRepo = this.answerRepository.manager.getRepository(Question);
            const userRepo = this.answerRepository.manager.getRepository(User);
            const question = await questionRepo.findOne({ where: { id: answer.question }, relations: ['client'] });
            const consultant = await userRepo.findOne({ where: { id: answer.consultant } });
            if (!question) {
                return err(new Error("Question not found"));
            }
            if (!consultant) {
                return err(new Error("Consultant not found"));
            }
            const newAnswer = this.answerRepository.create({
                content: answer.content,
                question,
                consultant,
            });

            const savedAnswer = await this.answerRepository.save(newAnswer);

            question.status = QuestionStatus.ANSWERED;
            const updatedQuestion = await questionRepo.save(question); // Save the question to update its answer relation

            this.questionGateway.notifyClientAnswer(updatedQuestion.client.id);
            this.emailService.sendAnswerNotificationEmail(
                updatedQuestion.client.email,
                updatedQuestion.client.name,
                question.content,
                savedAnswer.content,
                consultant.name
            );

            return ok(new AnswerResponseDto(savedAnswer));
        } catch (error: any) {
            console.error("Error creating answer:", error);
            return err(new Error("Failed to create answer: " + error.message ));
        }   
    }
}
