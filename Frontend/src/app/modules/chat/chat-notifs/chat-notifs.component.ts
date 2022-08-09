import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../../shared/notifications.service';
@Component({
  selector: 'app-chat-notifs',
  templateUrl: './chat-notifs.component.html',
  styleUrls: ['./chat-notifs.component.scss']
})
export class ChatNotifsComponent implements OnInit {
  //Save number of notifications
  public numNotifs: number;

  //Use the notificataion service for helper variables
  constructor(
    private notificationsService: NotificationsService) { }

  ngOnInit(): void {
    //Get the numeber of notifications
    this.numNotifs = this.notificationsService.getNumNotifications();

    //If the number of notifications changes, update the local value from the service
    this.notificationsService.numNotificationsValue.subscribe(val => {
      this.numNotifs = val;
    });
  }



}
