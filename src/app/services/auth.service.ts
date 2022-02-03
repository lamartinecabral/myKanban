import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { signOut, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: any;
  user$: ReplaySubject<any> = new ReplaySubject(1);

  constructor() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        console.log(user.email, user.uid);
        this.user$.next(user);
      } else {
        // User is signed out
        // ...
        this.user$.next(null);
      }
    });
  }

  signIn(email,password){
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
        return {
          user: user,
          error: null
        };
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        return {
          user: null,
          error: error
        };
      });
  }

  createUser(email,password){
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
        return {
          user: user,
          error: null
        };
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.error(error);
        return {
          user: null,
          error: error
        };
      });
  }

  logout(){
    const auth = getAuth();
    return signOut(auth);
  }
  
}
