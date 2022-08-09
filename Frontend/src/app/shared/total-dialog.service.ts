import { Injectable } from '@angular/core'
import { Subject } from 'rxjs';
import { buffer } from 'rxjs/operators';
import { TotalDiaLog } from '../models/totalDiaLog'
import { MessageApiService } from './apis/message-api.service';
import { UserApiService } from './apis/user-api.service';
import { ChatBoxService } from './chatbox.service'
import { NotificationsService } from './notifications.service';
import { ResponseService } from './response.service'
@Injectable()
export class TotalDialogService {

  //Call services
  constructor(
    private chatBoxService: ChatBoxService,
    private responseService: ResponseService,
    private notificationsService: NotificationsService,
    private messsageApiService: MessageApiService,
    private userApiService: UserApiService
  ) { }

  //Dynamic variable to keep track of the message dialogue
  private totalDiaLogSub: Subject<TotalDiaLog> = new Subject<TotalDiaLog>();
  public totalDiaLogVals = this.totalDiaLogSub.asObservable();

  private totalDiaLog;
  private hasResponded: boolean = this.chatBoxService.getHasResponded();

  private usingChatBox: boolean;
  private usingButtons: boolean;

  private buttons = [
    { type: "click-button", value: "What are my most popular items?" },
    { type: "click-button", value: "What are recommended items from similar users?" },
    { type: "click-button", value: "What are recommended items based on associated items?" },
  ]

  private questionsObj = {
    "most-popular": "What are my most popular items?",
    "similar": "What are recommended items from similar users?",
    "associated": "What are recommended items based on associated items?",
  };

  public getUsingChatBox(): boolean{
    return JSON.parse(localStorage.getItem("usingChatBox")) || this.usingChatBox;
  }
  public setUsingChatBox(val: boolean): void {
    localStorage.setItem("usingChatBox", JSON.stringify(val));
    this.usingChatBox = val;
  }

  public getUsingButtons(): boolean {
    return JSON.parse(localStorage.getItem("usingButtons")) || this.usingButtons;
  }
  public setUsingButtons(val: boolean): void {
    localStorage.setItem("usingButtons", JSON.stringify(val));
    this.usingButtons = val;
  }



  private nos: string[] = ["No", "no", "Nope", "nope", "NOpe", "NOPe", "NOPE", "NO", "N",]
  private yess: string[] = ["Yes", "yes", "yeah", "yuh", "yup", "YES"]

  private inProgress = {
  type: "in-progress", value: `test`};

  private timeOut = 1500;
  /* Setting the chat that should appear when the chat button is clicked*/
  public initializeTotalDiaLog(): TotalDiaLog {
    /* If there is a chat saved in local storage, use it, otherwise we assume it is a new chat */
    let diaLog: TotalDiaLog;
    return diaLog = JSON.parse(localStorage.getItem("totalDiaLog")) ? JSON.parse(localStorage.getItem("totalDiaLog")) :
        [{ type: "intro-response", value: "Hello! My name is Ungerbot. Would you like to..." },
        { type: "intro-button", value: "learn about the services Ungerboeck has to offer" },
          { type: "intro-button", value: "chat with Ungerbot" }];
  }

