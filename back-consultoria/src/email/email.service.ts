import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, template: string, context: any) {
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.sendEmail(to, 'Welcome!', 'welcome', { name });
      console.log(`Welcome email sent to ${to}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    //   throw new Error('Failed to send welcome email');
    }
  }

  async sendQuestionClaimedEmail(to: string, clientName: string, questionContent: string, consultantName: string) {
    try {
      await this.sendEmail(to, 'Sua pergunta foi recebida!', 'question_claimed', {
        clientName,
        questionContent,
        consultantName
      });
      console.log(`Question claimed email sent to ${to}`);
    } catch (error) {
      console.error('Error sending question claimed email:', error);
    }
  }
  async sendAnswerNotificationEmail(to: string, clientName: string, questionContent: string, answerContent: string, consultantName: string) {
    try {
      await this.sendEmail(to, 'Sua resposta está pronta!', 'question_answered', {
        clientName,
        questionContent,
        answerContent,
        consultantName
      });
      console.log(`Answer notification email sent to ${to}`);
    } catch (error) {
      console.error('Error sending answer notification email:', error);
    }
  }
}