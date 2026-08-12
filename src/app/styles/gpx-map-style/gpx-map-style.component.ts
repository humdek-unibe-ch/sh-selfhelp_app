import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GpxMapStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { destroyRoute, extractSampledPoints, renderRoute, GpxSamplePoint } from '../survey-js-style/gpx-leaflet';

/**
 * `gpxMap` style — mobile port of the plugin's `gpxMap/js/gpx-map.js`.
 *
 * Draws a read-only route preview from `style.sample_points`. The web
 * renderer discovers containers via a MutationObserver because it
 * runs as a plain script; Angular gives us the lifecycle directly, so
 * we render in `ngAfterViewInit` and tear down in `ngOnDestroy`.
 */
@Component({
    selector: 'app-gpx-map-style',
    templateUrl: './gpx-map-style.component.html',
    styleUrls: ['./gpx-map-style.component.scss'],
    standalone: false
})
export class GpxMapStyleComponent extends BasicStyleComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() override style!: GpxMapStyle;
    @ViewChild('gpxMap') mapRef?: ElementRef<HTMLElement>;

    /** Normalized points; empty renders the empty state instead. */
    points: GpxSamplePoint[] = [];

    constructor() {
        super();
    }

    override ngOnInit() {
        this.points = extractSampledPoints(this.style.sample_points);
    }

    ngAfterViewInit() {
        // `mapRef` only exists when `points` is non-empty — the template
        // renders the empty state instead.
        renderRoute(this.mapRef?.nativeElement ?? null, this.points);
    }

    ngOnDestroy() {
        destroyRoute(this.mapRef?.nativeElement ?? null);
    }
}
