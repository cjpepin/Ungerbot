
import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { ChatBoxService } from './chatbox.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  //Call services
  constructor(
    private chatBoxService: ChatBoxService) { }

  //Create dynamic variable to send number of notifications
  private numNotifications: Subject<number> = new Subject<number>();
  public numNotificationsValue = this.numNotifications.asObservable();

  //Getters and setters
  public getNumNotifications(): number {
    return JSON.parse(localStorage.getItem("numNotifs"));
  }
  public setNumNotifications(val: number) {
    let newVal: number;
    if (localStorage.getItem("numNotifs")) {
      newVal = +this.getNumNotifications() + val;
    }
    else {
      newVal = val;
    }
    this.numNotifications.next(newVal);
    localStorage.setItem("numNotifs", JSON.stringify(newVal));
  }

  //Check to see if there should be notifications
  public checkForNotifs(hasResponded: boolean): void {
    if (!hasResponded && this.chatBoxService.getChatEnabled()) {
      this.setNumNotifications(1);
    }
  }
  //When the chat gets opened, there shouldn't be any more notifications to show
  public clearNotifications(): void {
    localStorage.setItem("numNotifs", JSON.stringify(0));
  }
  //Check if the chat is open.
  public checkChatOpen(): void {
  //If not, add a notification
    if (!this.chatBoxService.getChatEnabled()) {
      this.setNumNotifications(1);
    }
  }
}
