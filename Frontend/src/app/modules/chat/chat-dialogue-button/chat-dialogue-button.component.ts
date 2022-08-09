import { Component, OnInit, Input } from '@angular/core';
import { MessageApiService } from '../../../shared/apis/message-api.service';
import { ChatBoxService } from '../../../shared/chatbox.service';
import { TotalDialogService } from '../../../shared/total-dialog.service';

@Component({
  selector: 'app-chat-dialogue-button',
  templateUrl: './chat-dialogue-button.component.html',
  styleUrls: ['./chat-dialogue-button.component.scss']
})
export class ChatDialogueButtonComponent implements OnInit {

  constructor(
    private totalDiaLogService: TotalDialogService,
    private messageApiService: MessageApiService,
    private chatBoxService: ChatBoxService) { }

  ngOnInit(): void {
  }

  public hasResponded: boolean;
  @Input() input: string;

  //Send a response depending on which button has been pressed
  public sendResponse(response: string) {
    this.hasResponded = this.chatBoxService.getHasResponded();
    if (this.hasResponded) {
      this.chatBoxService.setHasResponded(false);
      if (response.includes("about the services"))
        this.totalDiaLogService.sendServicesButtons();
      else if (response.includes("chat with")) 
        this.totalDiaLogService.chatWithBot();
      else if (response.includes("from similar"))
        this.messageApiService.similarProducts().subscribe(val => {
          this.totalDiaLogService.sendUserServices(val, "similar");
        });
      else if (response.includes("my most popular"))
        this.messageApiService.mostPopularProducts().subscribe(val => {
          this.totalDiaLogService.sendUserServices(val, "most-popular");
        });
      else if (response.includes("on associated"))
        this.messageApiService.associatedProducts().subscribe(val => {
          this.totalDiaLogService.sendUserServices(val, "associated");
        });
    }


  }
}
