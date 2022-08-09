import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-home-spacer',
  templateUrl: './home-spacer.component.html',
  styleUrls: ['./home-spacer.component.scss']
})
export class HomeSpacerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    if (this.style) {
      let curElt = document.getElementsByName("ung")[0] as HTMLElement;
      curElt.style.height = "24450px";
    }
  }

  //Input to be displayed on the page
  @Input() id: number;
  @Input() style: any;

}
