import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading: HTMLIonLoadingElement
  counter = 0;

  constructor(public loadingCtrl: LoadingController) { }

  async present(){
    this.counter++;
    if(this.counter !== 1) return;
    this.loading = await this.loadingCtrl.create({backdropDismiss: true});
    this.loading.onDidDismiss().then(r=>{
      this.counter = 0;
    })
    await this.loading.present();
  }

  async dismiss(){
    if(this.counter === 0) return;
    this.counter--;
    if(this.counter !== 0) return;
    await this.loading.dismiss();
  }

}
