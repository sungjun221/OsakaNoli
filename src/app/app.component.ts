import { Component }                from '@angular/core';
import { Platform }                 from 'ionic-angular';
import { GlobalVars }               from "../providers/global-vars";
import { LoadService }              from '../providers/load-service';
import { AdmobService }             from '../providers/admob-service';
import { FirebaseAuthService }      from '../providers/firebase-auth-service';
import { TabsPage }                 from '../pages/tabs/tabs';


@Component({
  templateUrl : 'app.html',
  providers   : [GlobalVars, LoadService, AdmobService, FirebaseAuthService]
})

export class MyApp {
  rootPage   : any;

  constructor(private platform            : Platform,
              private loadService         : LoadService,
              private admobService        : AdmobService,
              private firebaseAuthService : FirebaseAuthService,
              public  globalVars          : GlobalVars) {
    this.rootPage = TabsPage;

    platform.ready().then(() => {
      //StatusBar.styleDefault();
      //Splashscreen.hide();
      this.loadService.initLang();

      /* 1, sqlite */
      loadService.load(this.globalVars.getLang());

      /* 2. firebase */
      firebaseAuthService.loginInAnonymously();

      /* 3. AdMob */
      admobService.create();

      // for login test > 운영 나가기 전에 반드시 제거
      //authService.setTestUser();
    });
  }
}
