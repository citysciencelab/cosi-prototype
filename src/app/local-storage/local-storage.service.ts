import { Injectable } from '@angular/core';
import { LocalStorageMessage } from './local-storage-message.model';

@Injectable()
export class LocalStorageService {

  constructor() { }

  private sendMessage(message: LocalStorageMessage) {
    localStorage.setItem('message', JSON.stringify(message));
    localStorage.removeItem('message');
  }
}
