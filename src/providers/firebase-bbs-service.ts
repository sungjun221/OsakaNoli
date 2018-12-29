import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {FirebaseService} from "./firebase-service";
import firebase from "firebase";

@Injectable()
export class FirebaseBbsService extends FirebaseService {
  private bbsList: any = [];
  private count: number = Number.MIN_SAFE_INTEGER;
  private pageSize: number = 10;
  private isFinish: boolean = false;

  constructor(public http: HttpClient) {
    super();
    console.log("[firebase-bbs-service:()]");


  }

  getBbsCounter() {
    console.log('[firebase-bbs-service:getBbsCounter()]');

    return firebase.database().ref('counter').child('bbs').once('value');
  }


  writeBbs(userId, platformUserId, nickName, contents, thumbnailImage) {
    let bbsNoSeq;
    let country = "kr";
    let regDate = this.getTimeStamp();

    return firebase.database().ref('counter').child('bbs').transaction((currentVal) => {
      return (currentVal || 0) - 1;
    }, (err, success, snap) => {
      bbsNoSeq = snap.val();

      return firebase.database().ref('bbs/' + bbsNoSeq).set({
        bbsNo: bbsNoSeq,
        userId: userId,
        platformUserId: platformUserId,
        platformType: 'KA',
        nickName: nickName,
        contents: contents,
        thumbnailImage: thumbnailImage,
        country: country,
        target: 'OSK',
        regDate: regDate,
        likeCnt: 0,
        likeUsers: '.',
        replyCnt: 0,
        bbsReply: '.'
      });
    });
  }

  initPage(){
    console.log('[firebase-bbs-service:initPage()]');
    this.count = Number.MIN_SAFE_INTEGER;
    this.bbsList = [];
  }


  loadBbs() {
    console.log('[firebase-bbs-service:loadBbs()]');
    if (this.isFinish == true) {
      return;
    }

    if (this.count == Number.MIN_SAFE_INTEGER) {
      //  get bbs count.
      return this.getBbsCounter().then(snapshot => {
        this.count = snapshot.val();
      }).then(() => {
        return this._loadBbs();
      });
    }
    return this._loadBbs();
  }

  private _loadBbs() {
    let startAt = this.count;
    let endAt = this.count + this.pageSize - 1;
    this.count += this.pageSize;

    if (this.count > 0) {
      endAt = 0;
      this.isFinish = true;
    }

    console.log('count', this.count);
    console.log('startAt', startAt);
    console.log('endAt', endAt);

    return firebase.database().ref('bbs').orderByChild('bbsNo').startAt(startAt).endAt(endAt).once('value');
  }

  thumbsUp(targetBbsNo, userId) {
    console.log('[firebase-bbs-service:thumbsUp()]');
    return firebase.database().ref('bbs').child(targetBbsNo).child('likeUsers').child(userId).set({
      userId: userId
    }).then(() => {
      firebase.database().ref('bbs').child(targetBbsNo).child('likeCnt').transaction((currentVal) => {
        return (currentVal || 0) + 1;
      });
    });
  }

  thumbsDown(targetBbsNo, userId) {
    console.log('[firebase-bbs-service:thumbsDown()]');
    return firebase.database().ref('bbs').child(targetBbsNo).child('likeUsers').child(userId).remove().then(() => {
      firebase.database().ref('bbs').child(targetBbsNo).child('likeCnt').transaction((currentVal) => {
        return (currentVal || 1) - 1;
      });
    });
  }

  getTimeStamp() {
    console.log('[firebase-bbs-service:getTimeStamp()]');
    let result: any = "";
    firebase.database().ref('timestamp').set(firebase.database['ServerValue']['TIMESTAMP']);
    firebase.database().ref("timestamp").on('value', function (offset) {
      let offsetVal = offset.val() || 0;
      let dateVal = "/Date(" + offsetVal + ")/";
      let date = new Date(parseFloat(dateVal.substr(6)))
      result = "-" + date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
    });
    result *= 1;
    return result;
  }

  readRealTime(handleData) {
    firebase.database().ref('bbs').on('child_added', handleData, this);
  }

  getBbsList() {
    return this.bbsList;
  }

  getIsFinish() {
    return this.isFinish;
  }
}
