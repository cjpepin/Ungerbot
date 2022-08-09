import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators'
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserApiService } from './shared/apis/user-api.service';
import { ChatBoxService } from './shared/chatbox.service';
import { ThemeService } from './shared/themes.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  //Initialize variables
  private styleTag: HTMLStyleElement;
  public dark: boolean;
  public theme: number;
  private themeInd: number;
  private tabCount: number;
  private scrollMenuActive: boolean;
  private settingsMenuActive: boolean;
  //initialize constructors and styling
  constructor(
    private chatBoxService: ChatBoxService,
    private userApiService: UserApiService,
    private themeService: ThemeService,
    private jwtHelper: JwtHelperService,
    private router: Router  ) {
    
    this.styleTag = this.buildStyleElement();
  }

  //Initialize available themes list
  private themesList: {} = {
    0: 'lb-light',
    1: 'lb-dark',
    2: 'ind-light',
    3: 'ind-dark',
    4: 'custom-light',
    5: 'custom-dark'
    
  }

  ngOnInit() {

    //Set theme to base theme on enter login, then change on submit login
    this.themeInd = this.themeService.getThemeState();
    this.setTheme(this.themeInd);
    //Initialize/update tab count
    this.tabCount = parseInt(localStorage.getItem("tabCount"));
    this.tabCount = Number.isNaN(this.tabCount) ? 1 : ++this.tabCount;
    localStorage.setItem("tabCount", this.tabCount.toString());

    this.themeService.themeStateVal.subscribe(val => {
      this.setTheme(val);
    })
  }
  private setTheme(val: number): void {
    this.themeInd = val;
    if (this.themeInd == 4 || this.themeInd == 5)
      this.themeService.setCurrentCustomTheme();
    this.theme = this.themesList[this.themeInd];
  }
  //On any click even, update the refresh token
  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent) {
    if (this.router.url !== "/" && this.router.url !== "/create-account") {
      this.userApiService.verifyRefreshToken().subscribe(val => {
        if (val.status === 400)
          this.userApiService.removeUser();
        if (val === this.userApiService.getLoggedUser())
          this.userApiService.refreshToken().subscribe();
      })
    }
  }

  /* This group of functions allows scrolling to
   * not happen when hovering over the chat box,
   so when you scroll in the chat, you don't
   inadvertantly scroll the whole window*/
  private buildStyleElement(): HTMLStyleElement {
    let style = document.createElement("style");

    style.type = "text/css";
    style.textContent = `
      body {
        overflow:hidden !important;
      }
    `
    return style;
  }
  public enable(): void {
    document.body.appendChild(this.styleTag);
  }
  public disable(): void {
    document.body.removeChild(this.styleTag);
  }
}
