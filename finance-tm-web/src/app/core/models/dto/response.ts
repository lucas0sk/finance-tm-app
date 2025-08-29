import { UUID } from "../common";
import { TransferStatus, UserRole } from "../domain/enums";

export interface AuthResponse {
    accessToken: string;
    accountNumber: string;
    userRole: UserRole;
}

export interface TransferResponse {
    requestId: UUID;
    fromAccount: string;
    toAccount: string;
    amount: number;
    scheduledDate: string;
    transferDate: string;
    feeFixed: number;
    feePercent: number;
    feeAmount: number;
    totalAmount: number;
    status: TransferStatus;
    createdAt: string;
}

export interface AccountMeResponse {
    accountNumber: string;
    balance: number;
}
