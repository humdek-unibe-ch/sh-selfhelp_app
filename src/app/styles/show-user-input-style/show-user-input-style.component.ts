import { Component, Input, OnInit } from '@angular/core';
import { ShowUserInputStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfHelpPageRequest } from './../../selfhelpInterfaces';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
    selector: 'app-show-user-input-style',
    templateUrl: './show-user-input-style.component.html',
    styleUrls: ['./show-user-input-style.component.scss'],
})
export class ShowUserInputStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ShowUserInputStyle;
    header: string[] = [];
    rows: any[] = [];
    dtOptions: DataTables.Settings = {
        autoWidth: true,
        pagingType: 'full_numbers',
        ordering: false,
        searching: false,
        paging: false,
        info: false,
        // scrollX: true
    };

    constructor(private selfhelp: SelfhelpService, private utils: UtilsService) {
        super();
    }

    override ngOnInit() {
        this.prepareOptions();
        this.prepareDataTable();
    }

    private prepareDataTable(): void {
        let tableRows: { [key: string]: any } = {};
        this.header = [];
        this.rows = [];
        this.style.fields.forEach((field: any) => {
            Object.keys(field).forEach(key => {
                this.header.push(key);
                if (!tableRows[field['id_user_input_record']]) {
                    tableRows[field['id_user_input_record']] = {};
                    tableRows[field['id_user_input_record']]['id_user_input_record'] = field['id_user_input_record'];
                }
                tableRows[field['id_user_input_record']][field['id']] = field['value'];
            });
        });
        this.header = [...new Set(this.header)];
        if (this.style.can_delete) {
            this.header.push('');
        }
        for (const key in tableRows) {
            if (Object.prototype.hasOwnProperty.call(tableRows, key)) {
                this.rows.push(tableRows[key]);
            }
        }
        this.rows = this.style.fields;
    }

    public getRowCells(row: any): string[] {
        let res = [];
        for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
                res.push(row[key]);
            }
        }
        return res;
    }

    private prepareOptions(): void {
        const css = this.getCss().split(' ');
        this.dtOptions.ordering = css.includes('dt-sortable');
        this.dtOptions.searching = css.includes('dt-searching');
        this.dtOptions.paging = css.includes('dt-bPaginate');
        this.dtOptions.info = css.includes('dt-bInfo');
        this.dtOptions.columnDefs = [{
            "targets": 0, // The first column
            "visible": false // Hide it
        }];

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

    public deleteAlert(row: any): void {
        this.selfhelp.presentAlertConfirm({
            msg: this.getFieldContent('delete_content'),
            header: this.getFieldContent('delete_title'),
            confirmLabel: this.getFieldContent('label_delete'),
            callback: () => {
                this.deleteRow(row);
            }
        });
    }

    private deleteRow(row: any): void {
        this.utils.debugLog('deleteShowUserINput', 'deleteShowUserInput');
        this.selfhelp.execServerRequest(this.url,
            {
                "delete_record_id": row['record_id']
            }
        )
            .then((res: SelfHelpPageRequest) => {
                if (res) {
                    this.selfhelp.setPage(this.url, res);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    getLastRecordField() {
        if (this.style.fields.length > 0) {
            let lastRecord = this.style.fields[this.style.fields.length - 1];
            let lastRecordFields: any[] = [];
            Object.keys(lastRecord).forEach(key => {
                lastRecordFields.push(
                    {
                        label: key,
                        value: lastRecord[key]
                    }
                )
            });
            return lastRecordFields;
        }
        return [];
    }

}
