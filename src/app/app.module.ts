import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { SwearJarComponent } from './shared/swear-jar/swear-jar.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GroupCreationComponent } from './pages/group-creation/group-creation.component';
import { InputComponent } from './shared/input/input.component';
import { ButtonComponent } from './shared/button/button.component';
import { AccountCreationComponent } from './pages/account-creation/account-creation.component';
import { AutocompleteComponent } from './shared/autocomplete/autocomplete.component';
import { FirstLoginComponent } from './pages/first-login/first-login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JarsListComponent } from './shared/jars-list/jars-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RequestListComponent } from './shared/request-list/request-list.component';
import { SettingsComponent } from './shared/settings/settings.component';
import { GroupEditionComponent } from './pages/group-edition/group-edition.component';
import { JoinGroupComponent } from './pages/join-group/join-group.component';

const firebaseConfig = {
  apiKey: "AIzaSyCI6kRl4IsOD64SodLaz5IFTovBltHImQc",
  authDomain: "swear-jar-c69f6.firebaseapp.com",
  projectId: "swear-jar-c69f6",
  storageBucket: "swear-jar-c69f6.firebasestorage.app",
  messagingSenderId: "393973771411",
  appId: "1:393973771411:web:3a43dab0a00e553d8b7166",
  measurementId: "G-NSKCSB8C47"
};

@NgModule({
  declarations: [
    AppComponent,
    SwearJarComponent,
    LoginComponent,
    GroupCreationComponent,
    InputComponent,
    ButtonComponent,
    AccountCreationComponent,
    AutocompleteComponent,
    FirstLoginComponent,
    JarsListComponent,
    RequestListComponent,
    SettingsComponent,
    GroupEditionComponent,
    JoinGroupComponent,
  ],
  imports: [
    BrowserModule,
    MatDialogModule,
    MatButtonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
