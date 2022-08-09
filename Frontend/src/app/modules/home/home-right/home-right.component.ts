import { Component, OnInit, Input,  } from '@angular/core';

@Component({
  selector: 'app-home-right',
  templateUrl: './home-right.component.html',
  styleUrls: ['./home-right.component.scss']
})
export class HomeRightComponent implements OnInit {

  constructor() { }

  //Input to be displayed on the page
  @Input() title: string;
  @Input() text1: string;
  @Input() text2: string;
  @Input() text3: string;
  @Input() text4: string;
  @Input() link: string;

  ngOnInit(): void {
  } 

  //Send a user to a location of a link
  public sendUser(): void {
    window.location.href = this.link;
  }
}
