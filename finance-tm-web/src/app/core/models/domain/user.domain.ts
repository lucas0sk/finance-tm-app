import { Account } from "./account.domain";
import { UserRole, UserStatus } from "./enums";

export interface User {
    id: string;
    fullName: string;
    cpf: string;
    email: string;
    username: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    account?: Account;
}