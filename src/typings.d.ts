/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare interface Topic {
  name: string;
  displayName: string;
}

declare interface Stage {
  name: string;
  displayName: string;
}

declare interface Source {
  url?: string;
  projection?: string;
  wmsParams?: { [key: string]: string | number | boolean };
  wmsProjection?: string;
  format?: string;
}

declare interface Fill {
  color?: string;
  categorizedScale?: boolean;
  graduatedScale?: boolean;
}

declare interface Stroke {
  color?: string;
  width?: number;
  categorizedScale?: boolean;
  graduatedScale?: boolean;
}

declare interface LayerStyle {
  fill?: Fill;
  stroke?: Stroke;
  circle?: {
    radius: number;
    fill: Fill;
    stroke: Stroke;
  };
  text?: {
    maxResolution?: number;
    minResolution?: number;
    attribute: string;
    round: boolean;
    font: string;
    fill: Fill;
    stroke: Stroke;
    offsetX?: number;
    offsetY?: number;
  };
}

declare interface MapLayer {
  name: string;
  displayName: string;
  topic?: string;
  type: 'WMS' | 'OSM' | 'Tile' | 'Vector' | 'Heatmap';
  source?: Source;
  sources?: { [stage: string]: Source };
  // Heatmap
  weightAttribute?: string;
  weightAttributeMax?: number;
  gradient?: string[];
  radius?: number;
  blur?: number;
  // all types
  opacity?: number;
  zIndex?: number;
  visible: boolean;
  selectable?: boolean;
  legendHtml?: string;
  legendUrl?: string;
  meta?: string;
  style?: LayerStyle;
  selectedStyle?: LayerStyle;
  scale?: { [key: string]: ol.Color };
  scaleAttribute?: string;
  // No config - assigned at runtime
  olLayer?: { [stage: string]: ol.layer.Layer };
  olDefaultStyle?: ol.StyleFunction;
  olSelectedStyle?: ol.StyleFunction;
}

declare interface Config {
  enableTuio: boolean;
  stages: Stage[];
  topics: Topic[];
  baseLayers: MapLayer[];
  topicLayers: MapLayer[];
  stickyLayers: MapLayer[];
  mapCenter: [number, number];
  mapZoom: number;
  mapMinZoom?: number;
  mapMaxZoom?: number;
}

declare module '*.json' {
  const value: Config;
  export default value;
}
