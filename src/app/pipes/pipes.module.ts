import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FnPipe } from './fn.pipe';
import { LimitPipe } from './limit.pipe';
import { MomentPipe } from './moment.pipe';

@NgModule({
  declarations: [
    FnPipe,
    LimitPipe,
    MomentPipe,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    FnPipe,
    LimitPipe,
    MomentPipe,
  ]
})
export class PipesModule { }