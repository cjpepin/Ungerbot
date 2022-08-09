import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ErrorApiService } from '../../shared/apis/error-api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public errors: string[];
  public topErrors;
  public userKicks;

  constructor(
    private errorApiService: ErrorApiService
      ) { }

  ngOnInit(): void {
    //update errors whenever they are updated in the service
    this.errorApiService.getAllErrors().subscribe(val => {
      this.errors = JSON.parse(val);
      this.topErrors = this.getTopErrors("topErrors");
      this.userKicks = this.getTopErrors("userKick");
    });

    this.errorApiService.errorsVal.subscribe(val => {
      this.errorApiService.getAllErrors().subscribe(val => {
        this.errors = JSON.parse(val);
        this.topErrors = this.getTopErrors("topErrors");
        this.userKicks = this.getTopErrors("userKick");
      });
    })
  }
  //Send example error object to db and frontend
  public sendTestError(): void {
    let obj: object = {
                        "headers": {
                          "normalizedNames": {},
                          "lazyUpdate": null
                        },
                        "status": 400,
                        "statusText": "OK",
                        "url": "https://localhost:7180/api/User/verify-refresh?username=null",
                        "ok": false,
                        "name": "HttpErrorResponse",
                        "message": "Http failure response for https://localhost:7180/api/User/verify-refresh?username=null: 404 OK",
                        "error": "{\"type\":\"https://tools.ietf.org/html/rfc7231#section-6.5.4\",\"title\":\"Not Found\",\"status\":401,\"traceId\":\"00-b6f54890f819770b756a871c2013f2e2-58b3f7ea1a1978f0-00\"}"
                      };
    let err = obj as HttpErrorResponse;

    this.errorApiService.addError(err).subscribe(val => {
      console.log(val);
    });
  }
  //Used for testing if values stored read correctly
  public getTestError(): void {
    console.log(this.userKicks);
  }

  //Stack errors for middle widget
  private getTopErrors(type: string): any {
    let curObj = {}
    for (const err in this.errors) {
      let curErr = this.errors[err]["errorMessage"];

      if (type === "userKick" && !curErr.includes("got kicked :/") || type !== "userKick" && curErr.includes("got kicked :/")) {
        continue;
      }
      if (!Object.keys(curObj).includes(curErr)) {
        curObj[curErr] = 1;
      } else if (Object.keys(curObj).includes(curErr)) {
        curObj[curErr] += 1;
      }
    }

    let final = Object.keys(curObj).map(key => {
      return [key, curObj[key]];
    });
    console.log(final)

    final = final.sort((a, b) => {
      return b[1] - a[1];
    })
    console.log(final)
    return final;
  }

}
