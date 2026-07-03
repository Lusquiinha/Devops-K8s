import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { UUID } from 'node:crypto';
import { UserRole } from './user.entity';
import { AllowRoles } from 'src/guards/decorator/role.decorator';
import { AllowSelf } from 'src/guards/decorator/self.decorator';


@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService ) {}
    
    @AllowRoles(UserRole.ADMIN)
    @Get()
    async getAll(@Res() response: Response) {
        const users = await this.userService.findAll();
        if (users.isErr()) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: users.error.message });
        }
        response.status(HttpStatus.OK).json(users.value);
    }

    @AllowRoles(UserRole.ADMIN)
    @Post()
    async createUser(@Body() user: CreateUserDto, @Res() response: Response) {
        const newUser =  await this.userService.createUser(user);
        if (newUser.isErr()) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: newUser.error.message });
        }
        response.status(HttpStatus.CREATED).json(newUser.value);
    }

    @Get(":id")
    async getUser(@Param("id") id: UUID, @Res() response: Response){
        const user =  await this.userService.findOne(id);
        if (user.isErr()) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: user.error.message });
        }
        response.status(HttpStatus.OK).json(user.value);
    }

    @AllowSelf()
    @Put(":id")
    async updateUser(@Param("id") id: UUID, @Body() user: UpdateUserDto, @Res() response: Response) {
        const updatedUser = await this.userService.updateUser(id, user);
        if (updatedUser.isErr()) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: updatedUser.error.message });
        }
        response.status(HttpStatus.OK).json(updatedUser.value);
    }

    @AllowSelf()
    @Delete(":id")
    async deleteUser(@Param("id") id: UUID, @Res() response: Response) {
        const result = await this.userService.remove(id);
        if (result.isErr()) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: result.error.message });
        }
        response.status(HttpStatus.NO_CONTENT).send();
    }

    
    @Get("email/:email")
    async getUserByEmail(@Param("email") email: string, @Res() response: Response){
        const user =  await this.userService.findByEmail(email);
        if (user.isErr()) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: user.error.message });
        }
        response.status(HttpStatus.OK).json(user.value);
    }
}

