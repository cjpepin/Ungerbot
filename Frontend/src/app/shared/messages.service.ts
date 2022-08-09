import { Injectable } from '@angular/core'
import { Message } from "../models/message.model";
import { ChatBoxService } from './chatbox.service';
import { TotalDialogService } from './total-dialog.service';
import { ResponseService } from './response.service';
import { MessageApiService } from './apis/message-api.service';
import { UserApiService } from './apis/user-api.service';
import { TotalDiaLog } from '../models/totalDiaLog';
/* Build a service class that can locally store message data */
@Injectable()
export class MessageService {

  //Call services
  constructor(
    private chatBoxService: ChatBoxService,
    private totalDiaLogService: TotalDialogService,
    private responseService: ResponseService,
    private messageApiService: MessageApiService,
    private userApiService: UserApiService
  ) { }

  //Instantiate variables from other services
  private hasResponded: boolean;
  private response;
  private totalDiaLog;

/* Instantiate some test messages*/
  private messages: Message[] = [];
  //message getters and setters
  public getMessages(): Message[] {
    if (localStorage.getItem("messages")) 
      return JSON.parse(localStorage.getItem("messages"))
    else
      return this.messages;
  }
  public setMessages(message: string): void {
    let newMessage = { sent: message };
    this.messages.splice(this.messages.length, 0, newMessage);
    localStorage.setItem("messages", JSON.stringify(this.messages));
  }

  /* Update the message service with the user input */
  public updateMessage(message: string) {
    this.setMessages(message);
  }

  /* If the text box isn't empty, get a response for the message
     and add it to the message array with a second of delay to
     make it seem more human ;) */
  public sendMessage(input): void {
    /* Get the message contents, then empty the text area */
    let message = input.value;
    input.value = "";

    /* I believe Angular already sanitizes input? */

    /* Check for bot/spam*/
    if (this.chatBoxService.detectSpam(message))
      return;

    this.hasResponded = this.chatBoxService.getHasResponded();

    console.log("Response start" + this.chatBoxService.getHasResponded());
    /* If the user inputted some response*/
    if (!this.hasResponded) {
      return;
    }

    this.chatBoxService.setHasResponded(false);
    this.hasResponded = false;
    console.log();
    /* If they have sent a non-empty message*/
    
      let username = this.userApiService.getLoggedUser();
      //Placeholder until we find out why the username is null
      if (username == null) {
        this.userApiService.forceRelog();
      }
      //Check if conversation has not been started
      if (!this.messageApiService.getConversationState()) {
        //Create conversation
        this.messageApiService.setConversationState(true)

        this.messageApiService.startConversation(this.userApiService.getLoggedUser()).subscribe(conversationId => {
          this.messageApiService.setConversationId(conversationId)

          this.getMessageResponse(message, username)
        });
      } else {
        //Get message response
        this.getMessageResponse(message, username);
      }
    }
  //Send a message and receive response from message api service
  private getMessageResponse(message: string, username: string): void {
    this.totalDiaLog = this.totalDiaLogService.getTotalDiaLog();

    //Set the current message
    let curMessage: TotalDiaLog = { type: "chat-message", value: message };

    //Add the current message (without replacement) to chat dialogue
    this.totalDiaLogService.addToTotalDiaLog(curMessage);

    let inProgress = {
      type: "in-progress", value: `test`
    };
    this.totalDiaLogService.addToTotalDiaLog(inProgress);


    this.messageApiService.getResponse(message, username).subscribe(botResponse => {
      console.log(typeof(botResponse));
      this.response = JSON.parse(botResponse);
      this.checkError();

      //Save the responsed
      
      console.log(this.response);
      if (this.response.length > 1) {
        for (let i = 0; i < this.response.length; i++) {
          const res = { type: "chat-response", value: `${this.response[i]}` }
          this.totalDiaLogService.addToTotalDiaLog(res);
          this.responseService.setNumResponses(1)
        }
        this.chatBoxService.setHasResponded(true);
      }
        
      else {
        const res = { type: "chat-response", value: `${this.response}` }
        this.totalDiaLogService.addToTotalDiaLog(res);
        this.responseService.setNumResponses(1);
        this.chatBoxService.setHasResponded(true);
      }

      
    });
  }

  private checkError(): void {
    //console.log(this.response);
    if (this.response.status >= 500) {
      alert("Uh oh! Something went wrong on our end, please refresh the page or log out and back in again to get things working again");
    }
  }

}
