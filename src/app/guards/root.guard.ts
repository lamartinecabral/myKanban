import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RootGuard implements CanActivate {

  constructor(public router: Router, public auth: AuthService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.user$.pipe(mergeMap((user)=>{
      if(user){
        this.router.navigateByUrl('boards',{replaceUrl: true});
      } else {
        this.router.navigateByUrl('login',{replaceUrl: true});
      }
      return of(false);
    }))
  }
  
}
