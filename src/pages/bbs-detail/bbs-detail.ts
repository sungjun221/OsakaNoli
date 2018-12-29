import { Component }                 from '@angular/core';
import { NavController, NavParams}   from 'ionic-angular';
import { AlertController }           from 'ionic-angular';
import { Bbs }                       from '../../dtos/bbs-dto';
import { GlobalVars }                from '../../providers/global-vars';
import { LoginPage }                 from '../login/login';
import { FirebaseBbsReplyService }   from '../../providers/firebase-bbs-reply-service';
import { FirebaseBbsService }        from "../../providers/firebase-bbs-service";
import { TranslateService }          from '@ngx-translate/core';
import { FirebaseAnalytics }    from '@ionic-native/firebase-analytics';


@Component({
  selector: 'page-bbs-detail',
  templateUrl: 'bbs-detail.html',
})
export class BbsDetailPage {
  selBbs            : Bbs;
  bbsReplyList      : any   = [];
  contents      : string;
  isLogin       : boolean = false;

  year                  : string = '';
  month                 : string = '';
  day                   : string = '';
  hour                  : string = '';
  minutes               : string = '';
  confirm               : string = '';
  pleaseWrite           : string = '';
  writingComplete       : string = '';
  pleaseLikeAfterLogin  : string = '';

  constructor(public  navCtrl                  : NavController,
              public  navParams                : NavParams,
              public  globalVars               : GlobalVars,
              private alertCtrl                : AlertController,
              private firebaseBbsService       : FirebaseBbsService,
              private firebaseBbsReplyService  : FirebaseBbsReplyService,
              private firebaseAnalytics        : FirebaseAnalytics,
              private translate                : TranslateService) {
    console.log("[bbs-detail-service:()]");
    let bbsNo          = navParams.get('bbsNo');
    let userId         = navParams.get('userId');
    let platformUserId = navParams.get('platformUserId');
    let nickName       = navParams.get('nickName');
    let contents       = navParams.get('contents');
    let thumbnailImage = navParams.get('thumbnailImage');
    let regDate        = navParams.get('regDate');
    let likeCnt        = navParams.get('likeCnt') || 0;
    let replyCnt       = navParams.get('replyCnt') || 0;
    let isLike         = navParams.get('isLike') || false;
    let country        = navParams.get('country') || '';

    translate.get(['BBS_YEAR',
                        'BBS_MONTH',
                        'BBS_DAY',
                        'BBS_HOUR',
                        'BBS_MINUTE',
                        'BBS_CONFIRM',
                        'BBS_PLEASE_WRITE',
                        'BBS_WRITING_COMPLETE',
                        'BBS_PLEASE_LIKE_AFTER_LOGIN']).subscribe(
      values => {
        // value is our translated string
        this.year                 = values.BBS_YEAR;
        this.month                = values.BBS_MONTH;
        this.day                  = values.BBS_DAY;
        this.hour                 = values.BBS_HOUR;
        this.minutes              = values.BBS_MINUTE;
        this.confirm              = values.BBS_CONFIRM;
        this.pleaseWrite          = values.BBS_PLEASE_WRITE;
        this.writingComplete      = values.BBS_WRITING_COMPLETE;
        this.pleaseLikeAfterLogin = values.BBS_PLEASE_LIKE_AFTER_LOGIN;
      }
    );

    this.selBbs = new Bbs(bbsNo, userId, platformUserId, nickName, contents, thumbnailImage, regDate, likeCnt, replyCnt, isLike, country, 0);
    this.loadBbsReply();
  }

