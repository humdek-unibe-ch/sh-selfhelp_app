import { Component, Input, OnInit } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-submit-comment',
    templateUrl: './submit-comment.component.html',
    styleUrls: ['./submit-comment.component.scss'],
})
export class SubmitCommentComponent implements OnInit {
    @Input() reply_value: string;
    @Input() reply_id: string;
    @Input() link_value: string;
    @Input() link_id: string;
    @Input() form_name: string;
    @Input() url: string;
    @Input() parent_url: string;
    @Input() icons: boolean;
    @Input() icon_counter: any;
    @Input() disabled: boolean;

    constructor(private selfhelpService: SelfhelpService) { }

    ngOnInit() { }

    async onClickSubmit() {
        let data = {};
        let reply = {};
        let link = {};
        reply['id'] = this.reply_id;
        reply['value'] = this.reply_value;
        link['id'] = this.link_id;
        link['value'] = this.link_value;
        data['reply'] = reply;
        data['link'] = link;
        data['__form_name'] = this.form_name;
        console.log(this.url, data);
        const res = await this.selfhelpService.submitForm(this.url, data);
        if (res) {
            console.log('executed');
            this.selfhelpService.getPage(this.parent_url);
        }
    }

}
