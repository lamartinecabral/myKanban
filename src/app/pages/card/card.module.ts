import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CardPageRoutingModule } from './card-routing.module';

import { CardPage } from './card.page';
import { FnPipe } from 'src/app/pipes/fn.pipe';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardPageRoutingModule
  ],
  declarations: [CardPage, FnPipe, BackButtonComponent]
})
export class CardPageModule {}
