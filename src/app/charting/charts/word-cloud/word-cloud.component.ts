import {Component, Input, NgZone, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Chart} from 'angular-highcharts';

import * as highC from 'highcharts/js/highcharts.js';

@Component({
  selector: 'dash-word-cloud',
    styles: [
        '.wCloudHolder {}'
    ],
    template: `<div [chart]="wordCloudChart" class="wCloudHolder"></div>`
})
export class WordCloudComponent implements OnChanges, OnInit {

  @Input() chartTitle = '';
  @Input() text = '';

  @Input() minOccurences;

  public wordCloudChart;

  constructor(private zone: NgZone) {
  }

  ngOnInit() {
    if (this.text) {
      this.wordCloudChart = this.getWordCloudChart(this.text);
    }
  }

  private getWordCloudChart(text) {
    let seriesData = this.createDataFromText(text);

    return new Chart({
      chart: {
        // width: 600,
        // height: 400
      },
      series: [{
        type: 'wordcloud',
        data: seriesData,
        name: 'Occurrences'
      }],
      title: {
        text: this.chartTitle
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text'] && !changes['text'].firstChange) {
      this.zone.run(() => {
        this.wordCloudChart = this.getWordCloudChart(changes['text'].currentValue);
      });
    }
  }

  private createDataFromText(text: string) {
    let lines = text.split(/[,\. ]+/g);
    let realLines: any[] = [];
    for (let line of lines) {
      if (line && line.length > 3) {
        realLines.push(line);
      }
    }

    let data = highC.reduce(realLines, function (arr, word) {
      let obj = highC.find(arr, function (object) {
        return object.name === word;
      });
      if (obj) {
        obj.weight += 1;
      } else {
        obj = {
          name: word,
          weight: 1
        };
        arr.push(obj);
      }
      return arr;
    }, []);

    if (this.minOccurences) {
      let filteredData: any[] = [];
      for (let wordElement of data) {
        if (wordElement['weight'] > this.minOccurences) {
          filteredData.push(wordElement);
        }
      }
      if (filteredData.length > 0) {
        data = filteredData;
      }
    }
    return data;
  }

}
