import { AnswerResponseDto } from 'src/answers/dto/answer.response.dto';
import { Question, QuestionStatus } from '../question.entity';

export class QuestionResponseDto {
    id: string;
    content: string;
    clientId: string;
    consultantId?: string;
    status: QuestionStatus;
    createdAt: Date;
    claimedAt?: Date;
    answer?: AnswerResponseDto;

    constructor(question: Partial<Question>) {
        this.id = question.id || '';
        this.content = question.content || '';
        this.clientId = question.client?.id || '';
        this.consultantId = question.consultant?.id || undefined;
        this.status = question.status || QuestionStatus.PENDING;
        this.createdAt = question.createdAt || new Date();
        this.claimedAt = question.claimedAt || undefined;
        this.answer = question.answer ? new AnswerResponseDto(question.answer) : undefined;
    }
}
