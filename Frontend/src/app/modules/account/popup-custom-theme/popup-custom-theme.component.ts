import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserApiService } from '../../../shared/apis/user-api.service';
import { ThemeService } from '../../../shared/themes.service';
@Component({
  selector: 'app-popup-custom-theme',
  templateUrl: './popup-custom-theme.component.html',
  styleUrls: ['./popup-custom-theme.component.scss']
})
export class PopupCustomThemeComponent implements OnInit {

  //Initializations
  public error: string;

  constructor(
    private dialogRef: MatDialogRef<PopupCustomThemeComponent>,
    private themeService: ThemeService,
    private userApiService: UserApiService,
  ) { }

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
  }

  public plColor;
  public pdColor;
  public alColor;
  public adColor;
  public wlColor;
  public wdColor;

  //Takes in the light and dark colors a user chooses for their theme, checks they are in the
  //correct format, then adds them to the database and makes it immediately usable
  submitTheme(pl: string, pd: string, al: string, ad: string, wl: string, wd: string): void {
    console.log(pl, pd);
    let custObj = {
      pl: pl,
      pd: pd,
      al: al,
      ad: ad,
      wl: wl,
      wd: wd,
    }
    if (this.isEmpty(pl, pd, al, ad, wl, wd))
      return;


    if (!this.isHex(pl, pd, al, ad, wl, wd))
      return

    console.log("sending")
    this.userApiService.setCustomTheme(custObj).subscribe();
    this.themeService.setCustomTheme(custObj);
    this.dialogRef.close();

    let currentThemeInd = this.themeService.getThemeState();
    if (currentThemeInd == 4 || currentThemeInd == 5) {
      this.themeService.setCurrentCustomTheme();
    }
  }
  //Close the dialog box
  cancel() {
    this.dialogRef.close();
  }

  //Check if any of the values are empty
  private isEmpty(pl: string, pd: string, al: string, ad: string, wl: string, wd: string): boolean {
    if (pl == "" || pd == "" || al == "" || ad == "" || wl == "" || wd == "") {
      this.error = "You need to submit a value for each color."
      return true;
    }
    return false;
  }

  //Check that all of the values are in hexadecimal form
  private isHex(pl: string, pd: string, al: string, ad: string, wl: string, wd: string) {
    let regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if (!regex.test(pl)) {
      this.error = "Your Primary - Light color is not a proper hexadecimal";
      return false;
    }
    if (!regex.test(pd)){
      this.error = "Your Primary - Dark color is not a proper hexadecimal";
      return false;
    }
    if (!regex.test(al)){
      this.error = "Your Accent - Light color is not a proper hexadecimal";
      return false;
    }
    if (!regex.test(ad)){
      this.error = "Your Accent - Dark color is not a proper hexadecimal";
      return false;
    }
    if (!regex.test(wl)) {
      this.error = "Your Warn - Light color is not a proper hexadecimal";
      return false;
    }
    if (!regex.test(wd)){
      this.error = "Your Warn - Dark color is not a proper hexadecimal";
      return false;
    }

    return true;
  }

}
