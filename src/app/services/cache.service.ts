import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor() { }

  saveObj(tag, data) {
    let str = JSON.stringify(data);
    localStorage.setItem(tag, str);
  }

  getObj(tag) {
    let str = localStorage.getItem(tag);
    if(!str) return null;
    return JSON.parse(str);
  }
}
