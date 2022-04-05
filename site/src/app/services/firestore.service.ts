import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Haiku, UserSettings } from 'functions/src/shared/firestore_types';
import { switchMap } from 'rxjs/operators';
import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  docData,
  Firestore,
  collectionData,
  setDoc,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { deleteDoc } from 'firebase/firestore';

const HAIKUS = '/haikus';
const USERS = '/users';

@Injectable({
  providedIn: 'root',
})
export class FireStoreService {
  constructor(private store: Firestore, private a: Auth) {}

  saveHaiku(haiku: Haiku): Observable<DocumentReference<Haiku>> {
    return authState(this.a).pipe(
      switchMap((result) => {
        haiku.user = result.uid;
        haiku.timestamp = Date.now();
        const c = collection(this.store, HAIKUS);
        return from(addDoc<Haiku>(c, haiku));
      })
    );
  }

  getHaikus(): Observable<Haiku[]> {
    const c = collection(this.store, HAIKUS);
    return collectionData(c);
    // TODO - add orderBy('timestamp', 'desc'))
  }

  getUserProfile(): Observable<UserSettings> {
    return authState(this.a).pipe(
      switchMap((result) => {
        const c = collection(this.store, USERS);
        const ref = doc<UserSettings>(c, this.a.currentUser?.uid);
        return docData(ref);
      })
    );
  }

  setUserProfile(data: UserSettings) {
    return authState(this.a)
      .pipe(
        switchMap((result) => {
          const c = collection(this.store, USERS);
          const ref = doc<UserSettings>(c, this.a.currentUser?.uid);
          return from(setDoc(ref, data, { merge: true }));
        })
      )
      .subscribe();
  }

  deleteUserProfile() {
    return authState(this.a)
      .pipe(
        switchMap((result) =>
          deleteDoc(doc(collection(this.store, USERS), result.uid))
        )
      )
      .subscribe();
  }
}
