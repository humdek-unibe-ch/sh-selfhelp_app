import { Component, Input, OnInit } from '@angular/core';
import { EntryListStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-entry-list',
    templateUrl: './entry-list.component.html',
    styleUrls: ['./entry-list.component.scss'],
})
export class EntryListComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: EntryListStyle;
    dtOptions: DataTables.Settings = {
        autoWidth: true,
        pagingType: 'full_numbers',
        ordering: false,
        searching: false,
        paging: false,
        info: false,
        scrollX: true
    };

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        this.prepareOptions();
        console.log(this.style.style_name, this.style.children);
    }

    private prepareOptions(): void {
        const css = this.getCss().split(' ');
        this.dtOptions.ordering = css.includes('dt-sortable');
        this.dtOptions.searching = css.includes('dt-searching');
        this.dtOptions.paging = css.includes('dt-bPaginate');
        this.dtOptions.info = css.includes('dt-bInfo');
        this.dtOptions.columnDefs = [];

        //check for ordered columns **********************************************************************************
        // dt-order-0-asc dt-order-1-desc
        var ordered = css.filter(function (str) { return str.includes("dt-order"); });
        let orderedColumnDef = [];
        for (let i = 0; i < ordered.length; i++) {
            const ordClassElements = ordered[i].split('-');
            if (ordClassElements.length == 4) {
                //correct order pattern
                if (this.selfhelp.isNumeric(ordClassElements[2]) && (ordClassElements[3] === 'asc' || ordClassElements[3] === 'desc')) {
                    // check is 3 element number and 4 asc or desc
                    orderedColumnDef.push([ordClassElements[2], ordClassElements[3]])
                }
            }
        }
        this.dtOptions.order = orderedColumnDef;

        //check for hiiden columns **********************************************************************************
        // dt-hide-0
        var hidden = css.filter(function (str) { return str.includes("dt-hide"); });
        for (let i = 0; i < hidden.length; i++) {
            const hiddenClassElements = hidden[i].split('-');
            if (hiddenClassElements.length == 3) {
                //correct order pattern
                if (this.selfhelp.isNumeric(hiddenClassElements[2])) {
                    // check is 3 element number and 4 asc or desc
                    this.dtOptions.columnDefs.push({
                        targets: [parseInt(hiddenClassElements[2], 10)],
                        visible: false
                    })
                }
            }
        }
    }

}
