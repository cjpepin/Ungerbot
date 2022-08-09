import { Subject, Observable } from 'rxjs'


export class SettingsService {
  //Create dynamic variables for settings active state and dark mode state
  private settingsVisible: Subject<boolean> = new Subject<boolean>();
  settingsVisibleVal = this.settingsVisible.asObservable();

  private onAccount: boolean = false;
  //Getters and setters
  public getSettingsVisible(): Observable<boolean> {
    return this.settingsVisibleVal;
  }
  //Set whether or not the settings box is visible
  public setSettingsVisible(val: boolean) {
    this.settingsVisible.next(val);
  }
  //Check if user is on the account page
  public getOnAccount() {
    return this.onAccount;
  }
  //Set whether or not the user is on the account page
  public setOnAccount(val: boolean) {
    this.onAccount = val;
  }

  //Toggle settings active state
  public toggleSettings(location: string) {
    let settingsButtonElt = document.getElementById("settings-button")
    let settingsElt = document.getElementById("settings")
    if (location !== 'settings') {
      this.setSettingsVisible(false);
      settingsElt.style.width = "0";
      settingsElt.style.visibility = "hidden";
    } else {
      settingsElt.style.width = "9.5rem";
      settingsElt.style.visibility = "visible";
    }
  }
}
