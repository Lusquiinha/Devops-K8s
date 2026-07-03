import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { UserService } from 'src/users/user.service';
import { UsersModule } from 'src/users/user.module';
import { QuestionGateway } from './question.gateway';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question]), UsersModule, EmailModule],
  providers: [QuestionService, UserService, QuestionGateway],
  controllers: [QuestionController],
  exports: [QuestionGateway],
})
export class QuestionsModule {}