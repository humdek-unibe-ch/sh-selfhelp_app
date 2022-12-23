import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-mobile-preview',
  templateUrl: './mobile-preview.component.html',
  styleUrls: ['./mobile-preview.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MobilePreviewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
