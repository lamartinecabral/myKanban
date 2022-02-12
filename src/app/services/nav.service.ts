import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  stack = [];

  constructor(
    public navCtrl: NavController,
    public router: Router,
  ) {
    window.addEventListener('popstate', (event) => {
      this.stack.pop();
      // console.log(this.stack);
    });
  }

  forward(url: string){
    this.stack.push(window.location.pathname);
    this.navCtrl.navigateForward(url);
    // console.log(this.stack);
  }

  back(defaultUrl: string){
    if(this.stack.length){
      this.navCtrl.back();
    } else {
      this.navCtrl.navigateBack(defaultUrl, {replaceUrl: true});
      // console.log(this.stack);
    }
  }

  go(url: string, replace?: boolean){
    this.router.navigateByUrl(url, {replaceUrl: !!replace})
    // console.log(this.stack);
  }

}
