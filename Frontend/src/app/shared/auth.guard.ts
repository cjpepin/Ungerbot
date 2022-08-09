import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router'
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserApiService } from './apis/user-api.service';
import { ThemeService } from './themes.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  //Initialize router and jwtHelper
  constructor(
    private router: Router,
    private jwtHelper: JwtHelperService,
    private userApiService: UserApiService,
    private themeService: ThemeService) { }

  //Check if the user can get to this point in the website
  public canActivate(): boolean {
    if (this.router.url !== "/") {
      this.userApiService.verifyRefreshToken().subscribe(val => {
        console.log(this.userApiService.getLoggedUser())
        if (val.status === 400 && this.userApiService.getLoggedUser() !== "Guest") {
          //Otherwise, push the user back to the login page
          this.userApiService.removeUser();
          this.themeService.setLoginTheme();
          return false;
        }
        if (val === this.userApiService.getLoggedUser()) {
          this.userApiService.refreshToken().subscribe();
          return true;
        }
        return false;
      });
    }
    return true;
  }
}
