import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MailerService {
  private transporter: any;

  constructor(private userService: UserService) {
    this.transporter = nodemailer.createTransport(
      smtpTransport({
        service: 'Gmail', // e.g., 'Gmail', 'Outlook', etc.
        auth: {
          user: 'MessageIt.mailer@gmail.com',
          pass: 'cdlg tahj yvst wfyx',
        },
      }),
    );
  }

  async sendPasswordCode(createMailerDto: any) {
    //random code generation of 6 digits
    const code = Math.floor(100000 + Math.random() * 900000);

    const user = await this.userService.getUserByEmail(createMailerDto.email);

    if (!user) {
      return { status: 404, message: 'User not found' };
    }

    await this.userService.update(user._id, { codePassword: code });
    const to = createMailerDto.email;
    const subject = 'Your code to reset your MessageIt password';
    const text = 'Here is your code. Please,do not reply to this email';
    const html =
      '<p style="text-align:center">Here is your MessageIt code. Please,do not reply to this email !</p> <br> <h1 style="text-align:center">' +
      code +
      '</h1>';
    const mailOptions = {
      from: 'MessageIt.mailer@gmail.com',
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { status: 200, message: 'Email sent' };
    } catch (error) {
      throw error;
    }
  }
}
