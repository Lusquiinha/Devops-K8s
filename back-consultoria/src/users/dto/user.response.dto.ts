import { User, UserRole } from '../user.entity';

export class UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;

    constructor(user: Partial<User>) {
        this.id = user.id || '';
        this.name = user.name || '';
        this.email = user.email || '';
        this.role = (user.role as UserRole) || UserRole.CLIENT;
        this.createdAt = user.createdAt || new Date();
    }
}
