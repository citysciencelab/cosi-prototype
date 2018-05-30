/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare interface Config {
  enableTuio: boolean;
}

declare module '*.json' {
  const value: Config;
  export default value;
}
