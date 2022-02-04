import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LogGuard } from './guards/log.guard';
import { RootGuard } from './guards/root.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/root/root.module').then( m => m.RootPageModule),
    canActivate: [RootGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canActivate: [LogGuard],
    data: {user: false}
  },
  {
    path: 'boards',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [LogGuard],
    data: {user: true}
  },
  {
    path: 'boards/:id',
    loadChildren: () => import('./pages/board/board.module').then( m => m.BoardPageModule),
    canActivate: [LogGuard],
    data: {user: true}
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
