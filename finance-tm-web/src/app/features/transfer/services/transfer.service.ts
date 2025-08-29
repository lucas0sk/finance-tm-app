import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ScheduleTransferRequest } from '../../../core/models/dto/request';
import { TransferResponse } from '../../../core/models/dto/response';
import { Page } from '../../../core/models/common';
import { TransferStatus } from '../../../core/models/domain/enums';

export interface UserExtractQuery {
    status?: TransferStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface AdminListQuery extends UserExtractQuery {
    fromAccount?: string;
    toAccount?: string;
}

@Injectable({ providedIn: 'root' })
export class TransferService {
    private base = `${environment.apiBaseUrl}/transfers`;

    constructor(private http: HttpClient) { }

    schedule(body: ScheduleTransferRequest) {
        return this.http.post<TransferResponse>(`${this.base}/schedule`, body);
    }

    userExtract(q: UserExtractQuery = {}) {
        let params = new HttpParams();
        if (q.status) params = params.set('status', q.status);
        if (q.startDate) params = params.set('startDate', q.startDate);
        if (q.endDate) params = params.set('endDate', q.endDate);
        params = params
            .set('page', String(q.page ?? 0))
            .set('size', String(q.size ?? 20))
            .set('sort', q.sort ?? 'createdAt,desc');
        return this.http.get<Page<TransferResponse>>(`${this.base}/user/extract`, { params });
    }

    adminList(q: AdminListQuery = {}) {
        let params = new HttpParams();
        if (q.fromAccount) params = params.set('fromAccount', q.fromAccount);
        if (q.toAccount) params = params.set('toAccount', q.toAccount);
        if (q.status) params = params.set('status', q.status);
        if (q.startDate) params = params.set('startDate', q.startDate);
        if (q.endDate) params = params.set('endDate', q.endDate);
        params = params
            .set('page', String(q.page ?? 0))
            .set('size', String(q.size ?? 20))
            .set('sort', q.sort ?? 'createdAt,desc');
        return this.http.get<Page<TransferResponse>>(`${this.base}`, { params });
    }
}
