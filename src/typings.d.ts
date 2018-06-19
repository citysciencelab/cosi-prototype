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
  url: string;
  wmsParams?: { [key: string]: string | number | boolean };
  wmsProjection?: string;
  format?: string;
}

declare interface MapLayer {
  name: string;
  displayName: string;
  topic?: string;
  type: 'WMS' | 'OSM' | 'Vector' | 'Heatmap';
  source: Source | { [stage: string]: Source };
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
  legendHtml?: string;
  legendUrl?: string;
  meta?: string;
  // No config - assigned at runtime
  olLayer?: { [stage: string]: ol.layer.Layer };
}

declare interface Config {
  enableTuio: boolean;
  stages: Stage[];
  topics: Topic[];
  baseLayers: MapLayer[];
  topicLayers: MapLayer[];
  stickyLayers: MapLayer[];
}

declare module '*.json' {
  const value: Config;
  export default value;
}
