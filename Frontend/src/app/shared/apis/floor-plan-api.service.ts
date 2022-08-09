import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, mapTo, tap, map } from 'rxjs/operators'
import { Observable, of, Subject } from 'rxjs';
import { Router } from '@angular/router'
import { Error } from "../../models/error.model";
import { UserApiService } from './user-api.service';
import { ErrorApiService } from './error-api.service';
//import { User } from 'oidc-client';
@Injectable({
  providedIn: 'root'
})
export class FloorPlanApiService {
  private readonly _baseUrl = 'https://localhost:7180/api/FloorPlan';

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorApiService: ErrorApiService,
    ) {

  }


  //Gets one error from a user
  public getScenes(): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const user = localStorage.getItem("user");
    let params = { "username": user }

    return this.http.get(this._baseUrl + `/get-scenes`, { headers: headers, params: params, responseType: 'text' })
      .pipe(
        map((response) => response),
        catchError(error => {
          console.log(error)
          this.errorApiService.addError(error);
          return [error];
        })
      );
  }

  //Save scene data to db
  public saveScene(scene: object, ind: number, unsaved: boolean): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'text/plain');

    const username = localStorage.getItem("user");

    const body = {
      username: username,
      scene: scene,
      ind: ind,
      unsaved: unsaved,
    };
    console.log(username,scene,ind,unsaved)
    return this.http.post(this._baseUrl + '/save-scene', { body }, { headers: headers, responseType: 'text' }).pipe(
      map((response) => response),
      catchError(error => {
        console.log(error)
        this.errorApiService.addError(error);
        return [error];
      })
    );
  }
}

