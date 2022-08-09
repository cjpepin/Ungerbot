import { Component, OnInit, Input } from '@angular/core';
import { UserApiService } from '../../../shared/apis/user-api.service';
import { SettingsService } from '../../../shared/settings.service';
import { MatDialog } from '@angular/material/dialog'
import { PopupAuthComponent } from '../../account/popup-auth/popup-auth.component';
import { Router } from '@angular/router';
import { ThemeService } from '../../../shared/themes.service';
import { NavbarService } from '../../../shared/navbar.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  //Input toggle of whether or not to be dark mode
  public toggleState: boolean;
  public dark: boolean;
  public onAccount: boolean;
  public admin: boolean;
  public loggedIn: boolean;
  private elt: HTMLElement;
  //Call services
  constructor(
    private userApiService: UserApiService,
    private settingsService: SettingsService,
    private themeService: ThemeService,
    private dialog: MatDialog,
    private router: Router,
    private navbarService: NavbarService) { }

  ngOnInit(): void {
  
    //Find if on account
    this.onAccount = this.settingsService.getOnAccount();

    //Set dark to whatever local storage is
    this.dynamicallyToggleDark();

    this.themeService.themeStateVal.subscribe(val => {
      this.dynamicallyToggleDark();
    });

    this.admin = this.navbarService.checkAdmin();

    this.loggedIn = this.userApiService.getLoggedUser() != "Guest";
  }

  //When the use clicks logout, log out the user
  public logout(): void {
    console.log("logging user out");
    this.userApiService.logout();
  }

  //Toggle dark mode on the app
  //Still messing with this, but mostly works
  public toggleDark(): void {
    this.dark = !this.dark;

    this.setDark();
    console.log("theme " + this.themeService.getThemeState())
    console.log("dark " + this.dark)
  }

  private dynamicallyToggleDark(): void {
    setTimeout(() => {
      this.dark = this.themeService.isDark();
      this.toggleState = !this.dark;
    }, 10);
  }

  //When click on account page button, check if the user is already
  //on account. If not, go to the blank buffer page
  public goToBlank() {
    this.router.navigate([this.onAccount ? "/account" : "/blank"]);
  }
  public getRoute(): string {
    return this.onAccount ? "/account" : "/blank"
  }

  public goToAdmin() {
    this.router.navigate(["/admin"]);

  }

  //When toggled, should set the dark/light mode state of site
  public setDark(): void {
    if (this.dark)
      this.themeService.setThemeState(this.themeService.getThemeState() + 1);
    else
      this.themeService.setThemeState(this.themeService.getThemeState() - 1);

  }



}
