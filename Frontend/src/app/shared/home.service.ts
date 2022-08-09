import { Component, HostListener } from '@angular/core';

@Component({
  template: ''
})
export class HomeService {
  //Initialize variables needed for mobile animations
  private mobile: boolean = false;
  private y: number = 100;
  private x: number = 100;
  private theta: number = Math.atan(this.y / this.x) * 180 / Math.PI;
  private prevScrollTop: number = 0;
  private isScrollingDown: boolean;
  private rotAngle: number = 49;
  private layerDistance: number = 0;
  private vertShift: number = 70;

  //Detect window being resized
  @HostListener('window:resize', ['$event'])
  onResize() {
    //Check if window is mobile sized or not
    if (window.outerWidth <= 350)
      this.mobile = true;
    else
      this.mobile = false;
  }

  //Getters and setters
  public getMobile(): boolean {
    this.onResize()

    return this.mobile;
  }
  public setMobile(val: boolean): void {
    this.mobile = val;
    localStorage.setItem("mobile", JSON.stringify(this.mobile));
  }

  //Creates the scorlling animation for the rope
  public scrollDownRope(i: number, elts: HTMLCollectionOf<Element>, leftRightSwitch: number): void {
    //Get the current element
    let curElt = elts[i] as HTMLElement;
    //If we reached a certain threshold, Make the threads stationary
    if (window.scrollY > 7600) {
      curElt.style.marginBottom = `${window.scrollY - 7600}px`;
    } else {
      //Otherwise, calculate how far in vh the ropes have travelled
      let distTravelled = (window.scrollY / window.innerHeight) * 100

      //Calculate the vertical and horizontal change from the top posiiton
      let vChange = (2 * i * this.layerDistance) + this.vertShift + (100 * (i + 1)) - distTravelled;
      let hChange = (100 * (i + 1)) - distTravelled;

      //Rotate and skew the ropes
      curElt.style.transform = `rotate(${-this.rotAngle * leftRightSwitch}deg) skewY(${-this.rotAngle * leftRightSwitch}deg)`;

      //Set the position of the rops
      curElt.style.position = "fixed";

      //Set the new bottom and left/right values
      curElt.style.bottom = `${vChange}vh`;
      if(leftRightSwitch == 1)
        curElt.style.right = `${hChange}vh`;
      else
        curElt.style.left = `${hChange}vh`;

      //Get the text element from the thread, and reverse the angles to it is upright
      let text = curElt.firstChild as HTMLElement;
      text.style.transform = `skewY(${this.rotAngle * leftRightSwitch}deg) rotate(${this.rotAngle * leftRightSwitch}deg) `;
    }
  }

  //Detect if scrolling up or down
  public scrollDown(): void {
    var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
    if (st > this.prevScrollTop) {
      // downscroll code
      this.isScrollingDown = true;
    } else {
      // upscroll code
      this.isScrollingDown = false;
    }
    this.prevScrollTop = st <= 0 ? 0 : st;
  }

  //Creates the static rope at the bottom of the page
  public makeRope(): void {
    let elts = document.getElementsByClassName("still-thread")

    for (let i = 0; i < elts.length; i++) {
      if (i < 6) {
        let scale = 1 - (i * 0.1)
        let curElt = elts[i] as HTMLElement;
        curElt.style.transform = `rotate(${55}deg) skewY(${45}deg) scale(${scale})`
        /*curElt.style.marginTop = (-12 - i * 0.50) + "rem";*/
        if (i == 0) {
          curElt.style.marginTop = -(parseInt(window.getComputedStyle(curElt).width) * scale) / 10 + "rem";
        }
        if (i == 1)
          curElt.style.marginTop = -(parseInt(window.getComputedStyle(curElt).width) * scale) / 10.5 + "rem";
        if (i == 2)
          curElt.style.marginTop = -(parseInt(window.getComputedStyle(curElt).width) * scale) / 8.5 + "rem";
        if (i == 3)
          curElt.style.marginTop = -(parseInt(window.getComputedStyle(curElt).width) * scale) / 7 + "rem";
        if (i == 4) {
          curElt.style.marginTop = -(parseInt(window.getComputedStyle(curElt).width) * scale) / 5.6 + "rem";
          curElt.style.marginBottom = "-18.5rem";
        }
      } else {
        let newI = 5;
        let scale = 1 - (newI * 0.1)
        let curElt = elts[i] as HTMLElement;
        curElt.style.transform = `rotate(${55}deg) skewY(${45}deg) scale(${scale})`
        curElt.style.marginTop = -(parseInt(window.getComputedStyle(curElt).width) * scale) / 4.2 + "rem";
      }
    }
  }
}
