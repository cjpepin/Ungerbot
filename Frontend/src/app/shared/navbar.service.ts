import { Injectable } from '@angular/core'
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { UserApiService } from './apis/user-api.service';
@Injectable()
export class NavbarService {

  constructor(
    private userApiService: UserApiService,
  ) {

  }
  //Set up observables
  private scrollMenuEnabled: Subject<boolean> = new Subject<boolean>();
  public scrollMenuVal: Observable<boolean> = this.scrollMenuEnabled as Observable<boolean>;
  private settingsMenuEnabled: Subject<boolean> = new Subject<boolean>();
  public settingsMenuVal: Observable<boolean> = this.scrollMenuEnabled as Observable<boolean>;

  public getScrollMenu(): boolean {
    return JSON.parse(localStorage.getItem("scrollMenuEnabled")) || false;
  }
  public setScrollMenu(val: boolean): void {
    this.scrollMenuEnabled.next(val);
    localStorage.setItem("scrollMenuEnabled", JSON.stringify(val));
  }
  public getSettingsMenu(): boolean {
    return JSON.parse(localStorage.getItem("settingsMenuEnabled")) || false;
  }
  public setSettingsMenu(val: boolean): void {
    this.settingsMenuEnabled.next(val);
    localStorage.setItem("settingsMenuEnabled", JSON.stringify(val));
  }
  //Create solutions to be rotated through
  private solutions: string[][] = [
    ["CRM & SALES MANAGEMENT", "CSM"],
    ["CATERING", "Ca"],
    ["BILLING & PAYMENTS", "BP"],
    ["SPACE BOOKING AND MANAGEMENT", "SBM"],
    ["OPERATION SUITE", "OS"],
    ["ERP & FINANCIAL SUITE", "EFS"],
    ["EVENT PLANNING & COMMUNICATIONS", "EPC"],
    ["SHOWORKS", "SW"],
    ["EXHIBITION MANAGEMENT", "EM"],
    ["ATTENDEE MANAGEMENT", "AM"],
    ["ORDER MANAGEMENT", "OM"],
    ["MEMBERSHIP MANAGEMENT", "MM"],
    ["REGISTRATION", "Re"],
    ["UNGERBOECK CLOUD", "UC"],
    ["UNGERBOECK API", "UA"],
    ["UNGERBOECK INTEGRATIONS", "UI"],
  ];

  //Get the solutions created
  public getSolutions(): string[][] {
    return this.solutions;
  }

  public checkAdmin(): boolean {
    if (this.userApiService.getLoggedUser() == "admin")
      return true;
    else
      return false;
  }
}
