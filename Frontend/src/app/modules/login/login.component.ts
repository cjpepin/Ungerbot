import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, NgZone} from '@angular/core';
import { Router } from '@angular/router'
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserApiService } from '../../shared/apis/user-api.service';
import { NotificationsService } from '../../shared/notifications.service';
import { ThemeService } from '../../shared/themes.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //Instantiate an error if there is one that arises
  public error: string = "";

  //Call necessary services
  constructor(
    private router: Router,
    private userApiService: UserApiService,
    private ngZone: NgZone,
    private themeService: ThemeService,
    private notificatoinsService: NotificationsService,
    private jwtHelper: JwtHelperService) { }

  ngOnInit(): void {
    // Check to see if the user has a valid JWT so they can be logged in
    let token = this.userApiService.getJwtToken()
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.userApiService.checkJWT().subscribe(data => {
        //If status is 200, they have a valid JWT, and should just be logged in
        if (data.status === 200) {
          //Make sure that there is not already notifications set
          if (!localStorage.getItem("numNotifs"))
            this.notificatoinsService.setNumNotifications(1);
          this.ngZone.run(() => this.router.navigate(['/home']));
        }
        else {
          //Otherwise, make sure localStorage is empty and make them log in
          this.cleanSlate();
        }
      });
    }
    else {
      this.cleanSlate();
    }
  }

  //Get the user's JWT
  public getJWT() {
    return this.userApiService.getJwtToken();
  }

  //On submit, validate the user is valid
  public validateUser(username: string, password: string): void {
    let route = this.router;
    if (username === "guest") {
      this.userApiService.setLoggedUser("Guest");
      this.ngZone.run(() => route.navigate(['/home']));
    }
    if (username == "") {
      this.error = "Please enter a username";
      return;
    }
    if (password == "") {
      this.error = "Please enter a password";
      return;
    }

    /* There will be different logic here when connected to Mongo */
    this.userApiService.login(username, password).subscribe(data => {
      
      this.checkError(data);

      if (data.jwtToken) {
        console.log('loggin in')
        this.initializeVariables(username, data);
        this.setTheme();
        this.ngZone.run(() => route.navigate(['/home']));
      } 
    }), (err: HttpErrorResponse) => {
      console.log(err.status)
    }

  };

  //Make the the site theme matches what is saved in the db
  private setTheme(): void {
    this.userApiService.getTheme().subscribe(val => {
      let themeState = parseInt(val)
      this.themeService.setThemeState(themeState);

    });
    this.userApiService.getCustomTheme().subscribe(val => {
      let theme = JSON.parse(val);
      let themeState = this.themeService.getThemeState();

      if (theme)
        this.themeService.setCustomTheme(theme)

      if (themeState == 4 || themeState == 5) {
        this.themeService.setCustomThemeFromObj(theme);
      }
      
    });
    
  }
  //Set the user's JWT, username, and notifications 
  private initializeVariables(username: string, data): void {
    sessionStorage.setItem("JWT_TOKEN", data.jwtToken);
    localStorage.setItem("user", username);
    this.notificatoinsService.setNumNotifications(1);
  }
  //Check for an error to be thrown from trying to log in
  private checkError(data): void {
    //Errors need to be fixed, right now, all returning 404
    if (data == 404) {
      this.error = "No user with that username exists.";
      return;
    }
    if (data == 401) {
      this.error = "Incorrect username/password.";
      return;
    }
    if (data == 500) {
      alert("Sorry, something went wrong on our end, please try again in a little bit!");
    }
  }
  //Make sure the local storage and themes are all removed
  private cleanSlate(): void {
    this.themeService.setLoginTheme();

    localStorage.clear();
    console.log('clearing local storage');
  }
}
