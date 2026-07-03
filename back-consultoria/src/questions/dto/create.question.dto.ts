import { IsOptional, IsString, IsUUID} from 'class-validator';
import { Question, QuestionStatus } from '../question.entity';
import { UUID } from 'node:crypto';
import { Req } from '@nestjs/common';
import { User } from 'src/users/user.entity';

export class CreateQuestionDto {
    @IsString()
    content: string;
    
    @IsUUID()
    client: UUID;

    @IsUUID()
    @IsOptional()
    consultant: UUID | null;

    toPartialQuestion(): Partial<Question> {
        return {
            content: this.content,
            client: { id: this.client } as User, // Assuming client is a User entity
            consultant: this.consultant ? { id: this.consultant } as User : null, // Assuming consultant is a User entity
            status: QuestionStatus.PENDING, // Default status
        };
    }
}