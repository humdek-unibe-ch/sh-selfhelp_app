import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-pdf-viewer',
    templateUrl: './pdf-viewer.component.html',
    styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent extends BasicComponentComponent implements OnInit {

    pdfUrl!: string;

    constructor(injector: Injector, zone: NgZone) {
        super(injector, zone);
    }

    override ngOnInit() { }

    downloadPdf(){
        this.selfHelpService.savePdf(this.pdfUrl);
    }

}
