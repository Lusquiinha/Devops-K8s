import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/user.entity';


export const ROLES_KEY = 'roles';
export const AllowRoles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);