import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/dto/request';

@Component({
    standalone: true,
    selector: 'app-register',
    templateUrl: './register.component.html',
    imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
    fullName = '';
    cpf = '';
    email = '';
    username = '';
    password = '';
    role = '';
    loading = false;
    error = '';
    success = false;
    accountNumber: string | null = null;

    constructor(private auth: AuthService, private router: Router) { }

    submit() {
        this.loading = true; this.error = ''; this.success = false;
        const req: RegisterRequest = {
            fullName: this.fullName.trim(),
            cpf: this.cpf.replace(/\D/g, ''),
            email: this.email.trim(),
            username: this.username.trim(),
            password: this.password,
            role: 'USER'
        };
        this.auth.register(req)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (res) => {
                    this.auth.setSession(res);                 
                    this.accountNumber = res.accountNumber ?? null;
                    this.success = true;
                    this.router.navigateByUrl('/');            
                },
                error: (err) => { this.error = err?.error?.message || 'Falha ao cadastrar'; }
            });
    }
}
