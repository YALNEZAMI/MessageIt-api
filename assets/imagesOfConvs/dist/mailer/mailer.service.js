"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const user_service_1 = require("../user/user.service");
let MailerService = class MailerService {
    constructor(userService) {
        this.userService = userService;
        this.transporter = nodemailer.createTransport(smtpTransport({
            service: 'Gmail',
            auth: {
                user: 'MessageIt.mailer@gmail.com',
                pass: 'cdlg tahj yvst wfyx',
            },
        }));
    }
    async sendPasswordCode(createMailerDto) {
        const code = Math.floor(100000 + Math.random() * 900000);
        const user = await this.userService.getUserByEmail(createMailerDto.email);
        if (!user) {
            return { status: 404, message: 'User not found' };
        }
        await this.userService.update(user._id, { codePassword: code });
        const to = createMailerDto.email;
        const subject = 'Your code to reset your MessageIt password';
        const text = 'Here is your code. Please,do not reply to this email';
        const html = '<p style="text-align:center">Here is your MessageIt code. Please,do not reply to this email !</p> <br> <h1 style="text-align:center">' +
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
        }
        catch (error) {
            throw error;
        }
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], MailerService);
//# sourceMappingURL=mailer.service.js.map