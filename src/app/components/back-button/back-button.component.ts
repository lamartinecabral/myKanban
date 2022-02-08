import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavService } from 'src/app/services/nav.service';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent implements OnInit {

  // @Output() click2 = new EventEmitter(); // usage: click2.emit()
  @Input() defaultHref: string

  constructor(
    public nav: NavService
  ) { }

  ngOnInit() {}

  back(){
    this.nav.back(this.defaultHref);
  }

}
