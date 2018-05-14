import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private sources: ol.source.Source[];

  constructor(private map: MapService) {}

  ngOnInit() {
    // force redraw of map by changing target
    this.map.setTarget('');
    this.map.setTarget('map');
  }
}
