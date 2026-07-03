import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { configService } from 'src/config/config.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: true, // true for 465, false for other ports
        auth: {
          user: configService.getEnv('EMAIL_USER'), // your email address
          pass: configService.getEnv('EMAIL_PASS'), // your app password
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>', // default sender address
      },
      template: {
        dir: __dirname + '/..' + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
