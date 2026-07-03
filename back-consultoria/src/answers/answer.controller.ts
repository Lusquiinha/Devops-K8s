import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { AnswerService } from "./answer.service";
import { AnswerCreateDto } from "./dto/answer.create.dto";
import { AllowRoles } from "src/guards/decorator/role.decorator";
import { UserRole } from "src/users/user.entity";

@Controller("answer")
export class AnswerController {
    constructor(
        private answerService: AnswerService
    ) {}

    @AllowRoles(UserRole.CONSULTANT)
    @Post()
    async createAnswer(@Body() answer: AnswerCreateDto, @Res() response: Response) {
        const result = await this.answerService.createAnswer(answer);

        if (result.isOk()) {
            response.status(201).send(result.value);
        } else {
            response.status(400).send(result.error.message);
        }
    }
}