  ionViewDidEnter() {
    console.log("[bbs-detail-service:ionViewDidEnter()]");
    this.isLogin = this.globalVars.getIsLogin();

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "bbs-detail", bbsId: this.selBbs.bbsNo})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }


  loadBbsReply(){
    console.log("[bbs-detail-service:loadBbsReply()]");
    this.firebaseBbsReplyService.loadBbsReply(this.selBbs.bbsNo).then((snapshot) => {
      console.log('loadBbsReply snapshot', snapshot);
      if(snapshot.length === undefined){
        console.log('loadBbsReply snapshot.length === undefined');
      }{
        this.bbsReplyList = [];
        snapshot.forEach((ss)=>{
          let ssVal = ss.val();
          console.log('ssVal', ssVal);

          let bbsNo = 0;
          if(ssVal.bbsNo !== undefined){
            bbsNo = Number(ssVal.bbsNo);
          }

          let bbsReplyNo = Number(ssVal.bbsReplyNo);
          let strRegDate = ssVal.regDate.toString().slice(1);
          let chgRegDate = strRegDate.slice(0,4) + this.year + strRegDate.slice(4, 6) + this.month + strRegDate.slice(6, 8) + this.day
            + strRegDate.slice(8, 10) + this.hour + strRegDate.slice(10, 12) + this.minutes;

          let thumbnailImage = ssVal.thumbnailImage;
          let contents = ssVal.contents;

          let userId = "";
          if(ssVal.userId !== undefined){
            userId = ssVal.userId;
          }

          let platformUserId = "";
          if(thumbnailImage === null || thumbnailImage === undefined){
            platformUserId = ssVal.userId.slice(0,5);
          }else{
            platformUserId = ssVal.userId;
          }

          let nickName = "";
          if(ssVal.nickName !== undefined){
            nickName = ssVal.nickName;
          }

          let likeCnt = 0;
          if(ssVal.likeCnt !== undefined){
            likeCnt = ssVal.likeCnt;
          }

          let isLike = false;
          if(this.globalVars.getIsLogin() === true && ssVal.likeUsers !== undefined){
            let likeUsers = ssVal.likeUsers;
            let myUserId = this.globalVars.getUser().userId;
            if(myUserId !== null && myUserId !== undefined
              && likeUsers[myUserId] !== null && likeUsers[myUserId] !== undefined ){
              if(likeUsers[myUserId].userId == myUserId){
                isLike = true;
              }
            }
          }

          let country = '';
          if(ssVal.country !== undefined){
            country = ssVal.country;
          }

          console.log('bbsNo', ssVal.bbsNo);
          console.log('regDate', ssVal.regDate);
          console.log('thumbnailImage', thumbnailImage);
          console.log('likeCnt', likeCnt);
          console.log('isLike', isLike);
          console.log('country', country);
          console.log('bbsReplyNo', ssVal.bbsReplyNo);
          this.bbsReplyList.push(new Bbs(bbsNo, userId, platformUserId, nickName, contents, thumbnailImage, chgRegDate, likeCnt, 0, isLike, country, bbsReplyNo));
        });
      }
    });
  }

  writeReply(){
    console.log("[bbs-detail-service:writeReply()]");
    if(!this.contents){
      this.customAlert(this.pleaseWrite);
      return;
    }
    let writeBtn = document.getElementById('writeBtn');
    writeBtn.style.visibility = "hidden";

    let userId = this.globalVars.getUser().userId;
    let platformUserId = this.globalVars.getUser().platformUserId;
    let nickName = this.globalVars.getUser().nickName;
    this.firebaseBbsReplyService
        .writeBbsReply(this.selBbs.bbsNo, userId, platformUserId, nickName, this.contents, this.globalVars.getUser().thumbnailImage)
        .then(()=>{
          this.selBbs.replyCnt++;
          this.customAlert(this.writingComplete);
          this.loadBbsReply();
          this.contents = "";
          writeBtn.style.visibility = "visible";
        });
  }


  gotoLogin(){
    this.navCtrl.push(LoginPage, {
      returnPage : "BbsDetail"
    });
  }

  customAlert(contents) {
    console.log("[bbs-detail-service:customAlert()]");
    let alert = this.alertCtrl.create({
      title: contents,
      buttons: [this.confirm]
    });
    alert.present();
  }

  thumbsUpAlert(){
    console.log("[bbs-detail-service:thumbsUpAlert()]");
    this.customAlert(this.pleaseLikeAfterLogin);
  }

  thumbsUp(targetBbsNo) {
    console.log("[bbs-detail-service:thumbsUp()]");
    let userId = this.globalVars.getUser().userId;

    this.firebaseBbsService.thumbsUp(targetBbsNo, userId).then(() => {
      if(this.selBbs !== null && this.selBbs !== undefined){
        this.selBbs.likeCnt++;
        this.selBbs.isLike = true;
        this.globalVars.setNeedReloadBbs(true);
      }
    });
  }

  thumbsDown(targetBbsNo) {
    console.log("[bbs-detail-service:thumbsDown()]");
    console.log('targetBbsNo', targetBbsNo);
    let userId = this.globalVars.getUser().userId;
    console.log('userId', userId);

    this.firebaseBbsService.thumbsDown(targetBbsNo, userId).then(() => {
      if(this.selBbs !== null && this.selBbs !== undefined){
        if(this.selBbs.likeCnt > 0){
          this.selBbs.likeCnt--;
        }
        this.selBbs.isLike = false;
        this.globalVars.setNeedReloadBbs(true);
      }
    });
  }

  thumbsUpDetail(targetBbsNo, targetBbsReplyNo) {
    console.log("[bbs-detail-service:thumbsUpDetail()]");
    let userId = this.globalVars.getUser().userId;

    this.firebaseBbsReplyService.thumbsUp(targetBbsNo, targetBbsReplyNo, userId).then(() => {
      console.log('targetBbsNo', targetBbsNo);
      console.log('targetBbsReplyNo', targetBbsReplyNo);
      console.log('userId', userId);
      let bbs = this.bbsReplyList.find(x => x.bbsReplyNo == targetBbsReplyNo);
      console.log('bbs', bbs);
      if(bbs !== null && bbs !== undefined){
        bbs.likeCnt++;
        bbs.isLike = true;
      }
    });
  }

  thumbsDownDetail(targetBbsNo, targetBbsReplyNo) {
    console.log("[bbs-detail-service:thumbsDownDetail()]");
    console.log('targetBbsNo', targetBbsNo);
    let userId = this.globalVars.getUser().userId;
    console.log('userId', userId);

    this.firebaseBbsReplyService.thumbsDown(targetBbsNo, targetBbsReplyNo, userId).then(() => {
      let bbs = this.bbsReplyList.find(x => x.bbsReplyNo == targetBbsReplyNo);
      console.log('targetBbsNo', targetBbsNo);
      console.log('targetBbsReplyNo', targetBbsReplyNo);
      console.log('userId', userId);
      console.log('bbs', bbs);
      if(bbs !== null && bbs !== undefined){
        if(bbs.likeCnt > 0){
          bbs.likeCnt--;
        }
        bbs.isLike = false;
      }
    });
  }
}
