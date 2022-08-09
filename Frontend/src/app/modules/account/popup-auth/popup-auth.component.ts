import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { UserApiService } from '../../../shared/apis/user-api.service';
import { MatDialogRef } from '@angular/material/dialog'
@Component({
  selector: 'app-popup-auth',
  templateUrl: './popup-auth.component.html',
  styleUrls: ['./popup-auth.component.scss']
})
export class PopupAuthComponent implements OnInit {

  //Services, router, and NgZone init
  constructor(
    private userApiService: UserApiService,
    private router: Router,
    private ngZone: NgZone,
    private dialogRef: MatDialogRef<PopupAuthComponent>) { }

  //Initialize error string
  public error: string = "";

  ngOnInit(): void {

  }

  //On action, close the dialog box
  private close(): void {
    this.dialogRef.close(true);
  }

  // validate the user again with their password
  public validateUser(password: string): void {
    //Get username
    const username = this.userApiService.getLoggedUser();

    //Verify the user and password with the api login function
    this.userApiService.login(username, password).subscribe(data => {
      //If the user is not found based on the password, throw the error
      if (data == 404) {
        //Don't allow the dialog box to close
        this.dialogRef.disableClose = true;
        this.error = "Incorrect password.";
        return;
      }
      //If the response has a jstToken, it was validated correctly
      if (data.jwtToken) {
        //Close the dialog box
        this.close();
        //refresh the token
        sessionStorage.setItem("REFRESH_TOKEN", data.refreshToken);
        //navigate to account page
        this.ngZone.run(() => this.router.navigate(['/account']));
      } 
    }), (err: HttpErrorResponse) => {
      console.log(err.status)
    }
  }

  //On click the cancel button, go back to home page
  public cancel(): void {
    this.userApiService.verifyToken().subscribe(data => {
      //If the user has a valid jwt token, go home, otherwise, go back to login
      if (data.length > 15000)
        this.router.navigate(['/home'])
      else {
        alert("Hmm... something weird happen, please log back in.")
        this.router.navigate(['/'])
      }
    })
  }

}
