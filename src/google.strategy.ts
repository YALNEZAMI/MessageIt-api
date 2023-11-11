/* eslint-disable prettier/prettier */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '130785254541-l6870e6ookedn0sthl0v24r06n96roju.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      _id: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      photo: profile.photos[0].value,
      accessToken,
    };
    done(null, user);
  }
  /**ya29.a0AfB_byDkbsDAEaM6NeVavGNo6o6M_
   * dRYPBJWsOCSaDLlFFllc2qneB6jQsg-
   * oaj9dVpvTAbFczqvQMAsmXVmbnju0JcgSqF4a
   * nccVTSaqwVoBVU7mJOYbXcVsA6A25eeAPQ6CO
   * xLfB39r8Z9cxLxqV1ZAKcb3Skxj1PiaCgYKAU
   * 8SARASFQHGX2MiPuCZZCyiBuBVvb3DxfEQ-Q0171 */
}
