import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { config, environment } from './environments/environment';
// import { initializeApp } from "firebase/app";
import * as firebase from "firebase/app";

if (environment.production) {
  enableProdMode();
}

// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
firebase.initializeApp(config.firebase);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
