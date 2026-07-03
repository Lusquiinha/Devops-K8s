import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';
import { User } from 'src/users/user.entity';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getEnv('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<User> {
    return { id: payload.sub, role: payload.role, email: payload.email, name: payload.name } as User;
  }
}