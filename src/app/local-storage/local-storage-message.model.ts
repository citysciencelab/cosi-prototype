export interface LocalStorageMessage<T> {
  type: 'select' | 'deselect';
  data: T;
}
