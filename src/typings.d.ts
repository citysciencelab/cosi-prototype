/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare interface Topic  {
  name: string;
  displayName: string;
}

declare interface Stage  {
  name: string;
  displayName: string;
}

declare interface MapLayer {
  name: string;
  displayName: string;
  topic?: string;
  stage?: string;
  visible: boolean;
  legendHtml?: string;
  legendUrl?: string;
  meta?: string;
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
