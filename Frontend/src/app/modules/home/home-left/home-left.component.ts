import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-home-left',
  templateUrl: './home-left.component.html',
  styleUrls: ['./home-left.component.scss']
})
export class HomeLeftComponent implements OnInit {

  constructor(
    private _sanitizer: DomSanitizer,
  ) { }

  //Input to be displayed on page
  @Input() title: string;
  @Input() text1: string;
  @Input() text2: string;
  @Input() text3: string;
  @Input() text4: string;
  @Input() link: string;

  public processedLink: string;

  ngOnInit(): void {
  }

  //Send a user to the location of the link
  public sendUser(): void {
    window.location.href = this.link;
  }
}
