// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { Firestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import {
  BehaviorSubject,
  filter,
  first,
  from,
  fromEventPattern,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    this._initAuthStateListener();
  }

  private _initAuthStateListener() {
    fromEventPattern<User | null>(
      (handler) => onAuthStateChanged(this.auth, handler),
      () => {} // pas besoin d’un unsubscribe ici car on garde une seule subscription
    )
      .pipe(
        switchMap((user) => {
          if (user) {
            // Chercher les infos supplémentaires dans Firestore
            const userRef = doc(this.firestore, 'users', user.uid);
            return from(getDoc(userRef)).pipe(
              switchMap((userSnap) => {
                const userData = userSnap.data() || {};
                const combinedUser = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  ...userData,
                };
                return of(combinedUser);
              })
            );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((finalUser) => {
        this.currentUserSubject.next(finalUser);
        console.log('🟢 AuthState changé, utilisateur:', finalUser);
      });
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  register(email: string, password: string, username: string) {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((user) => {
        updateProfile(user.user, { displayName: username });
        const userDocRef = doc(this.firestore, 'users', user.user.uid);
        const newUser = {
          username: username,
          uid: user.user.uid,
          groups: [],
          jarFav: null,
        };

        return setDoc(userDocRef, newUser);
      })
      .catch((error) => {
        throw error;
      });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
}
