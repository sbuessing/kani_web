import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class JLPTService {
  constructor(private http: HttpClient) {}

  getKanji() {
    return this.http.get('/assets/jlpt/kanji_list.json');
  }
}
