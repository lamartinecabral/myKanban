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
      subHeader: message,
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

  async alertInput(message, value?){
    const alert = await this.alertCtrl.create({
      subHeader: message,
      inputs: [{
        name: 'name',
        value: value,
        cssClass: "alert-input",
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
    document.querySelector('ion-alert .alert-input').addEventListener('keydown',(e: KeyboardEvent)=>{
      if((e.key == 'Enter' || e.code == 'Enter' || e.keyCode == 13) && !e.ctrlKey && !e.shiftKey)
        (document.querySelector('ion-alert .alert-button-role-Ok') as any).click();
    })
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
