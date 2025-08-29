import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/dto/request';

@Component({
    standalone: true,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [CommonModule, FormsModule]
})
export class LoginComponent {
    username = '';
    password = '';
    showPassword = false;
    loading = false;
    error = '';

    constructor(private auth: AuthService, private router: Router) { }

    toggle() { this.showPassword = !this.showPassword; }

    submit() {
        this.loading = true;
        this.error = '';

        const req: LoginRequest = { username: this.username.trim(), password: this.password };

        this.auth.login(req)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (res) => {
                    this.auth.setSession(res);
                    this.router.navigateByUrl('/');
                },
                error: (err) => {
                    this.error = err?.error?.message || 'Usuário ou senha inválidos';
                }
            });
    }
}
