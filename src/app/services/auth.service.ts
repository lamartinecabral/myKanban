import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import * as firebaseAuth from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: firebaseAuth.User;
  user$: ReplaySubject<any> = new ReplaySubject(1);

  constructor() {
    const { getAuth, onAuthStateChanged } = firebaseAuth;
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in");
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        console.log(user.email, user.uid);
        this.user = user;
        this.user$.next(user);
      } else {
        console.log("User is signed out");
        // User is signed out
        // ...
        this.user = null;
        this.user$.next(null);
      }
    });
  }

  signIn(email,password){
    const { getAuth, signInWithEmailAndPassword } = firebaseAuth;
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
  }

  createUser(email,password){
    const { getAuth, createUserWithEmailAndPassword } = firebaseAuth;
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, password);
  }

  logout(){
    const { getAuth, signOut } = firebaseAuth;
    const auth = getAuth();
    return signOut(auth);
  }

  resetPassword(email){
    const { getAuth, sendPasswordResetEmail } = firebaseAuth;
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email);
  }
  
}
