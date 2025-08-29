import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toasts.service';

@Component({
    standalone: true,
    selector: 'app-toasts',
    imports: [CommonModule],
    templateUrl: './toasts.component.html',
    styleUrls: ['./toasts.component.scss']
})
export class ToastsComponent {
    private svc = inject(ToastService);
    toasts = computed(() => this.svc.toasts());
    close = (id: number) => this.svc.remove(id);
}
