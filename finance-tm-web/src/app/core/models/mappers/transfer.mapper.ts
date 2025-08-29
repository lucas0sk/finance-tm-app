import { Transfer } from "../domain/transfer.domain";
import { TransferResponse } from "../dto/response";

export function toTransferDomain(dto: TransferResponse): Transfer {
    return {
        id: (dto as any).id ?? 0,
        requestId: dto.requestId,
        fromAccountId: parseInt(dto.fromAccount, 10),
        toAccountId: parseInt(dto.toAccount, 10),
        amount: Number(dto.amount),
        scheduledDate: dto.scheduledDate,
        transferDate: dto.transferDate,
        feeFixed: Number(dto.feeFixed),
        feePercent: Number(dto.feePercent),
        feeAmount: Number(dto.feeAmount),
        totalAmount: Number(dto.totalAmount),
        status: dto.status,
        createdAt: dto.createdAt,
        executedAt: (dto as any).executedAt,
        failureReason: (dto as any).failureReason
    };
}