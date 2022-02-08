import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FnPipe } from './fn.pipe';
import { LimitPipe } from './limit.pipe';

@NgModule({
  declarations: [
    FnPipe,
    LimitPipe,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    FnPipe,
    LimitPipe,
  ]
})
export class PipesModule { }