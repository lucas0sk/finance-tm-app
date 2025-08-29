import { UUID } from "../common";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    cpf: string;
    email: string;
    username: string;
    password: string;
    role: string;
}

export interface ScheduleTransferRequest {
    requestId: UUID;
    fromAccount: string;
    toAccount: string;
    amount: number;
    transferDate: string;
}