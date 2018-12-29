import { Component }            from '@angular/core';
import { NavController }        from 'ionic-angular';
import { SqlHomeService, Home } from '../../providers/sql-home-service';
import { SightPage }            from '../sight/sight';
import { TransPage }            from '../trans/trans';
import { Platform }             from 'ionic-angular';
import { InAppBrowser }         from '@ionic-native/in-app-browser';
import { GlobalVars }           from '../../providers/global-vars';
import { FirebaseAnalytics }    from '@ionic-native/firebase-analytics';

@Component({
  selector: 'page-home',
  templateUrl : 'home.html'
})

export class HomePage {
  platform   : Platform;
  homes      : any = [];
  LIMIT      : number = 20;
  loadingBar : boolean = true;

  constructor(private iab            : InAppBrowser,
              public navCtr          : NavController,
              public globalVars      : GlobalVars,
              private sqlHomeService : SqlHomeService,
              private firebaseAnalytics: FirebaseAnalytics,
              platform : Platform) {
    this.platform = platform;
    console.log("[home:()]");
    let cnt = 0;
    var loadingChk = setInterval(()=>{
      cnt++;
      if(this.sqlHomeService.isLoadingComplete()){
        clearInterval(loadingChk);
        this.readData();
      }
      if(cnt > 50){
        clearInterval(loadingChk);
      }
    }, 200);
  }

  ionViewWillEnter(){
    console.log("[home:ionViewWillEnter()]");
    if(this.globalVars.getNeedReloadHome() === true){
      this.homes = [];
      this.readData();
      this.globalVars.setNeedReloadHome(false);
    }
  }

  ionViewDidEnter() {
    console.log("[home:ionViewDidEnter()]");
    this.firebaseAnalytics.logEvent('page_view', {page: "home"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  readData(){
    console.log("[home:readData()]");
    this.sqlHomeService.getList().then(
      data => {
        console.log('[home:readData()] data', data);
        this.loadingBar = false;
        console.log('[home:readData()] data.rows.length', data.rows.length);
        if(data.rows.length > 0){
          for(var i = 0; i < data.rows.length; i++){
            console.log('[home:readData()] i', i);
            let item = data.rows.item(i);
            console.log('   item.ID',item.ID);
            console.log('   item.NAME',item.NAME);
            console.log('   item.DESC',item.DESC);
            console.log('   item.IMG_PATH',item.IMG_PATH);
            console.log('');
            this.homes.push(new Home(item.ID, item.NAME, item.DESC, item.IMG_PATH));
          }
        }
      }
    ).catch((error)=>{
      console.error('[home:readData()] getList : ' + error.message);
    });
  }

  gotoSight(homeName, grpId){
    console.log("[home:gotoSight()]");
    this.navCtr.push(SightPage,{
      homeName : homeName,
      grpId    : grpId
    });

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('event', {page: "home", name: "gotoSight", sightName: homeName})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  gotoMovie() {
    this.platform.ready().then(() => {
      let url = 'https://www.youtube.com/watch?v=-UpuoZ-u1Tc&t=1s';
      const browser = this.iab.create(url, '_system');
      browser.close();
    });

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('event', {page: "home", name: "gotoMovie"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  gotoTrans() {
    console.log("[home:gotoTrans()]");
    this.navCtr.push(TransPage,{
    });
  }
}

