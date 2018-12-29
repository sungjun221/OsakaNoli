export class Bbs{
  bbsNo            : number;
  userId           : string;
  platformUserId   : string;
  nickName         : string;
  contents         : string;
  thumbnailImage   : string;
  regDate          : string;
  likeCnt          : number;
  replyCnt         : number;
  isLike           : boolean;
  country          : string;
  bbsReplyNo       : number;

  constructor(bbsNo: number, userId: string, platformUserId: string, nickName: string, contents: string,
              thumbnailImage: string, regDate: string, likeCnt: number, replyCnt: number, isLike: boolean,
              country: string, bbsReplyNo: number){
    this.bbsNo          = bbsNo;
    this.userId         = userId;
    this.platformUserId = platformUserId;
    this.nickName       = nickName;
    this.contents       = contents;
    this.thumbnailImage = thumbnailImage;
    this.regDate        = regDate;
    this.likeCnt        = likeCnt;
    this.replyCnt       = replyCnt;
    this.isLike         = isLike;
    this.country        = country;
    this.bbsReplyNo     = bbsReplyNo;
  }
}
