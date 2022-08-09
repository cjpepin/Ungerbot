import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MessageService } from '../../../shared/messages.service';
import { MessageApiService } from '../../../shared/apis/message-api.service';
import { Observable } from 'rxjs';
import { ChatBoxService } from '../../../shared/chatbox.service'
import { TotalDialogService } from '../../../shared/total-dialog.service';
import { HomeService } from '../../../shared/home.service';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { NotificationsService } from '../../../shared/notifications.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
  animations: [
    trigger('helpEnabledState', [
      state('show', style({
        opacity: 1,
      })),
      state('hide', style({
        opacity: 0,
      })),
      transition('hide <=> show', [
        animate('250ms ease-out')
      ])
    ]),
    trigger('chatEnabledState', [
      state('show', style({
        opacity: 1,
      })),
      state('hide', style({
        opacity: 0,
      })),
      transition('hide <=> show', [
        animate('250ms ease-out')
      ])
    ]), trigger('notficationState', [
      state('show', style({
        opacity: 1,
      })),
      state('hide', style({
        opacity: 0,
      })),
      transition('hide <=> show', [
        animate('250ms ease-out')
      ])
    ])
  ]
})
export class ChatBoxComponent implements OnInit {

  private data: Observable<MessageApiService>;

  public chatEnabled: boolean;
  public totalDiaLog;
  public isAtBottom;
  public mobile: boolean;
  public helpEnabled: boolean = false;
  public notifsToShow;
  public usingChatBox: boolean;
  public usingButtons: boolean;
  @ViewChild('input') input: ElementRef;
  @ViewChild('helpMenu') helpMenu: ElementRef;
  /*Import necessary services*/
  constructor(
    private notificationsService: NotificationsService,
    private messageService: MessageService,
    private totalDiaLogService: TotalDialogService,
    private chatBoxService: ChatBoxService,
    private homeService: HomeService,
  ) { }

  /* Instantiate all the variables based on localstorage/lack of*/
  ngOnInit() {
    if (localStorage.getItem("helpEnabled"))
      this.helpEnabled = JSON.parse(localStorage.getItem("helpEnabled"))
    else
      this.helpEnabled = false;
    //Start by having hovering false, then change if detected as true
    localStorage.setItem("isHovering", JSON.stringify(false));

    //Initialize the chat with the first message
    this.initializeTotalDiaLog();

    this.pushChatDown();
    //Update the chat with all the messages whenever a message is sent/received
    this.totalDiaLogService.totalDiaLogVals.subscribe(val => {
      console.log(val)
      this.totalDiaLog = val;
      this.pushChatDown();
      this.usingChatBox = this.totalDiaLogService.getUsingChatBox();
      this.usingButtons = this.totalDiaLogService.getUsingButtons();
      this.toggleChatInput();
    })
    //Update chat on init
    this.usingChatBox = this.totalDiaLogService.getUsingChatBox();
    this.usingButtons = this.totalDiaLogService.getUsingButtons();
    this.toggleChatInput();

    //detect if chat is at the bottom
    this.isAtBottom = true;

    //detect if the screen is mobile sized, and if so, go on top of chat button instead of to the side
    this.mobile = this.homeService.getMobile();
    if (this.mobile)
      this.changeChatBoxPos();

    //See hwo many notifications should be shown
    this.notifsToShow = this.notificationsService.getNumNotifications() > 0 ? true : false;

    //Update whether or not there is notifications to show*/
    this.notificationsService.numNotificationsValue.subscribe(val => {
      this.notifsToShow = val > 0 ? true : false;
    });

    //Check if it is the first time chatting or not
    this.checkIfFirstTime();
  }

  //If using keyboard to chat with chatbot, make the chat box visible
  private toggleChatInput(): void {
    if (this.usingChatBox)
      document.getElementById("form").style.visibility = "visible";
    else
      document.getElementById("form").style.visibility = "hidden";


  }

  //Scrolls to bottom of div when chat is updated
  public pushChatDown(): void {
    let chatBox = document.getElementById("messages");
    setTimeout(() => {
      chatBox.scrollTop = 9999999;
    }, 1);
  }

  /* Toggles the active state of the message box */
  public toggleChat(): void {
    let chatBox: HTMLElement = this.getChatBox();
    this.chatEnabled = !this.chatEnabled;
    this.chatBoxService.setChatEnabled(this.chatEnabled);
    if (!this.chatEnabled) {
      chatBox.style.display = "none";
    } else {
      chatBox.style.display = "inline";
      this.onChatOpen();
    }
  }


  //Get the chat box element from the dom
  private getChatBox(): HTMLElement {
    return document.getElementById("chat-box")
  }

  //detect if the user is at the bottom of the chat or not
  public checkIsAtBottom(): void {
    const elt = document.getElementById("messages");
    if (elt.offsetHeight + elt.scrollTop >= elt.scrollHeight || elt.scrollHeight < elt.offsetHeight) {
      this.isAtBottom = true;
    } else {
      this.isAtBottom = false;
    }
  }

  //Send a message via the message service on submit
  public sendMessage(message): void {
      this.messageService.sendMessage(message);
  }

  //Initialize the dialog with the first message and save that to local storage
  private initializeTotalDiaLog(): void {
    this.totalDiaLog = this.totalDiaLogService.initializeTotalDiaLog();
    localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog));
  }

  //When the screen is mobile sized, change the location of the chat box
  //Probably could have done this in css with @media... but it works I guess
  private changeChatBoxPos(): void {
    let chatBox = document.getElementById("button-container")
    chatBox.style.bottom = "70px";
    chatBox.style.right = "5px";
  }

  //Check if the chat should be flagged as being the first first message or not
  private checkIfFirstTime(): void {
    let dialogObj = this.totalDiaLogService.getTotalDiaLog();
    if (Object.keys(dialogObj).length == 0)
      this.chatBoxService.setIsFirstTime(true);
  }

  //Toggle help menu active state
  public toggleHelpMenu() {
    this.helpEnabled = !this.helpEnabled;
    if (this.helpEnabled)
      this.helpMenu.nativeElement.style.visibility = "visible";
    else
      this.helpMenu.nativeElement.style.visibility = "hidden";

    localStorage.setItem("helpEnabled", JSON.stringify(this.helpEnabled));
  }

  //Get the state of the help screen for animation
  public get helpState() {
    return this.helpEnabled ? 'show' : 'hide';
  }

  //Get the states of chat and notifs enabled to decide on animations
  get stateName() {
    return this.chatBoxService.getChatEnabled() ? 'show' : 'hide';
  }

  get notifState() {
    return this.chatBoxService.getNotifsToShow() ? 'show' : 'hide';
  }

  //Remove notifications and make sure the chat is pushed all the way down when the chat gets open
  private onChatOpen(): void {
    this.notifsToShow = false;
    this.notificationsService.clearNotifications();
    this.pushChatDown();
  }

  //Remove subscriptions when component is left
  //This is a best practice I think, but not necessary for now
  //private subs = new SubscriptionsContainer();
/*  ngOnDestroy() {
    this.subs.dispose();
  }*/

  //Set text errors
  textFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

  //If you press the back button, the chat should return to original state
  public resetChat() {
    if (this.chatBoxService.getHasResponded())
      this.totalDiaLogService.resetTotalDiaLog();
  }

  //Check if the user is at the beginning chat menu, chatting with chat bot, or using buttons
  public checkType(): string {
    if (this.usingChatBox)
      return 'chat';
    if (this.usingButtons)
      return 'click';
    else
      return 'intro';
  }

}
