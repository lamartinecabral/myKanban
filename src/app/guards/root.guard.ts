import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NavService } from '../services/nav.service';

@Injectable({
  providedIn: 'root'
})
export class RootGuard implements CanActivate {

  constructor(
    public nav: NavService,
    public auth: AuthService
  ){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.user$.pipe(mergeMap((user)=>{
      if(user){
        this.nav.go('boards', true);
      } else {
        this.nav.go('login', true);
      }
      return of(false);
    }))
  }
  
}
