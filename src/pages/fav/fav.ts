import { Component }                from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SqlFavService, Fav }       from '../../providers/sql-fav-service';
import { SightDetailPage }          from '../sight-detail/sight-detail';
import { FirebaseAnalytics }        from '@ionic-native/firebase-analytics';

@Component({
  selector: 'page-fav',
  templateUrl: 'fav.html'
})

export class FavPage {
  GRP_ID_MINAMI       : string = "MM";
  GRP_ID_KITA         : string = "KT";
  GRP_ID_OSAKA_CASTLE : string = "OC";
  GRP_ID_TENNOJI      : string = "TJ";
  GRP_ID_BAY_AREA     : string = "BA";
  favMinami           : any       = [];
  favKita             : any       = [];
  favOsakaCastle      : any       = [];
  favTennoji          : any       = [];
  favBayArea          : any       = [];

  constructor(public  navCtr            : NavController,
              public  params            : NavParams,
              private firebaseAnalytics : FirebaseAnalytics,
              private sqlFavService     : SqlFavService) {
    console.log("[fav:()]");
  }

  ionViewDidEnter() {
    console.log("[fav:ionViewDidEnter()]");
    this.favMinami        = [];
    this.favKita          = [];
    this.favOsakaCastle   = [];
    this.favTennoji       = [];
    this.favBayArea       = [];
    this.insertData(this.GRP_ID_MINAMI, this.favMinami);
    this.insertData(this.GRP_ID_KITA,   this.favKita);
    this.insertData(this.GRP_ID_OSAKA_CASTLE, this.favOsakaCastle);
    this.insertData(this.GRP_ID_TENNOJI,  this.favTennoji);
    this.insertData(this.GRP_ID_BAY_AREA, this.favBayArea);

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "fav"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  insertData(grpId, fav){
    this.sqlFavService.getFavByGrpId(grpId).then(
      data => {
        if(data.rows.length > 0){
          for(var i = 0; i < data.rows.length; i++){
            let item = data.rows.item(i);
            fav.push(new Fav(item.ID, item.GRP_ID, item.NAME, item.THUMB_PATH));
          }
        }
        return fav;
      }
    ).catch((error)=>{
      console.error('[fav:insertData()] getList : ' + error.message);
    });
  }

  gotoDetail(id, grpId){
    console.log("[fav:gotoDetail()]");
    this.navCtr.push(SightDetailPage, {
      id        : id,
      grpId     : grpId
    });
  }
}
