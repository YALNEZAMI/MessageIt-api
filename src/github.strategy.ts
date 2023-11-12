/* eslint-disable prettier/prettier */
// github.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.api_url + '/auth/github/callback',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { username, displayName, id, photos } = profile;
    let lastName = ' ';
    if (displayName != null) {
      lastName = displayName;
    }
    const user = {
      idGithub: id,
      firstName: username,
      lastName: lastName,
      photo: photos[0].value,
    };
    return user;
  }
}
