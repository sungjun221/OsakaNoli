import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import                     'rxjs/add/operator/map';

@Injectable()
export class FileIoService {
  data: any;

  constructor(private http: HttpClient) {
    this.data = null;
  }

  load(dataUrl) {
    console.log('[FileIoService:load()]');

    return new Promise(resolve => {
      console.log('[FileIoService:load()] return new Promise');
      this.http.get(dataUrl).subscribe(data => {
        console.log('   data[data]', data['data']);
        this.data = data['data'];
        resolve(this.data);
      });
    });
  }
}

