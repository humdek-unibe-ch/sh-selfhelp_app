import {
    AfterViewInit,
    Directive,
    DoCheck,
    ElementRef,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    SimpleChanges
} from '@angular/core';

declare const $: JQueryStatic;

@Directive({
    selector: 'table[appDatatable]',
    standalone: false
})
export class AppDatatableDirective implements AfterViewInit, OnChanges, DoCheck, OnDestroy {
    @Input() dtOptions: DataTables.Settings = {};

    private tableApi: DataTables.Api | null = null;
    private initialized = false;
    private lastRowCount = -1;
    private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(private host: ElementRef<HTMLTableElement>, private zone: NgZone) { }

    ngAfterViewInit(): void {
        this.scheduleRefresh();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['dtOptions']) {
            return;
        }

        if (this.initialized) {
            this.scheduleRefresh();
        }
    }

    ngDoCheck(): void {
        if (!this.initialized) {
            return;
        }

        const rowCount = this.getRowCount();
        if (rowCount !== this.lastRowCount) {
            this.scheduleRefresh();
        }
    }

    ngOnDestroy(): void {
        this.clearRefreshTimeout();
        this.destroyTable();
    }

    private scheduleRefresh(): void {
        this.clearRefreshTimeout();

        this.zone.runOutsideAngular(() => {
            this.refreshTimeout = setTimeout(() => {
                this.refreshTimeout = null;
                this.initializeOrRefreshTable();
            }, 0);
        });
    }

    private clearRefreshTimeout(): void {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
    }

    private initializeOrRefreshTable(): void {
        this.destroyTable();

        const table = $(this.host.nativeElement);
        if (typeof table.DataTable !== 'function') {
            return;
        }

        this.tableApi = table.DataTable({
            ...this.dtOptions
        });
        this.initialized = true;
        this.lastRowCount = this.getRowCount();
    }

    private destroyTable(): void {
        if (!this.tableApi) {
            return;
        }

        this.tableApi.destroy();
        this.tableApi = null;
        this.initialized = false;
    }

    private getRowCount(): number {
        const table = this.host.nativeElement;
        if (!table.tBodies || table.tBodies.length === 0) {
            return 0;
        }
        return table.tBodies[0].rows.length;
    }
}
