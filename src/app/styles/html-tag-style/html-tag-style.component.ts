import { Component, Input, OnInit } from '@angular/core';
import { HTMLTagStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
  selector: 'app-html-tag-style',
  templateUrl: './html-tag-style.component.html',
  styleUrls: ['./html-tag-style.component.scss'],
})
export class HtmlTagStyleComponent  extends BasicStyleComponent implements OnInit {
    @Input() override style!: HTMLTagStyle;

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

  override ngOnInit() {
    console.log(this.style);
  }

}
