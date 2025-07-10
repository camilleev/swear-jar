// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { user } from '@angular/fire/auth';
import {
  Firestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  collection,
  getDocs,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private firestore: Firestore) {}

  addGroupToUser(userId: string, groupId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    return updateDoc(userRef, {
      groups: arrayUnion(groupId),
    });
  }

  updateJarFav(userId: string, jarId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    return updateDoc(userRef, {
      jarFav: jarId,
    });
  }

  getUser(userUid: string): Observable<any> {
    const userRef = doc(this.firestore, 'users', userUid);
    return from(getDoc(userRef).then((snap) => snap.data()));
  }

  getAllUsers() {
    const usersCol = collection(this.firestore, 'users');
    return from(getDocs(usersCol)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )
    );
  }
}
