import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IoService {

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
  ) { }

  async alertConfirm(message){
    const alert = await this.alertCtrl.create({
      header: message,
      buttons: [
        "Não",
        {
          text: 'Sim',
          role: 'Ok',
        }
      ]
    })
    await alert.present();
    const res = await alert.onDidDismiss();
    return res.role === 'Ok';
  }

  async alertInput(message){
    const alert = await this.alertCtrl.create({
      subHeader: message,
      inputs: [{
        name: 'name',
        type: 'text',
      }],
      buttons: [{
        text: "Cancelar",
        role: "Cancel",
      },{
        text: "OK",
        role: "Ok",
      }]
    });
    await alert.present();
    const res = await alert.onDidDismiss();
    if(res.role !== "Ok") return "";
    return res.data.values.name;
  }

  async toast(message){
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
    });
    await toast.present();
  }

}
