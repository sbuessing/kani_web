import { Component, Input } from '@angular/core';
import { Auth, Unsubscribe, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @Input() public user: User;

  constructor(public auth: Auth, public router: Router) {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
