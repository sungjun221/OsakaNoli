import { HttpClient }      from '@angular/common/http';
import { Injectable }      from '@angular/core';
import { FirebaseService } from "./firebase-service";
import firebase from "firebase";

@Injectable()
export class FirebaseBbsReplyService extends FirebaseService{

  constructor(public http: HttpClient) {
    super();
    console.log("[firebase-bbs-reply-service:()]");
  }

  loadBbsReply(targetBbsNo){
    console.log('[firebase-bbs-reply-service:loadBbsReply()]');
    console.log('bbsNo', targetBbsNo);
    return firebase.database().ref('bbs').child(targetBbsNo).child('bbsReply').orderByChild('bbsReplyNo').once('value');
  }

  writeBbsReply(targetBbsNo, userId, platformUserId, nickName, contents, thumbnailImage) {
    console.log('[firebase-bbs-reply-service:writeBbsReply()]');
    console.log('targetBbsNo', targetBbsNo);
    console.log('userId', userId);
    console.log('platformUserId', platformUserId);
    console.log('nickName', nickName);
    console.log('contents', contents);
    console.log('thumbnailImage', thumbnailImage);

    let country = "kr";
    let regDate = this.getTimeStamp();

    let replyCntRef = firebase.database().ref('bbs').child(targetBbsNo).child('replyCnt');

    //  get replyCnt & bbsReplyNo > set bbsReply > set replyCnt++
    return replyCntRef.transaction((replyCnt) => {
      console.log('-------- replyCntRef.transaction() -------');
      console.log('replyCnt', replyCnt);
      if(replyCnt !== null && replyCnt !== undefined){
        console.log('replyCnt === null || replyCnt === undefined');

        let bbsReplyNo  = (replyCnt || 0) + 1;

        console.log('bbsReplyNo', bbsReplyNo);
        console.log('contents', contents);

        firebase.database().ref('bbs').child(targetBbsNo).child('bbsReply').child(bbsReplyNo.toString()).set({
          bbsNo          : targetBbsNo,
          bbsReplyNo     : bbsReplyNo,
          userId         : userId,
          platformUserId : platformUserId,
          platformType   : 'KA',
          nickName       : nickName,
          contents       : contents,
          thumbnailImage : thumbnailImage,
          country        : country,
          regDate        : regDate,
          likeCnt        : 0,
          likeUsers      : '.'
        })
      }

      return replyCnt + 1;
    });
  }

  getTimeStamp(){
    console.log('[firebase-bbs-reply-service:getTimeStamp()]');
    let result:any = "";
    firebase.database().ref('timestamp').set(firebase.database['ServerValue']['TIMESTAMP']);
    firebase.database().ref("timestamp").on('value', function(offset) {
      let offsetVal = offset.val() || 0;
      let dateVal ="/Date("+offsetVal+")/";
      let date = new Date(parseFloat(dateVal.substr(6)))
      result = "-" + date.getFullYear() +
        ("0" + (date.getMonth()+1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
    });
    result *= 1;
    return result;
  }

  thumbsUp(targetBbsNo, targetBbsReplyNo, userId) {
    console.log('[firebase-bbs-reply-service:thumbsUp()]');
    return firebase.database().ref('bbs').child(targetBbsNo).child('bbsReply').child(targetBbsReplyNo)
              .child('likeUsers').child(userId).set({
      userId: userId
    }).then(() => {
      firebase.database().ref('bbs').child(targetBbsNo).child('bbsReply').child(targetBbsReplyNo)
        .child('likeCnt').transaction((currentVal) => {
        return (currentVal || 0) + 1;
      });
    });
  }

  thumbsDown(targetBbsNo, targetBbsReplyNo, userId) {
    console.log('[firebase-bbs-reply-service:thumbsDown()]');
    return firebase.database().ref('bbs').child(targetBbsNo).child('bbsReply').child(targetBbsReplyNo)
            .child('likeUsers').child(userId).remove().then(() => {
      firebase.database().ref('bbs').child(targetBbsNo).child('bbsReply').child(targetBbsReplyNo)
        .child('likeCnt').transaction((currentVal) => {
        return (currentVal || 1) - 1;
      });
    });
  }
}
