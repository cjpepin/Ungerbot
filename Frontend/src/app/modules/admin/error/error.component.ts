import { Component, Input, OnInit } from '@angular/core';
import { ErrorApiService } from '../../../shared/apis/error-api.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  //Receive errors
  @Input() error;
  @Input() errorType;

  public count: number;
  public user: string;

  constructor(
    private errorApiService: ErrorApiService,
  ) { }
  //Divide the errors into their seperate categories
  ngOnInit(): void {
    if (this.errorType === "topErrors" )
      this.convertErr();

    if (this.errorType === "userKicks")
      this.setUser();
  }

  //Divide the error into the amount and error content
  public convertErr(): void {
    let tempErr = this.error;
    this.count = JSON.parse(tempErr[1]);
    this.error = JSON.parse(tempErr[0]);
  }

  //Get the associated user with an error
  private setUser() {
    this.user = this.error[0].split(" ")[0];
    this.count = JSON.parse(this.error[1]);
  }

  //Remove a selected error
  public deleteError(e: Event) {
    let id = (e.target as HTMLElement).id;

    this.errorApiService.deleteError(id).subscribe(res => {
      console.log(res)
    });
  }
}
