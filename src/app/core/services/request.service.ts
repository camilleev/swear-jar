import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { GroupRequestModel } from '../model/group-request.model';
import { StatusEnum } from '../enum/status.enum';
import { RequestTypeEnum } from '../enum/request-type.enum';
import {
  BehaviorSubject,
  forkJoin,
  from,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import { GroupRequestExtendedModel } from '../model/group-request-extended.model';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private pendingRequests$ = new BehaviorSubject<GroupRequestModel[]>([]);

  constructor(private firestore: Firestore) {}

  createInviteGroupRequest(params: {
    groupId: string;
    fromUid: string;
    toUid: string;
  }) {
    const groupsCollection = collection(this.firestore, 'requests');

    const newRequest = {
      groupId: params.groupId,
      fromUid: params.fromUid,
      toUid: params.toUid,
      status: StatusEnum.PENDING,
      type: RequestTypeEnum.INVITE_REQUEST,
      createdAt: new Date(),
    };

    from(addDoc(groupsCollection, newRequest).then((docRef) => docRef.id));
  }

  createIJoinGroupRequest(params: {
    groupId: string;
    fromUid: string;
    toUid: string;
  }) {
    const groupsCollection = collection(this.firestore, 'requests');

    const newRequest = {
      groupId: params.groupId,
      fromUid: params.fromUid,
      toUid: params.toUid,
      status: StatusEnum.PENDING,
      type: RequestTypeEnum.JOIN_REQUEST,
      createdAt: new Date(),
    };

    from(addDoc(groupsCollection, newRequest).then((docRef) => docRef.id));
  }

  loadPendingRequests(toUid: string) {
    const requestsRef = collection(this.firestore, 'requests');
    const q = query(
      requestsRef,
      where('toUid', '==', toUid),
      where('status', '==', StatusEnum.PENDING)
    );

    getDocs(q).then((snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.pendingRequests$.next(data as GroupRequestModel[]);
    });
  }

  getPendingRequests$(): Observable<any[]> {
    return this.pendingRequests$.asObservable();
  }

  refreshPendingRequests(toUid: string) {
    this.loadPendingRequests(toUid);
  }

  getPendingRequestsWithDetails$(): Observable<GroupRequestExtendedModel[]> {
    return this.getPendingRequests$().pipe(
      switchMap((requests) => {
        const detailedRequests$ = requests.map((req) => {
          const groupDocRef = doc(this.firestore, 'groups', req.groupId);
          const fromUserDocRef = doc(this.firestore, 'users', req.fromUid);
          const toUserDocRef = doc(this.firestore, 'users', req.toUid);

          const group$ = from(getDoc(groupDocRef)).pipe(
            map((snap) =>
              snap.exists() ? snap.data()?.['name'] : 'Groupe inconnu'
            )
          );

          const fromUser$ = from(getDoc(fromUserDocRef)).pipe(
            map((snap) =>
              snap.exists() ? snap.data()?.['username'] : 'Utilisateur inconnu'
            )
          );

          const toUser$ = from(getDoc(toUserDocRef)).pipe(
            map((snap) =>
              snap.exists() ? snap.data()?.['username'] : 'Utilisateur inconnu'
            )
          );

          return forkJoin([group$, fromUser$, toUser$]).pipe(
            map(([groupName, fromUsername, toUsername]) => ({
              ...req,
              groupName,
              fromUsername,
              toUsername,
            }))
          );
        });

        return forkJoin(detailedRequests$);
      })
    );
  }

  updateRequestStatus$(requestId: string, status: StatusEnum) {
    const requestDocRef = doc(this.firestore, 'requests', requestId);
    return from(updateDoc(requestDocRef, { status: status }));
  }
}
