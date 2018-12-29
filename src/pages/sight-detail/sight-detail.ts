import {Component}                    from '@angular/core';
import {NavParams}                    from 'ionic-angular';
import {SqlSightService, SightDetail} from '../../providers/sql-sight-service';
import {SqlFavService, Fav}           from '../../providers/sql-fav-service';
import {GlobalVars}                   from '../../providers/global-vars';
import {FindPathPage}                 from '../findPath/findPath';
import {NavController}                from "ionic-angular/index";
import {Platform}                     from 'ionic-angular';
import {InAppBrowser}                 from '@ionic-native/in-app-browser';
import { FirebaseAnalytics }    from '@ionic-native/firebase-analytics';

@Component({
  selector: 'page-sight-detail',
  templateUrl : 'sight-detail.html'
})

export class SightDetailPage {
  id          : string;
  grpId       : string;
  star        : boolean;
  sightDetail : any;
  fav         : any     = [];

  constructor(private iab             : InAppBrowser,
              public navCtr           : NavController,
              public navParams        : NavParams,
              private sqlSightService : SqlSightService,
              private sqlFavService   : SqlFavService,
              public  globalVars      : GlobalVars,
              private firebaseAnalytics: FirebaseAnalytics,
              private platform        : Platform) {
    console.log("[sightDetail:()]");
    this.grpId     = navParams.get('grpId');
    this.id        = navParams.get('id');

    // get detail
    this.sqlSightService.getSightDetailById(this.grpId, this.id).then(
      data => {
        if(data.rows.length > 0){
          let item = data.rows.item(0);
          this.sightDetail = (new SightDetail(
            item.ID, item.NAME, item.DESC, item.TIME, item.WAY, item.FEE, item.URL,
            item.MAP_LAT, item.MAP_LNG, item.THUMB_PATH, item.IMG_PATH, item.GRP_ID));
        }
      }
    ).catch((error)=>{
      console.error('[sightDetail:()] getSightDetailById failed : ' + error.message);
    });

    // get favorites
    this.sqlFavService.getFavBySightId(this.id).then(
      data => {
        this.fav = [];
        if(data.rows.length > 0){
          for(var i = 0; i < data.rows.length; i++){
            let item = data.rows.item(i);
            this.fav.push(new Fav(item.ID, item.GRP_ID, item.NAME, item.THUMB_PATH));
          }
        }
        this.star = this.fav.length > 0 ? true : false;
      }
    ).catch((error)=>{
      console.error('[sightDetail:()] getFavBySightId failed : ' + error.message);
    });
  }

  ionViewDidEnter() {
    console.log("[sightDetail:ionViewDidEnter()]");
    this.globalVars.setHasGoOut(true);

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "sight-detail", name: this.sightDetail.name})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  toggleFav(){
    console.log("[sightDetail:toggleFav()]");
    if(this.star){
      this.sqlFavService.removeFav(this.id).then(
        () => {
          this.star = false;
        }).catch((error)=>{
          console.error('[sightDetail:toggleFav()] removeFav failed : ' + error.message);
        });
    }else{
      this.sqlFavService.insertFav(this.sightDetail.id, this.sightDetail.grpId, this.sightDetail.name, this.sightDetail.thumbPath).then(
        data =>{
          this.star = true;
        }).catch((error)=>{
          console.error('[sightDetail:toggleFav()] insertFav failed : ' + error.message);
        });
    }
  }

  gotoMap(){
    console.log("[sightDetail:gotoMap()]");
    this.navCtr.push(FindPathPage, {
      "isSight"   : true,
      "mapLat"    : this.sightDetail.mapLat,
      "mapLng"    : this.sightDetail.mapLng,
      "name"      : this.sightDetail.name,
      "thumbPath" : this.sightDetail.thumbPath,
      "id"        : this.sightDetail.id,
      "grpId"     : this.sightDetail.grpId
    })
  }

  gotoSite(url){
    console.log("[sightDetail:gotoSite()]");
    this.platform.ready().then(() => {
      const browser = this.iab.create(url);
      browser.close();
    });
  }
}
