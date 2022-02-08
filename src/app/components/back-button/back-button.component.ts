import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent implements OnInit {

  // @Output() click2 = new EventEmitter(); // usage: click2.emit()
  @Input() defaultHref: string

  mode = 'default';

  constructor(
    public navCtrl: NavController,
  ) { }

  ngOnInit() {}

  back(){
    if(window.history.length > 1)
      this.navCtrl.back();
    else
      this.navCtrl.navigateBack(this.defaultHref);
  }

}
