import {DataFunctionEnum} from "../enum/data-function.enum";
import * as Highcharts from 'highcharts';

export class ChartUtils {

    public colors;

    constructor() {
    }

    /*
    *   We feed these methods JSON data and it generates the chart-series
    */

    getCountData(data: Object[], seriesIdent: string[]) {
        return this.getDataByFunction(data, seriesIdent, DataFunctionEnum.COUNT);
    }

    getSumData(data: Object[], seriesIdent: string[], dataIdent) {
        return this.getDataByFunction(data, seriesIdent, DataFunctionEnum.SUM, dataIdent);
    }

    getMinData(data: Object[], seriesIdent: string[], dataIdent) {
        return this.getDataByFunction(data, seriesIdent, DataFunctionEnum.MINIMUM, dataIdent);
    }

    getMaxData(data: Object[], seriesIdent: string[], dataIdent) {
        return this.getDataByFunction(data, seriesIdent, DataFunctionEnum.MAXIMUM, dataIdent);
    }


    /*
    *   @seriesIdent is the name of the series (e.g. 'bezirke') - could be passed as an array, but does it make sense?
    *   @dataElements contain the element values of the series (e.g. [2011, 2012, ...]) to also insert NULL values for blanks
    *   @seriesPointIdent is the corresponding series identification (e.g. 'years')
    *   @highlight name of the series to highlight in the chart
    */

    getSeriesData(data: Object[], seriesIdent: string, dataIdent, seriesPointIdent, seriesPointElements: string[], highlight?: string, colorByPoint?: boolean) {
        let dataArray: any[] = [];
        let seriesNames = this.getUniqueSeriesNames(data, [seriesIdent]);
        let colorindex = 0;

        for (let uniqueName of seriesNames) {
            let series = {name: uniqueName};
            let seriesData: any[] = [];

            for (let seriesPoint of seriesPointElements) {
                let found = true;

                for (let obj of data) {
                    if (obj[seriesPointIdent] === seriesPoint &&
                        this.getElementNameAtLevel([seriesIdent], obj) === uniqueName) {

                        seriesData.push(Number(obj[dataIdent]));
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    seriesData.push(null);
                }
            }

            if (series.name == highlight) {
                series["color"] = '#434348';
            } else {
                if (colorByPoint && this.colors) {
                    series["color"] = this.colors[colorindex];
                    colorindex++;
                }
            }

            // In this case we only have one Series (in this case the )
            if (seriesPointElements.length == 1) {
                series["y"] = seriesData[0];
            } else {
                series["data"] = seriesData;
            }
            dataArray.push(series);
        }

        if (seriesPointElements.length == 1) {
            let newDataArray = {};
            newDataArray["data"] = dataArray;
            newDataArray["name"] = [seriesIdent];
            return newDataArray
        } else {
            return dataArray;
        }
    }

    private getDataByFunction(data: Object[], seriesIdent: string[], calcFunction: DataFunctionEnum, dataIdentity?: string) {
        let dataArray = {};
        dataArray['name'] = seriesIdent;

        let seriesCollection: any[] = [];
        let seriesNames = this.getUniqueSeriesNames(data, seriesIdent);
        const ident: string = dataIdentity ? dataIdentity : '';

        for (let uniqueName of seriesNames) {
            let series = {name: uniqueName};
            let dataFunction = 0;
            for (let obj of data) {
                if (this.getElementNameAtLevel(seriesIdent, obj) === uniqueName) {
                    let dataElement = Number(obj[ident]);

                    if (calcFunction === DataFunctionEnum.COUNT ||
                        calcFunction === DataFunctionEnum.SUM) {
                        if (!dataFunction) {
                            dataFunction = 0;
                        }
                    }
                    if (calcFunction === DataFunctionEnum.COUNT) {
                        dataFunction++;
                    } else if (calcFunction === DataFunctionEnum.SUM) {
                        dataFunction = dataFunction + dataElement;
                    } else if (calcFunction === DataFunctionEnum.MAXIMUM) {
                        if (!dataFunction) {
                            dataFunction = dataElement;
                        } else {
                            dataFunction = dataElement > dataFunction ? dataElement : dataFunction;
                        }
                    } else if (calcFunction === DataFunctionEnum.MINIMUM) {
                        if (!dataFunction) {
                            dataFunction = dataElement;
                        } else {
                            dataFunction = dataElement < dataFunction ? dataElement : dataFunction;
                        }
                    }
                }
            }

            series['y'] = dataFunction;
            seriesCollection.push(series);
        }

        dataArray['data'] = seriesCollection;
        return dataArray;
    }


    /*
    *   Helper methods
    */

    public getUniqueSeriesNames(data: Object[], seriesIdent: string[]) {
        let seriesNames: any[] = [];
        for (let obj of data) {
            let currentSeriesName = this.getElementNameAtLevel(seriesIdent, obj);
            if (seriesNames.indexOf(currentSeriesName) === -1) {
                // It does not exist yet
                seriesNames.push(currentSeriesName);
            }
        }
        return seriesNames;
    }

    private getElementNameAtLevel(seriesIdent: string[], obj) {
        let latestElement;
        for (let sIdent of seriesIdent) {
            latestElement = latestElement ? latestElement : obj;
            if (latestElement[sIdent] instanceof Array) {
                latestElement = latestElement[sIdent][0];
            } else {
                latestElement = latestElement[sIdent];
            }
        }

        let currentSeriesName = latestElement;
        return currentSeriesName;
    }

    public concatAllElements(textArr: string[]): string {
        let concatenated = '';
        for (let text of textArr) {
            concatenated = concatenated.concat(' ' + text);
        }
        return concatenated;
    }

    public capitalize(value: any): string {
        let string = '';
        if (value instanceof Array) {
            string = value[0].name;
        } else if (typeof value === 'object') {
            string = value.name[0];
        } else {
            string = value.name;
        }


        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    setPresetColors(value: string[]) {
        this.colors = value;
    }
}
