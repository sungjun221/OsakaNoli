import { Component }            from '@angular/core';
import { Platform }             from 'ionic-angular';
import { InAppBrowser }         from '@ionic-native/in-app-browser';
import { FirebaseAnalytics }    from '@ionic-native/firebase-analytics';

@Component({
  selector: 'page-cafe',
  templateUrl : 'cafe.html'
})

export class CafePage {
  platform : Platform;

  constructor(private iab               : InAppBrowser,
              private firebaseAnalytics : FirebaseAnalytics,
              platform                  : Platform) {
    console.log("[Cafe:()]");
    this.platform = platform;
  }

  ionViewWillEnter() {
    console.log("[Cafe:ionViewWillEnter()]");
    this.gotoWeb('https://m.cafe.naver.com/trvlnoli');
  }

  ionViewDidEnter(){
    console.log("[Cafe:ionViewWillEnter()]");
    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "cafe"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  gotoWeb(imgPath) {
    this.platform.ready().then(() => {
      const browser = this.iab.create(imgPath, '_system');
      //browser.close();
    });
  }

}
