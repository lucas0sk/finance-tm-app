import { Component, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { TopbarComponent } from './shared/ui/topbar/topbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [RouterOutlet, NgIf, TopbarComponent]
})
export class AppComponent {
  private authPaths = new Set(['/login', '/register']);
  showTopbar = signal(true);

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects?.split('?')[0] ?? e.url;
        this.showTopbar.set(!this.authPaths.has(url));
      });
  }
}
