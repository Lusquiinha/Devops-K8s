import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from 'src/users/user.entity';
import { ROLES_KEY } from './decorator/role.decorator';
import { SELF_KEY } from './decorator/self.decorator';
import { UUID } from 'node:crypto';

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSelf = this.reflector.getAllAndOverride<boolean>(SELF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isSelf) {
      return true;
    }
    const { user }: { user: User } = context.switchToHttp().getRequest();
    if (!user ) {
      return false;
    }
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    return user.id === context.switchToHttp().getRequest().params.id as UUID;
  }
}
