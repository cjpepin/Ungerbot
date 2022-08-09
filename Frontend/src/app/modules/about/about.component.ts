import { AfterViewInit, Component, HostListener, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ThemeService } from '../../shared/themes.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {

  ngOnInit(): void {

  }
  ngAfterViewInit() {

  }
}