  //Get a response if you are chatting with chatbot
  public chatWithBot(): void {
    this.setUsingChatBox(true);
    this.totalDiaLog = this.getTotalDiaLog();
    if (!this.checkChatContains('chat-response')) {
      const res = { type: "chat-response", value: "Hi. What would you like to chat about?" };
      this.totalDiaLog.splice(this.totalDiaLog.length, 0, res)
   
    }
    this.totalDiaLogSub.next(this.totalDiaLog);
    localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog));
    this.chatBoxService.setHasResponded(true);

  }

  //Get a response to button clicks
  public sendServicesButtons(): void {
    this.setUsingButtons(true);
    this.totalDiaLog = this.getTotalDiaLog();
    console.log(this.totalDiaLog)
    if (!this.checkChatContains('click-button')) {
      for (let button of this.buttons)
        this.totalDiaLog.push(button);
      console.log("not found")
    }

    console.log("found")
    this.totalDiaLogSub.next(this.totalDiaLog);
    localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog));
    this.chatBoxService.setHasResponded(true);
  }

  private stringToArray(listOfResponses: string) {
    console.log(listOfResponses)
    let arr = JSON.parse(listOfResponses);

    if (arr.length > 1) {
      for (let i = 0; i < arr.length; i++) {
        const res = { type: "click-response", value: `${arr[i]}` }
        this.addToTotalDiaLog(res);
        this.responseService.setNumResponses(1)
      }
      this.chatBoxService.setHasResponded(true);
    }

    else {
      const res = { type: "click-response", value: `${arr}` }
      this.addToTotalDiaLog(res);
      this.responseService.setNumResponses(1);
      this.chatBoxService.setHasResponded(true);
    }
  }

  //Reset the buttons dialog when message is sent
  public sendUserServices(val: string, type: string): void {
    console.log(val)
    const numButtons = Object.keys(this.questionsObj).length;
    const message = { type: "click-message", value: `${this.questionsObj[type]}` };
    this.totalDiaLog = this.getTotalDiaLog();

    //Delete the buttons
    let count = numButtons;
    for (let i = this.totalDiaLog.length - 1; i >= 0; i--) {
      if (count === 0) {
        console.log("done")
        break
      }
      else if (this.totalDiaLog[i].type === "click-button") {
        this.totalDiaLog.splice(i, 1);
        count -= 1;
        console.log("removing buttons")
      } else
        continue;
    }

    //Add the message and response
    this.totalDiaLog.splice(this.totalDiaLog.length, 0, message);
    localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog));

    this.stringToArray(val);

    //Re add the buttons
    for (let curButton of this.buttons) {
      this.totalDiaLog.splice(this.totalDiaLog.length, 0, curButton);
    }

    this.totalDiaLogSub.next(this.totalDiaLog);
    localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog));
    this.chatBoxService.setHasResponded(true);
  }

  //Reset vars when user goes back to intro page
  public resetTotalDiaLog(): void {
    this.setUsingButtons(false)
    this.setUsingChatBox(false)
    this.totalDiaLog = this.getTotalDiaLog();
    this.totalDiaLogSub.next(this.totalDiaLog);
  }

  //Sends a ... message to let the user know the bot is thinking
  public sendLoadingMessage(chat: boolean): void {
    let inProgress = {
      type: "in-progress", value: `test`
    };

    console.log(this.totalDiaLog);
    this.totalDiaLog = this.initializeTotalDiaLog();
    this.totalDiaLog.splice(this.totalDiaLog.length, 0, inProgress);
    localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog));
  }

  //Get the message dialogue from local storage
  public getTotalDiaLog(): any {
    return this.initializeTotalDiaLog(); 
  }

  //Like a setter, but set was already taken 
  public addToTotalDiaLog(content: any): void {
    this.totalDiaLog = this.getTotalDiaLog();
    if (this.totalDiaLog[this.totalDiaLog.length - 1].type === "in-progress")
      this.totalDiaLog.pop();

    this.totalDiaLog.splice(this.totalDiaLog.length, 0, content);
    this.totalDiaLogSub.next(this.totalDiaLog);
    console.log(this.totalDiaLog);

    localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog));
  }

  private checkChatContains(val: string): boolean {
    for (let entry of this.totalDiaLog)
      if (entry.type === val)
        return true
    return false;
  }


  // |
  // |   Original chat logic, changed to above logic
  //\ /

  //Add messages to the chat dialogue
  public setTotalDiaLog(message: string, response: Response) {
    //Update vars
    const providingFeedback: boolean = this.chatBoxService.getProvidingFeedback();
    let firstTime: boolean = this.chatBoxService.getIsFirstTime() !== null ? this.chatBoxService.getIsFirstTime() : true;
    const isYes = this.testForYes(message);
    const isNo = this.testForNo(message);
    //Make sure that totalDialog is updated
    this.totalDiaLog = this.getTotalDiaLog();

    //If this is the first response from the user
    if (firstTime) {
      this.chatBoxService.setIsFirstTime(false);
      this.askIfNeedMoreAssistance(response);
      //If it is not the first time, and the user says "yes" they would like to keep asking questions
    } else if (!firstTime && isYes && !isNo && !providingFeedback) {
      this.askingMoreQuestions();
      this.chatBoxService.setIsFirstTime(false);

      //Assuming a message length greater than 4 means they are searching for something new
    } else if (!firstTime && !isNo && !providingFeedback) {
      this.askIfNeedMoreAssistance(response);
      this.chatBoxService.setIsFirstTime(false);

      //If it is not the first time, and the user says "no" they would not like to keep asking questions
    } else if (!firstTime && isNo && !providingFeedback) {

      this.askForFeedback();
      this.chatBoxService.setProvidingFeedback(true)

    }
    //If the user is providing feedback
    else if (!firstTime && providingFeedback) {
      this.feedbackResponse(response)
      this.resetChat();

    }
  }

  //Finish conversation
  private feedbackResponse(response: Response): void {
    //send response to server
    let responseQuestion: TotalDiaLog = {
      type: "chat-response", value: `Thank you for your feedback!
                                  If you have any more questions,
                                  feel free to come back anytime!` };
    this.timedResponse(responseQuestion);
  }

  //Ask for another response to accept
  private askingMoreQuestions(): void {
    let responseQuestion: TotalDiaLog = { type: "chat-response", value: "What other services might you be interested in?" };
    this.timedResponse(responseQuestion);
  }

  //Ask for feedback on the services
  private askForFeedback(): void {
    let responseQuestion = {
      type: "chat-response", value: `Great! Thank you for using chat bot!
                                  We would appreciate if you could
                                  take the time to provide some feedback.
                                  Could you rate the accuracy/relevance
                                  of the responses given on a scale of
                                  1 to 10?`};
    this.timedResponse(responseQuestion);
  }

  //Ask if there is anything else to be helped with
  private askIfNeedMoreAssistance(response: Response) {
    let curResponse = { type: "chat-response", value: response };
    let responseQuestion = { type: "chat-response", value: "Is there anything else we can help you with right now?" };
    
    setTimeout(() => {
      this.notificationsService.checkChatOpen();
      this.totalDiaLog.splice(this.totalDiaLog.length -1, 1, curResponse);
      this.totalDiaLogSub.next(this.totalDiaLog);
    }, this.timeOut);
    setTimeout(() => (localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog))), this.timeOut + 1);
    setTimeout(() => { this.hasResponded = true; this.chatBoxService.setHasResponded(true) }, this.timeOut + 2);
  }

  //Function that returns two buttons the user can click
  private wasThatHelpful(response: Response) {
    let curResponse = { type: "chat-response", value: response };
    let responseQuestion = { type: "chat-response", value: "Was that helpful?" };
    let yesButton = { type: "chat-button", value: "Yes" };
    let noButton = { type: "chat-button", value: "No" };
 
    setTimeout(() => {
      this.notificationsService.checkChatOpen();
      this.totalDiaLog.splice(this.totalDiaLog.length - 1, 1, curResponse);
      this.totalDiaLogSub.next(this.totalDiaLog);
    }, this.timeOut);
    setTimeout(() => {
      this.notificationsService.checkChatOpen();
      this.totalDiaLog.splice(this.totalDiaLog.length, 0, responseQuestion);
      this.totalDiaLog.splice(this.totalDiaLog.length, 0, yesButton);
      this.totalDiaLog.splice(this.totalDiaLog.length, 0, noButton);
      this.totalDiaLogSub.next(this.totalDiaLog);
    }, this.timeOut + 500);
    setTimeout(() => (localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog))), this.timeOut + 501);
    setTimeout(() => { this.hasResponded = true; this.chatBoxService.setHasResponded(true) }, this.timeOut + 502);
  }

  //Set the timed response to feel more ~human~
  private timedResponse(responseQuestion: TotalDiaLog) {

    setTimeout(() => {
      this.notificationsService.checkChatOpen();
      this.totalDiaLog.splice(this.totalDiaLog.length - 1, 1, responseQuestion);
      this.totalDiaLogSub.next(this.totalDiaLog);

    }, this.timeOut);
    setTimeout(() => (localStorage.setItem("totalDiaLog", JSON.stringify(this.totalDiaLog))), this.timeOut + 1);
    setTimeout(() => { this.hasResponded = true; this.chatBoxService.setHasResponded(true) }, this.timeOut + 2);
  }

  //Check if the user message contains anything from the possible "yes" values
  private testForYes(message: string): boolean{
    let yes = false;
    this.yess.forEach(y => {
      if (message.includes(y)) {
        yes = true;
      }
    })
    return yes;
  }

  //Check if the user message contains anything from the possible "no" values
  private testForNo(message: string): boolean {
    let no = false;
    let curMessage = message.replace("\n","")
    this.nos.forEach(noVal => {
      if (curMessage == noVal) {
        no = true;
      }
    })
    return no;
  }
  private resetChat(): void {
    this.chatBoxService.setIsFirstTime(true);
    this.chatBoxService.setProvidingFeedback(false);
    this.messsageApiService.setConversationState(false);
    let responseQuestion = { type: "chat-spacer", value: "Chat session has ended. Type a new question to keep talking to Ungerbot." };
    setTimeout(() => {
      this.totalDiaLog.splice(this.totalDiaLog.length, 0, responseQuestion);
      this.totalDiaLogSub.next(this.totalDiaLog);
    }, this.timeOut);
  }
}
