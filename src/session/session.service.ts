import { Injectable } from '@nestjs/common';
// import { CreateSessionDto } from './dto/create-session.dto';
// import { UpdateSessionDto } from './dto/update-session.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SessionService {
  private readonly secretKey = 'your-secret-key'; // Replace with a strong, unique secret key

  createToken(data: any): string {
    return jwt.sign(data, this.secretKey, { expiresIn: '1h' }); // Adjust expiration as needed
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      return null;
    }
  }
}
