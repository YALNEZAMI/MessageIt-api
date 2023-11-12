/* eslint-disable prettier/prettier */
// facebook.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.api_url + '/auth/facebook/callback',
      profileFields: ['id', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const user = {
      idFacebook: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      photo: 'http://localhost:3000/user/uploads/user.png',
      // Additional fields as needed
    };

    return done(null, user);
  }
}
