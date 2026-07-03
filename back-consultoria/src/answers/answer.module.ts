import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './answer.entity';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { QuestionsModule } from 'src/questions/question.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Answer]), QuestionsModule, EmailModule],
  providers: [AnswerService],
  controllers: [AnswerController],
})
export class AnswersModule {}
