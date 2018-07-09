import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrls: ['./layer-control.component.css']
})
export class LayerControlComponent implements OnInit {
  @Input() layers: MapLayer[];
  @Output() toggleLayer: EventEmitter<{}> = new EventEmitter();
  @Output() showInfo: EventEmitter<MapLayer> = new EventEmitter();
  collapsed: boolean;

  constructor() { }

  ngOnInit() {
  }

  onToggleLayer(layer: MapLayer) {
    layer.visible = !layer.visible;
    this.toggleLayer.emit();
  }

  onShowInfo(layer: MapLayer) {
    this.showInfo.emit(layer);
  }

}
