import { UUID } from "node:crypto";
import { Answer } from "../answer.entity";

export class AnswerResponseDto {
    id: UUID;
    content: string;
    questionId: UUID;
    createdAt: Date;

    constructor(answer: Partial<Answer>) {
        this.id = answer.id || '' as UUID;
        this.content = answer.content || '';
        this.questionId = answer.question?.id || '' as UUID;
        this.createdAt = answer.createdAt || new Date();
    }
}
