import { Injectable } from '@angular/core'
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router'
import { ResponseService } from './response.service';
import { UserApiService } from './apis/user-api.service';
@Injectable()
export class ThemeService {

  //Call services
  constructor(
    private userApiService: UserApiService,
  ) { }
  //Set dynamic theme state
  private themeState: Subject<number> = new Subject<number>();
  themeStateVal = this.themeState.asObservable();

  private customThemeState: Subject<object> = new Subject<object>();
  customThemeVal = this.customThemeState.asObservable();

  public isDark(): boolean {
    if (this.getThemeState() % 2 == 0)
      return false;
    else
      return true;
  }
  //Gets the theme state
  public getThemeState(): number {
    return JSON.parse((localStorage.getItem("theme"))) || 0;
  }
  public setThemeState(val: number) {
    this.themeState.next(val)
    this.userApiService.setTheme(val).subscribe();
    localStorage.setItem("theme", JSON.stringify(val));
  }
  //Gets the theme state
  public getCustomThemeState(): number {
    return JSON.parse((localStorage.getItem("custom-theme"))) || 0;
  }
  public getCustomTheme(): string {
    return JSON.parse(localStorage.getItem("custom-theme")) || "";
  }
  public setCustomTheme(val: object) {
    this.customThemeState.next(val)
    this.userApiService.setCustomTheme(val).subscribe();
    localStorage.setItem("custom-theme", JSON.stringify(val));
  }
  //Sets the theme state
  public setLoginTheme(): void {
    this.themeState.next(0);
  }

  //Sets the custom theme variables
  public setCustomThemeFromVars(pl: string, pd: string, al: string, ad: string, wl: string, wd: string): void {
    document.documentElement.style.setProperty("--primary-light", pl);
    document.documentElement.style.setProperty("--primary-dark", pd);
    document.documentElement.style.setProperty("--accent-light", al);
    document.documentElement.style.setProperty("--accent-dark", ad);
    document.documentElement.style.setProperty("--warn-light", wl);
    document.documentElement.style.setProperty("--warn-dark", wd);
  }
  public setCustomThemeFromObj(customTheme): void {
    document.documentElement.style.setProperty("--primary-light", customTheme.pl);
    document.documentElement.style.setProperty("--primary-dark", customTheme.pd);
    document.documentElement.style.setProperty("--accent-light", customTheme.al);
    document.documentElement.style.setProperty("--accent-dark", customTheme.ad);
    document.documentElement.style.setProperty("--warn-light", customTheme.wl);
    document.documentElement.style.setProperty("--warn-dark", customTheme.wd);
  }

  //Set the custom theme
  public setCurrentCustomTheme(): void {
    let rawTheme = this.getCustomTheme();
    this.setCustomThemeFromObj(rawTheme);
  }
}
