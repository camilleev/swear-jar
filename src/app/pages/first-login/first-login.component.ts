import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-first-login',
  templateUrl: './first-login.component.html',
  styleUrls: ['./first-login.component.scss']
})
export class FirstLoginComponent {
  constructor(private router: Router){}

  navigateTo(page: string){
    this.router.navigate([`/${page}`]);
  }
}
