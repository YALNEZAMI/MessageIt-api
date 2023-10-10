import { UserService } from 'src/user/user.service';
export declare class MailerService {
    private userService;
    private transporter;
    constructor(userService: UserService);
    sendPasswordCode(createMailerDto: any): Promise<{
        status: number;
        message: string;
    }>;
}
