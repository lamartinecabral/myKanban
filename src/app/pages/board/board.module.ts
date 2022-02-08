import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BoardPageRoutingModule } from './board-routing.module';

import { BoardPage } from './board.page';
import { LimitPipe } from 'src/app/pipes/limit.pipe';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BoardPageRoutingModule
  ],
  declarations: [BoardPage, LimitPipe, BackButtonComponent]
})
export class BoardPageModule {}
