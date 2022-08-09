import { Injectable } from '@angular/core'
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router'
import { ResponseService } from './response.service';
import { NotificationsService } from './notifications.service';
import { UserApiService } from './apis/user-api.service';
import { ThemeService } from './themes.service';
import { ErrorApiService } from './apis/error-api.service';
@Injectable()
export class ChatBoxService {

  //Call services
  constructor(
    private router: Router,
    private userApiService: UserApiService,
    private themeService: ThemeService,
    private errorApiService: ErrorApiService
    ) {
  }

  //ChatEnabled need to be accessed dynamically from components,
  //so they are created as subjects then as observables and get/set below
  private chatEnabled: Subject<boolean> = new Subject<boolean>();
  public chatEnabledVal: Observable<boolean> = this.chatEnabled.asObservable();

  //Other non-dynamic variables can be get/set normally
  private providingFeedback: boolean = this.initializeContinue();
  private hasResponded: boolean = true;

  private isFirstTime: boolean;
  private needsMoreHelp: boolean = true;
  private clickTimeout;
  private spamStrikes = 1;
  /* Variable that keeps track of the toggle state of the chat box*/
  public notifsToShow: boolean;
  private chatEnabledBool;

  //getters and setters
  public getChatEnabled(): boolean {
    return JSON.parse(localStorage.getItem("chatEnabled"));
  }
  public setChatEnabled(val: boolean) {
    this.chatEnabled.next(val);
    localStorage.setItem("chatEnabled", JSON.stringify(val));
  }
  public getHasResponded(): boolean {
    return JSON.parse(localStorage.getItem("hasResponded")) || this.hasResponded;
  }
  public setHasResponded(val: boolean) {
    this.hasResponded = val;
    localStorage.setItem("hasResponded", JSON.stringify(val));
  }
  public getProvidingFeedback(): boolean {
    return this.providingFeedback;
  }
  public setProvidingFeedback(val: boolean) {
    this.providingFeedback = val;
    localStorage.setItem("providingFeedback", JSON.stringify(val));
  }
  public getIsFirstTime(): boolean {
    return this.isFirstTime ? this.isFirstTime : JSON.parse(localStorage.getItem("isFirstTime"));
  }
  public setIsFirstTime(val: boolean) {
    this.isFirstTime = val;
    localStorage.setItem("isFirstTime", JSON.stringify(this.isFirstTime));
  }
  public getNeedsMoreHelp(): boolean {
    return JSON.parse(localStorage.getItem("needsMoreHelp")) || this.needsMoreHelp;
  }
  public setNeedsMoreHelp(val: boolean) {
    this.isFirstTime = val;
    localStorage.setItem("needsMoreHelp", JSON.stringify(this.needsMoreHelp));
  }
  public getNotifsToShow(): boolean {
    return this.notifsToShow || false;
  }
  public setNotifsToShow(val: boolean): void{
    this.notifsToShow = val;
}
  //Variable initialization functions
  public initializeNumResponses() {
    let numResponses;
    /* If there is a numResponses saved in local storage, use it, otherwise we assume it is a new chat */
    if (localStorage.getItem("numResponses"))
      numResponses = JSON.parse(localStorage.getItem("numResponses"));
    else
      numResponses = 0;
    return numResponses;
  }
  public initializeContinue() {
    let cont;
    /* If there is a continue saved in local storage, use it, otherwise we assume it is a new chat */
    if (localStorage.getItem("continue"))
      cont = JSON.parse(localStorage.getItem("continue"));
    else
      cont = false;
    return cont;
  }
  public initializeProvidingFeedback() {
    let providingFeedback;
    /* If there is a providingFeedback saved in local storage, use it, otherwise we assume it is a new chat */
    if (localStorage.getItem("providingFeedback"))
      providingFeedback = JSON.parse(localStorage.getItem("providingFeedback"));
    else
      providingFeedback = false;
    return providingFeedback;
  }

  //Detects whether or not the user is trying to spam the chat bot
  public detectSpam(message: string): boolean {
    console.log(message.length);
    //Detect click spam
    if (message.length > 200) {
      //If the message is crazy long
      //Kick from site
      if (this.spamStrikes == 0) {
        this.errorApiService.sendUserKick().subscribe();
        this.userApiService.logout();
        localStorage.clear();
        this.themeService.setLoginTheme();
        this.router.navigate(['uh-oh']);
      } else {
        this.spamStrikes -= 1;
        alert('Warning: We have detected spam, if you do it again, you will be removed from the site');
      }
      return true;
    } else {
      return false;
    }
  }
 






}
