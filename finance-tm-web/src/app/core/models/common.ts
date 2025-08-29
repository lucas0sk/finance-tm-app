export type UUID = string;
export type ISODateString = string;

export interface ApiError {
    timestamp?: ISODateString;
    status?: number;
    error?: string;
    message: string;
    path?: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface PageQuery {
    page?: number;
    size?: number;
    sort?: string;
}