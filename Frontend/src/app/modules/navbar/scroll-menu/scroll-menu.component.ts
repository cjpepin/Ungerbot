import { Component, HostListener, OnInit } from '@angular/core';
import { NavbarService } from '../../../shared/navbar.service'
@Component({
  selector: 'app-scroll-menu',
  templateUrl: './scroll-menu.component.html',
  styleUrls: ['./scroll-menu.component.scss']
})
export class ScrollMenuComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
  }

  //Scroll the the target element
  scrollTo(e: Event): void {
    let id = (e.target as Element).id;
    id += "-elt";

    let target = document.getElementById(id);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

}
