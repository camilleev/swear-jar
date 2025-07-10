import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-account-creation',
  templateUrl: './account-creation.component.html',
  styleUrls: ['./account-creation.component.scss'],
})
export class AccountCreationComponent {
  email = '';
  password = '';
  username = '';

  constructor(private auth: AuthService, private router: Router) {}

  createAccount() {
    this.auth
      .register(this.email, this.password, this.username)
      .then(() => {
        this.router.navigate(['/group-creation']);
      })
      .catch((error) => {
        console.error('Erreur de création de compte :', error);
      });
  }
}
