import {Component}     from '@angular/core';
import {Platform}      from 'ionic-angular';
import {InAppBrowser}  from '@ionic-native/in-app-browser';
import {FileIoService} from '../../providers/file-io-service';
import {GlobalVars }   from '../../providers/global-vars';


@Component({
  selector: 'page-trans',
  templateUrl : 'trans.html',
  providers   : [FileIoService]
})

export class TransPage {
  platform : Platform;
  trans    : any = [];

  constructor(private iab            : InAppBrowser,
              private fileIoService  : FileIoService,
              public globalVars     : GlobalVars,
              platform : Platform) {
    console.log("[Trans:()]");
    console.log('this.globalVars.getLang()', this.globalVars.getLang());
    this.platform = platform;
    this.fileIoService.load('assets/data/' + this.globalVars.getLang() + '/trans.json')
      .then(data => {
        this.trans = data;
      }, (err)=>{
        console.error('failed trans.ts - load() err : ' + err);
      });
  }

  gotoWeb(imgPath) {
    this.platform.ready().then(() => {
      const browser = this.iab.create(imgPath);
      browser.close();
    });
  }
}
