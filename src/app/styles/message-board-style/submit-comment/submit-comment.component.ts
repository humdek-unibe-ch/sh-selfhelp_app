import { Component, Input, OnInit } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-submit-comment',
    templateUrl: './submit-comment.component.html',
    styleUrls: ['./submit-comment.component.scss'],
})
export class SubmitCommentComponent implements OnInit {
    @Input() reply_value!: string;
    @Input() reply_id!: number;
    @Input() link_value!: number;
    @Input() link_id!: number;
    @Input() form_name!: string;
    @Input() url!: string;
    @Input() parent_url!: string;
    @Input() icons!: boolean;
    @Input() icon_counter!: any;
    @Input() disabled!: boolean;

    constructor(private selfhelpService: SelfhelpService) { }

    ngOnInit() { }

    async onClickSubmit() {
        let data: { [key: string]: any } = {};
        let reply: { [key: string]: any } = {};
        let link: { [key: string]: any } = {};
        reply['id'] = this.reply_id;
        reply['value'] = this.reply_value;
        link['id'] = this.link_id;
        link['value'] = this.link_value;
        data['reply'] = reply;
        data['link'] = link;
        data['__form_name'] = this.form_name;
        const res = await this.selfhelpService.submitForm(this.url, data);
        if (res) {
            this.selfhelpService.getPage(this.parent_url);
        }
    }

}
