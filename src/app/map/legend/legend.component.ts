import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { MapLayer } from '../map-layer.model';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LegendComponent implements OnInit {
  @Input() layer: MapLayer;
  @Input() visible: boolean;
  @Output() close: EventEmitter<{}> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onClose() {
    this.visible = false;
    this.close.emit();
  }

}
