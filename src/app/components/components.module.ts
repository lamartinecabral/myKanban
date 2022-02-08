import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { BackButtonComponent } from './back-button/back-button.component';

@NgModule({
  declarations: [
    BackButtonComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [
    BackButtonComponent,
  ]
})
export class ComponentsModule { }