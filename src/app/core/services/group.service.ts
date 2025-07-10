import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { GroupRequestModel } from '../model/group-request.model';
import { BehaviorSubject, from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private firestore: Firestore) {}

  createGroup(groupName: string, creator: string) {
    const groupsCollection = collection(this.firestore, 'groups');

    const newGroup = {
      name: groupName,
      members: [],
      creator: creator,
      createdAt: new Date(),
    };
    return from(addDoc(groupsCollection, newGroup).then((docRef) => docRef.id));
  }

  getAllGroups(): Observable<any[]> {
    const groupsCollection = collection(this.firestore, 'groups');
    return from(getDocs(groupsCollection)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )
    );
  }

  getGroupById(groupId: string): Observable<any> {
    const groupDoc = doc(this.firestore, 'groups', groupId);
    return from(getDoc(groupDoc)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error('Group not found');
        }
      })
    );
  }

    updateGroupName(groupId: string, name: string) {
      const groupRef = doc(this.firestore, 'groups', groupId);
      return updateDoc(groupRef, {
        name: name,
      });
    }
}
