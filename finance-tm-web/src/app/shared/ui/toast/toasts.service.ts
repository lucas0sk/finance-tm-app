import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast { id: number; type: ToastType; title: string; text: string; timeout: number; }

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _toasts = signal<Toast[]>([]);
    private seq = 1;

    toasts = this._toasts;

    show(type: ToastType, title: string, text: string, timeout = 4000) {
        const id = this.seq++;
        const toast: Toast = { id, type, title, text, timeout };
        this._toasts.update(arr => [toast, ...arr]);

        if (timeout > 0) {
            setTimeout(() => this.remove(id), timeout);
        }
        return id;
    }

    success(title: string, text: string, timeout?: number) { return this.show('success', title, text, timeout); }
    error(title: string, text: string, timeout?: number) { return this.show('error', title, text, timeout); }
    info(title: string, text: string, timeout?: number) { return this.show('info', title, text, timeout); }
    warning(title: string, text: string, timeout?: number) { return this.show('warning', title, text, timeout); }

    remove(id: number) {
        this._toasts.update(arr => arr.filter(t => t.id !== id));
    }

    clear() { this._toasts.set([]); }
}
