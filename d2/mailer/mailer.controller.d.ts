import { MailerService } from './mailer.service';
import { CreateMailerDto } from './dto/create-mailer.dto';
export declare class MailerController {
    private readonly mailerService;
    constructor(mailerService: MailerService);
    create(createMailerDto: CreateMailerDto): Promise<{
        status: number;
        message: string;
    }>;
}
