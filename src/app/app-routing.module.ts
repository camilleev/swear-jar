import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwearJarComponent } from './shared/swear-jar/swear-jar.component';
import { LoginComponent } from './pages/login/login.component';
import { GroupCreationComponent } from './pages/group-creation/group-creation.component';
import { AccountCreationComponent } from './pages/account-creation/account-creation.component';
import { FirstLoginComponent } from './pages/first-login/first-login.component';
import { GroupEditionComponent } from './pages/group-edition/group-edition.component';
import { JoinGroupComponent } from './pages/join-group/join-group.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'jar/:id', component: SwearJarComponent },
  { path: 'first-login', component: FirstLoginComponent },
  { path: 'group-creation', component: GroupCreationComponent },
  { path: 'join-group', component: JoinGroupComponent },
  { path: 'group-edition/:id', component: GroupEditionComponent },
  { path: 'account-creation', component: AccountCreationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
