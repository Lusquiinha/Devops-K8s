import { UUID } from "node:crypto";

export enum UserType {
    CLIENTE = 'CLIENT',
    CONSULTOR = 'CONSULTANT',
}

export interface User {
    id: UUID;
    email: string;
    name: string;
    role: UserType;
}

export interface Answer {
    id: UUID;
    content: string;
    createdAt: string;
}

export interface Question {
    id: UUID;
    content: string;
    status: string;
    createdAt: string;
    claimedAt?: string;
    answeredAt?: string;
    client: User;
    consultant?: User;
    answer?: Answer;
}