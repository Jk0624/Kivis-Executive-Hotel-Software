import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),

    secure: false, // because we're using port 587

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendMessage(createContactDto: CreateContactDto) {

    const {
      fullName,
      email,
      subject,
      message,
    } = createContactDto;

    try {

      await this.transporter.sendMail({

        from: `"Kiviz Website Contact Form" <${process.env.SMTP_USER}>`,

        to: process.env.SMTP_USER,

        replyTo: email,

        subject: `New Contact Form: ${fullName} - ${subject}`,

        text: `
A new contact message has been received.

---------------------------------------

Full Name:
${fullName}

Email:
${email}

Subject:
${subject}

Message:
${message}

---------------------------------------

Sent from:
Kiviz Executive Lodge Website
`,

      });

      return {
        message: 'Your message has been sent successfully.',
      };

    } catch (error) {

      console.error(error);

      throw new InternalServerErrorException(
        'Unable to send your message.',
      );
    }
  }

}