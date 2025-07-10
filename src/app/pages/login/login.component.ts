import { Component } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private firestore: Firestore
  ) {}

  login() {
    this.auth
      .login(this.email, this.password)
      .then((user) => {
        const userDocRef = doc(this.firestore, 'users', user.user.uid);
        getDoc(userDocRef).then((user) => {
          if (user.exists()) {
            const userData = user.data() as { jarFav?: string };
            if (userData.jarFav) {
              this.router.navigate(['/jar', userData.jarFav]);
            } else {
              this.router.navigate(['/first-login']);
            }
          }
        });
      })
      .catch((error) => {
        console.error('Erreur de connexion :', error);
      });
  }
}
