export interface Account {
    id: number;
    number: string;
    balance: number;
    ownerId?: number;
    version?: number;
}