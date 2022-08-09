import { Component, OnInit, HostListener  } from '@angular/core';
import { UserApiService } from '../../../shared/apis/user-api.service';
import { HomeService } from '../../../shared/home.service';
import { NavbarService } from '../../../shared/navbar.service';
import { SettingsService } from '../../../shared/settings.service';
import { ThemeService } from '../../../shared/themes.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  //Web/all vars
  public notAtTop: boolean;

  //Mobile variables
  public mobile: boolean;
  private nElts: number;
  private solutions: string[][] = this.navbarService.getSolutions();
  private solutionsInd: number = 0;
  public solution: string = "";
  public hover: boolean = true;
  //These should be strictly typed, but I don't know how to type setInterval
  private interval;
  private timeout;
  //Initialize service
  constructor(
    private userApiService: UserApiService,
    private homeService: HomeService,
    private navbarService: NavbarService,
    private themeService: ThemeService,
    private settingsService: SettingsService) { }

  ngOnInit(): void {
    //Detect if screen is mobile sized
    this.mobile = this.homeService.getMobile();

    //If the screen is mobile sized, set the solution scroller and wait to make the ropes
    //So the site has time to load
    if (this.mobile) {
      setInterval(() => this.changeSolution(), 780)
      setTimeout(() => this.homeService.makeRope(), 250);
    }
    this.themeService.setCurrentCustomTheme();
  }

  //Takes in a string for where to place the focus to based on hotkey input
  public setFocusTo(location: string): void {
    let elt: HTMLElement;
    if (location == "main-content") {
      elt = document.getElementById('stmc');
      elt.focus();
    } else if (location == 'chat') {
      elt = document.getElementById('chat-button-wrapper');
      elt.focus();
    }
  }

  //Parallax scrolling effect on background images and detect if the window is scrolled to the top
  @HostListener('window:scroll', ['$event'])
  scroll() {
        //If the screen is mobile sized
    if (this.mobile) {
      //Detect if scrolling down or up
      this.homeService.scrollDown();
      //Get the thread elements
      let elts = document.getElementsByClassName("thread-body");
      this.nElts = elts.length;
      //For each element, scroll using the respective function
      for (let i = 0; i < this.nElts; i++) {
        let elt = elts[i] as HTMLElement;
        let leftRightSwitch;
        if (i % 2 == 0) {
          //up-right
          leftRightSwitch = 1;
        } else {
          //up-left
          leftRightSwitch = -1;
        }
        this.homeService.scrollDownRope(i, elts, leftRightSwitch)
      }
    } else {
      //If the screen is large, keep track of the parallax background
      //and check if the scroll top button should appear
      this.parallax();
      this.scrollTop();
    }
   
  }
  //Keep track of background parallax image
  private parallax(): void {
    let imgs = document.getElementsByName("ung")
    let imgsArr = Array.prototype.slice.call(imgs, 0);
    imgsArr.forEach(elt => {
      var yPos = 0 - window.pageYOffset / 16;
      elt.style.top = +elt.id + yPos + "%";
    })
  }

  //Check if the window is scrolled to the top of the screen
  private scrollTop(): void {
    if (window.scrollY == 0)
      this.notAtTop = false;
    else
      this.notAtTop = true;
  }
  
  //Gets the id of any element that gets clicked
  public saveInput(e: Event) {
    let id = (e.target as Element).id;
  }
  //When the up arrow is clicked, scroll to top
  public scrollUp(e: Event): void {
    let target = document.getElementById("top");
    target.scrollIntoView({ behavior: 'smooth' })
  }

  //Iterate through the solutions from the list in home services
  private changeSolution(): void {
    if (this.solutionsInd == this.solutions.length - 1) {
      this.solutionsInd = 0;
    } else {
      this.solutionsInd += 1;
    }
    this.solution = this.solutions[this.solutionsInd][0];
  }
  //If hovering over "solutions", iterate over and show the different solutions offered
  public toggleHover(isHovering: boolean): void {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    if (isHovering) {
      this.timeout = setTimeout(() => {
        this.hover = isHovering
        this.interval = setInterval(() => this.changeSolution(), 780)
      }, 500);
    }
    else {
      this.hover = isHovering;
    }
  }

  //Upon clicking/pressing enter to one of the two buttons, send the focus to
  //either the main content or the chat button
  public shiftFocus(whichButton: string) {
    if (whichButton === "main-content") {
      let mainContentStart = document.getElementById("main-content-start");
      mainContentStart.focus()
    } else {
      let chatButton = document.getElementById("chat-button-wrapper");
      chatButton.focus()
    }
  }

  //Toggle whether the settings is active or not
  public toggleSettings(): void {
    this.settingsService.toggleSettings("ungerboeck");
  }

}
