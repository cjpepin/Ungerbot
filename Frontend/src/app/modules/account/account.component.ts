import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserApiService } from '../../shared/apis/user-api.service';
import { SettingsService } from '../../shared/settings.service';
import { ThemeService } from '../../shared/themes.service';
import { PopupCustomThemeComponent } from './popup-custom-theme/popup-custom-theme.component';
import { MessageApiService } from '../../shared/apis/message-api.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  //Declare services
  constructor(
    private userApiService: UserApiService,
    private messageApiService: MessageApiService,
    private settingsService: SettingsService,
    private themeService: ThemeService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog) { }

  //Declare pfp path base 64 string, and selector state
  pfpPath: string | SafeResourceUrl;
  b64String: string;
  selectorState: boolean = false;
  private theme: number;
  public user: string;
  public userEmail: string;
  public clickedListItem: "Account" | "Theme" | "MessageHistory" = "Account";
  public usernameAutofilled: boolean;
  public customExists: boolean;
  public formControl = new FormControl('', this.conflictValidator())
  public usernameConflict: boolean = false;
  public timeStamps;
  public conversations;
  public dateSelected;
  ngOnInit(): void {
    //Let the settings service know we are on the account page
    this.settingsService.setOnAccount(true);
    //If there is no pfp to get from db, set it to default image
    this.userApiService.getPfp().subscribe(data => {
      if (!data)
        this.pfpPath = "../../../assets/images/blank-pfp.webp";
      else
        this.setImage(data);
    })

    //Set the theme
    this.theme = this.themeService.getThemeState();
    //Check if the custom theme exists for a user
    this.customExists = this.themeService.getCustomTheme() !== "" ? true : false;
    //Set the scss variables to be the custom theme variables if the user switches to the custom theme
    this.themeService.setCurrentCustomTheme();
    this.user = this.userApiService.getLoggedUser();
    this.userApiService.getEmail(this.user).subscribe(response => this.userEmail = response);
    this.theme = this.themeService.getThemeState();

    this.getChatHistory();
    this.dateSelected = false;
  }

  conflictValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.usernameConflict ? { usernameConflict:true } : null;
    }
    
  }

  // Sets clickedItem
  onClickListItem(item: "Account" | "Theme" | "MessageHistory") {
    this.clickedListItem = item;
  }

  //Take in the file and
  // 1. Check the file size is small enough
  // 2. Convert the file to base64 string
  // 3. Send the string to the db
  public processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();
    if (this.checkFileSize(file)) {
      reader.readAsDataURL(file);
      this.getBase64String(reader);
    }
  }

  //Takes in a FileReader, and converts the results to a base64 string
  private getBase64String(reader: FileReader) {
    reader.onload = (e: any) => {
      this.pfpPath = e.target.result;

      this.b64String = (<string>reader.result).replace("data:", "")
        .replace(/^.+,/, "");

      //Take created b64 string and upload it to the user's document in db
      this.userApiService.uploadPfp(this.b64String).subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      )

    }
  }

  public updateUserSettings(newUsername: string, newEmail: string) {

    // Check to see if user tries to change username to the same one they already have
    if (this.userApiService.getLoggedUser() === newUsername) {
      return;
    }

    this.usernameConflict = false;
    this.userApiService.updateUserSettings(newUsername, newEmail)
      .subscribe(
        (response) => {
          console.log(response.status);
          // Ok
          if (response.status === 200) {
            this.userApiService.setLoggedUser(newUsername);

            // Require user to log back in to generate new jwt access token
            this.userApiService.forceRelog("You must relog after changing user settings.");
          }
          // Conflict
          else if (response.status === 409) {
            this.usernameConflict = true;
          }
        }
    );
  }

  //Logout user
  public logout() {
    this.userApiService.logout();
  }

  public getWhiteText() {
    return (this.themeService.getThemeState() % 2 == 1);
  }

  //Takes in a file and checks if it is below 15 kb
  private checkFileSize(file: File): boolean {
    const kb = file.size * 0.00001;
    if (kb > 15) {
      alert("Your file must be below 15kb. \n Currently, your file is " + kb + "kb");
      return false;
    }
    return true;
  }

  //Sets the image path based on the base64 input
  private setImage(base64: string): void {
    this.pfpPath = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${base64}`);
  }

  //Toggle the active state of the theme selector
  public toggleSelector(): void {
    this.selectorState = !this.selectorState;
  }

  //On click, record the theme that should be shown
  public selectTheme(e: Event): void {
    //Get the clicked element as html element
    let clickElt = e.target as HTMLElement;
    //Get the id that will be used to get corresponding theme
    this.theme = parseInt(clickElt.id);
    //Set dark mode and theme state to corresponding values
    console.log("changing theme state to " + this.theme)
    this.themeService.setThemeState(this.theme);
    
  }
  //When openDialog is called...
  public openCustomTheme(): void {
    //Open the custom popup-auth component, and make sure it cannot close on outside click
    this.dialog.open(PopupCustomThemeComponent, { disableClose: true });
  }

  //Allows the user to see past chats they have had with the chatbot
  public getChatHistory(): void {

    const user = this.userApiService.getLoggedUser();
    //Get conversations based on the timestamp
    this.messageApiService.getAllConversations(user).subscribe(val => {
      const convos = JSON.parse(val);
      this.timeStamps = [];
      this.conversations = {};
      for (let i = 0; i < convos.length; i++) {
        let curDateTime = convos[i].timeStamp.split(' ')
        if (!this.timeStamps.includes(curDateTime[0])) {
          this.timeStamps.push(curDateTime[0])
          this.conversations[curDateTime[0]] = convos[i].messages;
        } else {
          let messagesArr = convos[i].messages as Array<string>;
          this.conversations[curDateTime[0]].push({ messageData: `New conversation at ${curDateTime[1]}`});
          messagesArr.forEach(val => {
            this.conversations[curDateTime[0]].push(val);
          })
        }
      }
    })
  }

  //Changes the selected date for chat history viewer
  public toggleDateSelected(): void {
    this.dateSelected = true;
  }

  //When we leave the account page, set onAccount to false
  ngOnDestroy(): void {
    console.log("leaving account")
    this.settingsService.setOnAccount(false);
  }
}
