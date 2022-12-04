import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GtranslateService {

  constructor(
    private http: HttpClient
  ) { }

  translate(query) {
    return this.http.post('https://translation.googleapis.com/language/translate/v2?key=' + environment.gapi, {q: query, target: 'en'});
  }
}
