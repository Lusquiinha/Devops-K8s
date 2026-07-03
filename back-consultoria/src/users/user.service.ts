import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { err, ok, Result } from 'neverthrow';
import { CreateUserDto } from './dto/create.user.dto';
import { UUID } from 'node:crypto';
import { UserResponseDto } from './dto/user.response.dto';

@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    findAll(): Promise<Result<UserResponseDto[], Error>> {
        return this.usersRepository.find()
            .then((users) => ok(users.map((user) => new UserResponseDto(user))))
            .catch((error) => err(new Error('Error finding users: ' + error.message)));
    }

    findOne(id: UUID): Promise<Result<UserResponseDto, Error>> {
        return this.usersRepository.findOneBy({ id })
            .then((user) => {
                if (!user) {
                    return err(new Error('User not found'));
                }
                return ok(new UserResponseDto(user));
            })
            .catch((error) => err(new Error('Error finding user: ' + error.message)));
    }

    findEntity(id: UUID): Promise<Result<User, Error>> {
        return this.usersRepository.findOneBy({ id })
            .then((user) => {
                if (!user) {
                    return err(new Error('User not found'));
                }
                return ok(user);
            })
            .catch((error) => err(new Error('Error finding user: ' + error.message)));
    }

    async remove(id: UUID): Promise<Result<void, Error>> {
        const user = await this.findOne(id);
        if (user.isErr()) {
            return err(user.error);
        }
        await this.usersRepository.remove(user.value as User);
        return ok();
    }
    
    createUser(user: CreateUserDto): Promise<Result<UserResponseDto, Error>> {
        const newUser = this.usersRepository.create(user);
        return this.usersRepository.save(newUser)
            .then((savedUser) => ok(new UserResponseDto(savedUser)))
            .catch((error) => err(new Error('Error saving user: ' + error.message)));
    }

    findByEmail(email: string): Promise<Result<UserResponseDto, Error>> {
        return this.usersRepository.findOneBy({ email })
            .then((user) => {
                if (!user) {
                    return err(new Error('User not found'));
                }
                return ok(new UserResponseDto(user));
            })
            .catch((error) => err(new Error('Error finding user: ' + error.message)));
    }

    findByEmailAuth(email: string): Promise<Result<User, Error>> {
        return this.usersRepository.findOneBy({ email })
            .then((user) => {
                if (!user) {
                    return err(new Error('User not found'));
                }
                return ok(user);
            })
            .catch((error) => err(new Error('Error finding user: ' + error.message)));
    }

    async updateUser(id: UUID, user: Partial<User>): Promise<Result<UserResponseDto, Error>> {
        const existingUser = await this.findOne(id);
        if (existingUser.isErr()) {
            return err(existingUser.error);
        }
        Object.assign(existingUser.value as User, user);
        return this.usersRepository.save(existingUser.value as User)
            .then((savedUser) => ok(new UserResponseDto(savedUser)))
            .catch((error) => err(new Error('Error updating user: ' + error.message)));
    }

    findByRefreshToken(refreshToken: string): Promise<Result<User, Error>> {
        return this.usersRepository.findOneBy({ refreshToken })
            .then((user) => {
                if (!user) {
                    return err(new Error('User not found'));
                }
                return ok(user);
            })
            .catch((error) => err(new Error('Error finding user by refresh token: ' + error.message)));
    }
}