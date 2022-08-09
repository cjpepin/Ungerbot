import { Component, OnInit, AfterContentInit, ViewChildren, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserApiService } from '../../shared/apis/user-api.service';
import { HomeService } from '../../shared/home.service';
import { NavbarService } from '../../shared/navbar.service';
import { SettingsService } from '../../shared/settings.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  //Set the settings menu to a natural state of not active
  public settingsActive: boolean = false;
  public scrollMenuActive: boolean = false;
  public isHomePage: boolean;
  public mobile: boolean;
  public hamburgerOpen: boolean;
  public admin: boolean;
  public loggedIn: boolean;

  //Call services
  constructor(
    private settingsService: SettingsService,
    private router: Router,
    private homeService: HomeService,
    private userApiService: UserApiService,
    private navbarService: NavbarService) { }

  //Create user string to show the username in navbar
  public user: string = "Guest";

  @ViewChild('scrollMenu') scrollMenuRef: ElementRef;
  @ViewChild('settings') settingsEltRef: ElementRef;

  @HostListener('document: click', ['$event']) onClick(e: Event) {
    let elt = e.target as HTMLElement;
    if (!(elt.id === "scroll-menu" || elt.id === "scroll-menu-button" || elt.id === "scroll-menu-div" || elt.innerHTML == " Navigate ") && this.scrollMenuActive)
      this.toggleScrollMenu('home');
    if (!(elt.id === "settings-button" || elt.id === "settings-icon" || this.checkClickOnSettings(elt)) && this.settingsActive)
      this.toggleSettings("home")
  }
  ngOnInit(): void {
    //Clickable nav closed on init
    this.hamburgerOpen = false;
    //Detect if mobile or not
    this.mobile = this.homeService.getMobile();
    //Set the username
    if (this.userApiService.getLoggedUser())
      this.user = this.userApiService.getLoggedUser();
    
    this.isHomePage = this.checkHomePage();

    this.admin = this.navbarService.checkAdmin();

    this.loggedIn = this.userApiService.getLoggedUser() != "Guest";

    this.navbarService.scrollMenuVal.subscribe(val => {
      this.scrollMenuActive = val;
    })
    this.navbarService.settingsMenuVal.subscribe(val => {
      this.settingsActive = val;
    })

  }
  //Get html elements
  public get scrollMenu(): HTMLElement {
    return this.scrollMenuRef.nativeElement;
  }

  public get settingsElt(): HTMLElement {
    return this.settingsEltRef.nativeElement;
  }

  //Check to see if the user has clicked on an element inside the settings window 
  private checkClickOnSettings(elt: HTMLElement): boolean {
    let curElt = elt;
    while (curElt.parentElement) {
      if (curElt.parentElement.id === "settings")
        return true;
      else
        curElt = curElt.parentElement;
    }
    return false;
  }

  //Toggle the active state of settings menu
  public toggleSettings(location: string): void {
    if (location == "home") {
      this.settingsActive = false;
      this.settingsService.toggleSettings('notSettings')

      return;
    } else {
      this.settingsActive = !this.settingsActive;

      if (this.settingsActive) {
        this.settingsElt.style.minHeight = "19rem";
        this.settingsService.toggleSettings('settings');
      }
      else {
        console.log("test")
        console.log(this.settingsElt)
        this.settingsElt.style.minHeight = "4rem";
        this.settingsService.toggleSettings('notSettings')
      }
    }
  }

  //Detect if hovering on menu
  public hoveringOnMenu(): void {
    this.scrollMenuActive = true;
  }

  //Detect if not hovering on menu
  public notHoveringOnMenu(): void {
    this.scrollMenuActive = false;
  }

  //Check if on home page
  private checkHomePage(): boolean {
    if (this.router.url === '/home')
      return true;
    return false
  }
  //Toggle active state of hamburger menu
  public toggleHamburger() {
    this.hamburgerOpen = !this.hamburgerOpen;
    if (this.settingsActive)
      this.settingsActive = false;
  }
  //Set the focus of an item for ability to tab items
  public setFocus() {
    let elt = document.getElementById("scroll-menu")
    let newFocus = elt.firstChild.firstChild.firstChild as HTMLElement;

    newFocus.focus();
  }

  //Toggle the active state of the scroll menu by 
  public toggleScrollMenu(location: string) {
    let width = window.innerWidth;
    let elt;
    let changeWidth;
    if (width > 650) {
      elt = document.getElementById("scroll-menu");
      changeWidth = "40rem";
    } else {
      elt = document.getElementById("scroll-menu2");
      changeWidth = "100rem"
    }

    this.navbarService.setScrollMenu(!this.scrollMenuActive);
   
    if (location === 'home' || !this.scrollMenuActive && location != "blur") {
      elt.style.maxWidth = "0";
      elt.style.visibility = "hidden";
    }
    else if (location !== "blur" && this.scrollMenuActive) {
      elt.style.maxWidth = changeWidth;
      elt.style.visibility = "visible";
    }
  }

  //Set settings size differently if in guest mode
  private setSettingsSize(): void {
    let elt = this.settingsElt;
    if (this.loggedIn)
      return;
    else {
      console.log(elt)
      console.log("guest mode");
    }
  }


}
