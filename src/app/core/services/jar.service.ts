import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  arrayUnion,
  doc,
  updateDoc,
  getDoc,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JarService {
  constructor(private firestore: Firestore) {}

  createJar(username: string): Observable<string> {
    const jarsCollection = collection(this.firestore, 'jars');

    const newJar = {
      count: 0,
      createdAt: new Date(),
      username: username,
    };

    return from(addDoc(jarsCollection, newJar).then((docRef) => docRef.id));
  }

  getJar(jarId: string): Observable<any> {
    const jarRef = doc(this.firestore, 'jars', jarId);
    return from(getDoc(jarRef).then((snap) => snap.data()));
  }

  getUserJarsWithOwners(userUid: string): Promise<any[]> {
    return getDoc(doc(this.firestore, 'users', userUid))
      .then((userSnap) => {
        if (!userSnap.exists()) return [];

        const groupsIds: string[] = userSnap.data()?.['groups'] || [];

        // 2. Récupérer les groupes
        const groupPromises = groupsIds.map((groupId) =>
          getDoc(doc(this.firestore, 'groups', groupId))
        );

        return Promise.all(groupPromises);
      })
      .then((groupSnaps) => {
        // Pour chaque groupe, on construit une Promise qui renvoie le groupe enrichi
        const enrichedGroupPromises = groupSnaps.map((groupSnap) => {
          if (!groupSnap.exists()) return Promise.resolve(null);

          const groupData = groupSnap.data();

          // Récupérer tous les userUid des membres (sans doublons)
          const userUids = Array.from(
            new Set((groupData['members'] || []).map((m: any) => m.userUid))
          );

          // Récupérer les docs users
          const userDocsPromises = userUids.map((uid: any) =>
            getDoc(doc(this.firestore, 'users', uid))
          );

          return Promise.all(userDocsPromises).then((userDocs) => {
            // Construire la map userUid -> username
            const userMap = new Map();
            userDocs.forEach((userDoc) => {
              if (userDoc.exists()) {
                userMap.set(userDoc.id, userDoc.data()?.['username'] || null);
              }
            });

            // Enrichir les membres
            const enrichedMembers = (groupData?.['members'] || []).map(
              (member: any) => ({
                ...member,
                username: userMap.get(member.userUid) || null,
              })
            );

            return {
              ...groupData,
              id: groupSnap.id,
              members: enrichedMembers,
            };
          });
        });

        return Promise.all(enrichedGroupPromises);
      });
  }

  addJarToGroup(jarId: string, groupId: string, userUid: string) {
    const groupRef = doc(this.firestore, 'groups', groupId);
    return updateDoc(groupRef, {
      members: arrayUnion({
        userUid: userUid,
        jarId: jarId,
      }),
    });
  }

  updateCount(count: number, jarId: string) {
    const jarRef = doc(this.firestore, 'jars', jarId);
    return updateDoc(jarRef, {
      count: count,
    });
  }
}
