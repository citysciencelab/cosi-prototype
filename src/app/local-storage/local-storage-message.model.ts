export interface LocalStorageMessage<T> {
  type: 'select' | 'deselect' | 'topic-select' | 'tool-interaction';
  data: T;
}
