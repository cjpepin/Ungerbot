import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupAuthComponent } from '../account/popup-auth/popup-auth.component';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss']
})
export class BlankComponent implements OnInit {

  //Initialize services, dialog and router
  constructor(
    private dialog: MatDialog,
  ) { }

  //upon arrival, open the popup dialog box
  ngOnInit(): void {
    this.openDialog();
  }

  //When openDialog is called...
  public openDialog(): void {
    //Open the custom popup-auth component, and make sure it cannot close on outside click
    this.dialog.open(PopupAuthComponent, { disableClose: true });
  }
}
