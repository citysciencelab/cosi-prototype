import {Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {ChartUtils} from '../../utils/chart.utils';

@Component({
    selector: 'dash-pie',
    styles: [
        '.pieHolder {height: 100%}'
    ],
    template: `<div [chart]="pieChart" class="pieHolder" id="{{pieId}}"></div>`
})
export class PieComponent implements OnChanges, OnInit {

    /*
    *   To assure good height adjustation, please give the parent containers a 'height: 100%'
    */
    // pieId = Math.random().toString(36).substring(2, 15);
    @Input() pieId: string = '';

    // Titles
    @Input() chartTitle = '';
    @Input() chartSubTitle = '';
    @Input() chartTitleAlign = 'center';

    @Input() isShowLabels = true;
    @Input() isPercentageLabel = true;
    @Input() isNoDecimalPlace = false;
    @Input() dataLabelDistance = 30;
    @Input() isExport = true;

    @Input() innerSize = 0;

    // E.G. Series:
    // [{name: 'Brands', data: [{name: 'IE', y: 56.33}, {name: 'Chrome', y: 24.03}]}]
    @Input() series;
    public pieChart;

    @Output() clickOutput = new EventEmitter<string []>();

    constructor(private zone: NgZone,
                private chartUtils: ChartUtils) {
    }

    ngOnInit() {
        this.pieChart = this.getPieChart(this.series);
        if (this.innerSize > 0) {
            this.series['innerSize'] = this.innerSize;
        }
    }

    private getPieChart(series) {
        let renderTo: any = document.getElementById(this.pieId);
        return new Chart({
            chart: {
                plotBackgroundColor: undefined,
                plotBorderWidth: undefined,
                plotShadow: false,
                type: 'pie',
                renderTo: renderTo
            },
            exporting: {
                enabled: this.isExport,
                buttons: {
                    contextButton: {
                        enabled: true
                    },
                },
            },
            title: {
                text: this.chartTitle,
                align: this.chartTitleAlign
            },
            subtitle: {
                text: this.chartSubTitle
            },
            tooltip: {
                pointFormat: this.chartUtils.capitalize(series) + ': <b>{point.y}</b>'
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    center: ['50%', '50%'],
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: this.isShowLabels,
                        format: this.isPercentageLabel ? '<b>{point.name}</b>: {point.percentage:.1f} %'
                            : this.isNoDecimalPlace ? '<b>{point.name}</b>: {point.y:.0f}' : '<b>{point.name}</b>: {point.y:.2f}',
                        distance: this.dataLabelDistance,
                        /*,
                      style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                      }*/
                    },
                },
                series: {
                    cursor: 'pointer',
                    events: {
                        click: this.chartClick,
                    },
                },
            },
            series: [series]
        });
    }

    public redrawChart(isReflow) {
        if (isReflow) {
            this.pieChart.ref.reflow();
        } else {
            this.pieChart = this.getPieChart(this.series);
        }
    }


    /*
    *   Selecting elements on charts or from the outside, will also alter the selected filter elements
    */

    chartClick = (event) => {
        this.clickOutput.emit(event);
    };

    ngOnChanges(changes: SimpleChanges) {
        if (changes['series'] && !changes['series'].firstChange) {
            this.zone.run(() => {
                this.pieChart = this.getPieChart(changes['series'].currentValue);
            });
        }
    }

    convertPoint(a: any) {
    }
}
