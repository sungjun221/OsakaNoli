import {Component}                               from '@angular/core';
import {NavController, NavParams}                from 'ionic-angular';
import {SqlSightService, Sight}                  from '../../providers/sql-sight-service';
import {SightDetailPage}                         from '../sight-detail/sight-detail';
import { GlobalVars }                            from '../../providers/global-vars';
import { FirebaseAnalytics }    from '@ionic-native/firebase-analytics';


@Component({
  selector: 'page-sight',
  templateUrl : 'sight.html'
})

export class SightPage {
  sights     : any     = [];
  homeName   : string;
  grpId      : string;
  LIMIT      : number = 20;

  constructor(public navCtr           : NavController,
              public navParams        : NavParams,
              public globalVars       : GlobalVars,
              private firebaseAnalytics: FirebaseAnalytics,
              private sqlSightService : SqlSightService) {
    console.log("[sight:()]");
    this.homeName = navParams.get('homeName');
    this.grpId    = navParams.get('grpId');

    this.readData();
  }

  ionViewWillEnter(){
    console.log("[sight:ionViewWillEnter()]");
    if(this.globalVars.getNeedReloadSight().getNeedReloadByGrpId(this.grpId) === true){
      this.sights = [];
      this.readData();
      this.globalVars.getNeedReloadSight().setNeedReloadByGrpId(this.grpId,false);
    }
  }

  ionViewDidEnter(){
    console.log("[sight:ionViewDidEnter()]");
    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "sight", name: this.homeName})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  readData(){
    console.log("[sight:readData()]");
    this.sqlSightService.getSightsByGrpId(this.grpId).then(
      data => {
        if(data.rows.length > 0){
          for(var i = 0; i < data.rows.length; i++){
            let item = data.rows.item(i);
            this.sights.push(new Sight(item.ID, item.NAME, item.DESC, item.THUMB_PATH, item.GRP_ID));
          }
        }
      }
    );
  }

  gotoDetail(id, grpId){
    console.log("[sight:gotoDetail()]");
    this.navCtr.push(SightDetailPage, {
      id        : id,
      grpId     : grpId
    });
  }
}
