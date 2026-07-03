import { UUID } from "node:crypto";
import { Answer } from "../answer.entity";
import { IsString, IsUUID } from "class-validator";
import { Question } from "src/questions/question.entity";
import { User } from "src/users/user.entity";

export class AnswerCreateDto {
    @IsString()
    content: string;

    @IsUUID()
    question: UUID;

    @IsUUID()
    consultant: UUID;

    toPartialAnswer(): Partial<Answer> {
        return {
            content: this.content,
            question: { id: this.question } as Question,
            consultant: { id: this.consultant } as User,
        };
    }
}
