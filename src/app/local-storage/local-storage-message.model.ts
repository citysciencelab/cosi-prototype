export interface LocalStorageMessage<T> {
  type: 'select' | 'deselect' | 'topic-select';
  data: T;
}
