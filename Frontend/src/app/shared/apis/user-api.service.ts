import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators'
import { Tokens } from '../../models/tokens';
import { Router } from '@angular/router'
import { User } from '../../models/user.model'
import { Subject, Observable } from 'rxjs';
import { ThemeService } from '../themes.service';
import { ErrorApiService } from './error-api.service';
@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  //Instantiate jwt and user vars;
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  private loggedUser: string;
  private readonly _baseUrl = 'https://localhost:7180/api';

  //Initialize http and router
  constructor(
    private http: HttpClient,
    private router: Router,
    private errorApiService: ErrorApiService,
    ) {
  }
  /*
    Getters and Setters
  */
  //Returns the logged in user
  public getLoggedUser(): string {
    return this.loggedUser || localStorage.getItem("user");
  }
  //Sets the current logged in user
  public setLoggedUser(user : string): void {
    this.loggedUser = user;
    localStorage.setItem("user", this.loggedUser);
  }
  //Get the refresh token
  public getRefreshToken() {
    return sessionStorage.getItem(this.REFRESH_TOKEN)
  }
  //Get the jwt
  public getJwtToken() {
    return sessionStorage.getItem(this.JWT_TOKEN)
  }
  //Store jwt and refresh token take from Token object
  public storeTokens(tokens: Tokens) {
    sessionStorage.setItem(this.JWT_TOKEN, tokens.jwtToken);
    sessionStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }
  //Uses object destructuring to generate the post data from a user input
  private createPostData(user) {
    const {id, userName, password, userEmail, refreshToken, profilePicture, theme, customTheme } = user;
    return {id: id, username: userName, password: password, email: userEmail, refreshToken: refreshToken, profilePicture: profilePicture, theme: theme, customTheme: customTheme }
  }
  /*
    DB/API Calls
  */

  //Log in the user based on username and password and return observable
  public login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let user = new User(username, password);
    let postData = this.createPostData(user);
    console.log(user);
    console.log(postData)
    return this.http.post(this._baseUrl + '/User/login', postData, { headers: headers }).pipe(
      map((response) => response),
      catchError(error => {
        console.log(error)
        this.errorApiService.addError(error);
        this.checkServerError(error);
        return [error.status];
         
      })
    );
  }
  // Returns the user's email
  public getEmail(username: string): any {
    const params = { "username": this.getLoggedUser() }
    return this.http.get(this._baseUrl + '/User/get-email', { params: params, responseType: 'text' });
  }

  // Returns the user's email
  public getAccountId(username: string): any {
    const params = { "username": this.getLoggedUser() }
    return this.http.get(this._baseUrl + '/User/get-account-id', { params: params, responseType: 'text' });
  }
  // Update user's settings
  public updateUserSettings(username, email) {
    var newUsername = (username === null) ? "" : username;
    var newEmail = (email === null) ? "" : email;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'text/plain');
    const body = {
      oldUsername: this.getLoggedUser(),
      newUsername: newUsername,
      newEmail: newEmail
    };

    return this.http.post(this._baseUrl + '/User/update-user', { body }, { headers: headers, observe: 'response' });
  }
  //Removes tokens, localstorage, and logged user, the navigates off site
  public logout(): void {
    this.loggedUser = null;
    this.removeTokens();
    localStorage.clear();
  }
  //Creates an account for a user and returns an observable
  public createAccount(email: string, username: string, password: string): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let user = new User(username, password, email, "", "", 0);
    let postData = this.createPostData(user);

    return this.http.post<boolean>(this._baseUrl + '/User/create-user', postData, { headers: headers }).pipe(
      map((response) => response),
      catchError(error => {
        console.log(error)
        this.errorApiService.addError(error);
        this.checkServerError(error);
        return [error.status];
      })
    );;
  }
  //Checks the JWT
  public checkJWT(): Observable<any> {
    return this.http.get(this._baseUrl + '/User/check-jwt', { observe: 'response' }).pipe(
      map((response) => response),
      catchError(error => {
        console.log(error)
        this.errorApiService.addError(error);
        this.checkServerError(error);
        return [error.status];
      })
    );;
  }
  //Removes the JWT and refresh tokens from localstorage
  private removeTokens(): void {
    sessionStorage.removeItem(this.JWT_TOKEN);
    sessionStorage.removeItem(this.REFRESH_TOKEN);
  }
  //Refreshes the user's refresh token to expire at a later point
  public refreshToken(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const user = new User(this.getLoggedUser(), "", "", "", this.getRefreshToken());
    let postData = this.createPostData(user);

    return this.http.post<Tokens>(this._baseUrl + '/User/refresh', postData, { headers: headers, })
      .pipe(tap((tokens: Tokens) => {
        this.storeTokens(tokens);
      }),
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.errorApiService.addError(error);
          this.checkServerError(error);

          return [error.status];
        })
      );
  }
  //Verify user's refresh token
  public verifyRefreshToken(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    const user = this.getLoggedUser();
    if (user === "Guest")
      return null;
    let params = { "username":  user};

    return this.http.get(this._baseUrl + `/User/verify-refresh`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.errorApiService.addError(error);
          this.checkServerError(error);
          if (error.status === 404)
            this.removeUser();
          return [error];
        })
      );
  }
  //Gets the base64 string of a user's profile picture
  public getPfp(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const user = localStorage.getItem("user");
    let params = { "username": user }

    return this.http.get(this._baseUrl + `/User/get-pfp`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.errorApiService.addError(error);
          this.checkServerError(error);
          return [error];
        })
      );
  }
  //Sets the base64 string of a user's profile picture
  public uploadPfp(pfpString: string): Observable<Object> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const user = new User(localStorage.getItem("user"), "", "", pfpString);
    let postData = this.createPostData(user);

    return this.http.post(this._baseUrl + '/User/save-pfp', postData, {headers: headers})
     .pipe(
       map((response) => response),
       catchError(error => {
         console.log(error.status)
         this.errorApiService.addError(error);
         this.checkServerError(error);
         return [error.status];
       })
     );
  }
  //Get theme from database
  public getTheme(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const user = localStorage.getItem("user");
    let params = { "username": user }

    return this.http.get(this._baseUrl + `/User/get-theme`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.errorApiService.addError(error);
          this.checkServerError(error);
          return [error];
        })
      );
  }
  //Set theme to db
  public setTheme(theme: number): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let user = new User(this.getLoggedUser(), "", "", "", "", theme);
    let postData = this.createPostData(user);

    return this.http.post(this._baseUrl + '/User/set-theme', postData, { headers: headers }).pipe(
      map((response) => response),
      catchError(error => {
        console.log(error)
        this.errorApiService.addError(error);
        this.checkServerError(error);
        return [error.status];
      })
    );
  }
  //Get theme from database
  public getCustomTheme(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const user = localStorage.getItem("user");
    let params = { "username": user }

    return this.http.get(this._baseUrl + `/User/get-custom-theme`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.errorApiService.addError(error);
          this.checkServerError(error);
          return [error];
        })
      );
  }
  //Set custom theme to db
  public setCustomTheme(theme: object): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let curCustomThemeString = JSON.stringify(theme);
    let curTheme = JSON.parse(localStorage.getItem("theme"));

    let user = new User(this.getLoggedUser(), "", "", "", "", curTheme, curCustomThemeString);
    let postData = this.createPostData(user);

    return this.http.post(this._baseUrl + '/User/set-custom-theme', postData, { headers: headers }).pipe(
      map((response) => response),
      catchError(error => {
        console.log(error)
        this.errorApiService.addError(error);
        this.checkServerError(error);
        return [error.status];
      })
    );
  }
  //Verify user's jwt tokens
  public verifyToken(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    let params = { "username": localStorage.getItem("user") };
    return this.http.get(this._baseUrl + `/User/get-pfp`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.errorApiService.addError(error);
          this.checkServerError(error);
          return [error];
        })
      );
  }

  /*
    Misc
  */

  //If something weird happens, force a relog
  public forceRelog(errorMessage: string = "Uh oh! Something weird happened, please log back in."): void {
    alert(errorMessage)
    this.logout();
    this.router.navigate(['/'])
  }
  public removeUser(): void {
    this.router.navigate(['/']);
    alert("You have been logged out due to inactivity.");

    this.logout();
  }


  private checkServerError(error): void {
    if (error.status >= 500) {
      alert("Sorry, there was an issue on the server, please log back in")
      this.removeUser();
    }
  }
}
