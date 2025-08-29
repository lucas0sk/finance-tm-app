import { TransferStatus } from "./enums";

export interface Transfer {
    id: number;
    requestId: string;
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    scheduledDate: string;
    transferDate: string;
    feeFixed: number;
    feePercent: number;
    feeAmount: number;
    totalAmount: number;
    status: TransferStatus;
    createdAt: string;
    executedAt?: string;
    failureReason?: string;
}