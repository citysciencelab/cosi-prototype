export class ThemeUtils {

    /*
    *   More themes can be found here
    *   https://github.com/highcharts/highcharts/tree/master/js/themes
    */

    chartThemes = {
        'sand-signika': {
            colors: ['#f45b5b', '#8085e9', '#8d4654', '#7798BF', '#aaeeee',
                '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
            chart: {
                backgroundColor: null,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, ' +
                    '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
                }
            },
            title: {
                style: {
                    color: 'black',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            subtitle: {
                style: {
                    color: 'black'
                }
            },
            tooltip: {
                borderWidth: 0
            },
            legend: {
                itemStyle: {
                    fontWeight: 'bold',
                    fontSize: '13px'
                }
            },
            xAxis: {
                labels: {
                    style: {
                        color: '#6e6e70'
                    }
                }
            },
            yAxis: {
                labels: {
                    style: {
                        color: '#6e6e70'
                    }
                }
            },
            plotOptions: {
                series: {
                    shadow: true
                },
                candlestick: {
                    lineColor: '#404048'
                },
                map: {
                    shadow: false
                }
            },

            // General
            background2: '#E0E0E8'

        }
    };

    constructor() {
    }


    /*
    *   Access the theme and its properties
    */

    public getTheme(themeIdent: string) {
        return this.chartThemes[themeIdent];
    }

    public getThemeColors(themeIdent: string) : string[] {
        return this.chartThemes[themeIdent]['colors'];
    }

}
