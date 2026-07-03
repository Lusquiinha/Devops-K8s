import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { UserController } from './users/user.controller';
import { UsersModule } from './users/user.module';
import { User } from './users/user.entity';
import { Question } from './questions/question.entity';
import { QuestionsModule } from './questions/question.module';
import { AuthModule } from './auth/auth.module';
import { AnswersModule } from './answers/answer.module';
import { GuardModule } from './guards/guards.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig({synchronize: true})),
    UsersModule,
    QuestionsModule,
    AuthModule,
    AnswersModule,
    GuardModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
