import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SbAsterChart } from 'src/app/selfhelpInterfaces';
declare var d3: any;

@Component({
    selector: 'app-sb-aster-chart-style',
    templateUrl: './sb-aster-chart-style.component.html',
    styleUrls: ['./sb-aster-chart-style.component.scss'],
})
export class SbAsterChartStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: SbAsterChart;
    @ViewChild('asterChart', { static: true }) asterChart!: ElementRef;

    constructor() {
        super();
    }

    override ngOnInit(): void {
        this.initSbAsterChart();
    }

    private initSbAsterChart() {
        var data = this.style.data;
        if (!data || !data.data) {
            return;
        }

        var width = 500,
            height = 500,
            radius = Math.min(width, height) / 2,
            innerRadius = 0.3 * radius;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d: any) {
                return d.count;
            });

        var tipFinished = d3.tip()
            .attr('class', 'sb-aster-chart d3-tip')
            .offset([0, 0])
            .html(function (d: any) {
                return "<span class='tooltip-finished'>" + d.data.task + " - " + data.label_finished + ": <span>" + d.data.finished + "%</span></span>";
            });

        var tipStarted = d3.tip()
            .attr('class', 'sb-aster-chart d3-tip')
            .offset([0, 0])
            .html(function (d: { data: { task: string; started: string; }; }) {
                return "<span class='tooltip-started'>" + d.data.task + " - " + data.label_started + ": <span>" + d.data.started + "%</span></span>";
            });

        // Continue with the original arc definition for the score.
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d: any) {
                // Outer radius depends on the score
                var r = (radius - innerRadius) * (d.data.finished / 100.0) + innerRadius;
                return r;
            });

        // Create a new arc definition for the extra arc.
        var extraArc = d3.svg.arc()
            .innerRadius(function (d: any) {
                // Start the inner radius where the score arc ends.
                var r = (radius - innerRadius) * d.data.finished / 100 + innerRadius;
                return r;
            })
            .outerRadius(function (d: any) {
                // Extend the outer radius based on an additional metric.
                // Assuming 'extraWidth' is a field in your data representing the width of the extra segment.
                var inner_r = (radius - innerRadius) * d.data.finished / 100 + innerRadius;
                var r = inner_r + (radius - innerRadius) * (d.data.started / 100.0);
                return r;
            });

        var outlineArc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        var svg = d3.select(this.asterChart.nativeElement).append("svg")
            .attr("viewBox", '0 0 500 500')
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        svg.call(tipFinished);
        svg.call(tipStarted);

        var path = svg.selectAll(".solidArc")
            .data(pie(data.data))
            .enter().append("path")
            .attr("fill", function (d:any) { return d.data.color; })
            .attr("class", "solidArc")
            .attr("stroke", "gray")
            .attr("d", arc)
            .on('mouseover', tipFinished.show)
            .on('mouseout', tipFinished.hide);

        // // New arc for the extra segment
        var extraPath = svg.selectAll(".extraArc")
            .data(pie(data.data))
            .enter().append("path")
            .attr("fill", function (d: any) {
                let hexColor = d.data.color;
                let alpha = 0.2;
                var red = parseInt(hexColor.slice(1, 3), 16);
                var green = parseInt(hexColor.slice(3, 5), 16);
                var blue = parseInt(hexColor.slice(5, 7), 16);
                var rgbaColor = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
                return rgbaColor;
            })
            .attr("class", "extraArc")
            .attr("stroke", "gray")
            .attr("d", extraArc)
            .on('mouseover', tipStarted.show)
            .on('mouseout', tipStarted.hide);

        var outerPath = svg.selectAll(".outlineArc")
            .data(pie(data.data))
            .enter().append("path")
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("class", "outlineArc")
            .attr("d", outlineArc);

        svg.append("svg:text")
            .attr("class", "aster-score")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle") // text-align: right
            .text(Math.round(data['finished_count_percent']));
    }

}
