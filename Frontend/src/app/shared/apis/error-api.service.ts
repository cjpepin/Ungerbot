import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, mapTo, tap, map } from 'rxjs/operators'
import { Observable, of, Subject } from 'rxjs';
import { Router } from '@angular/router'
import { Error } from "../../models/error.model";
import { UserApiService } from './user-api.service';
//import { User } from 'oidc-client';
@Injectable({
  providedIn: 'root'
})
export class ErrorApiService {
  private readonly _baseUrl = 'https://localhost:7180/api/Error';

  constructor(
    private http: HttpClient,
    private router: Router,
    ) {

  }

  //Dynamic variable to keep track of the message dialogue
  private errors: Subject<boolean> = new Subject<boolean>();
  public errorsVal = this.errors.asObservable();

  public changeErrors(val: boolean): void {
    this.errors.next(val);
  }

  //Gets one error from a user
  public getSingleError(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const user = localStorage.getItem("user");
    let params = { "username": user }

    return this.http.get(this._baseUrl + `/get-single-error`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.addError(error);
          return [error];
        })
      );
  }
  //Gets all errros 
  public getAllErrors(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.get(this._baseUrl + `/get-all-errors`, { headers: headers, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.addError(error);
          return [error];
        })
      );
  }
  //Send new error to db
  public addError(error: HttpErrorResponse): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let user = localStorage.getItem("user");

    let err = new Error(user, error.error, error.status, "");
    let errData = { id: err.id, userName: err.userName, error: err.error, status: err.status };
    return this.http.post(this._baseUrl + `/add-error`, errData, { headers: headers, responseType: 'text' })
      .pipe(
        map((response) => {
          response;
          this.changeErrors(true);
        }),
        catchError(error => {
          console.log(error)

          return [error];
        })
      );
  }

  //Gets one error from a user
  public deleteError(errId: string): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let params = { "id": errId}

    return this.http.get(this._baseUrl + `/delete-error`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => {
          response;
          this.changeErrors(true);
        }),
        catchError(error => {
          console.log(error)
          this.addError(error);
          return [error];
        })
      );
  }

  public sendUserKick(): Observable<any>{
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let user = localStorage.getItem("user");

    let err = new Error(user, user + " got kicked :/", 9001,"");
    //If doesn't work, try this
    let errData = { id: err.id, userName: err.userName, error: err.error, status: err.status };
    return this.http.post(this._baseUrl + `/add-error`, errData, { headers: headers, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)

          return [error];
        })
      );
  }
}

