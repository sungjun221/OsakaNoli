
export class User{
  private _userId         : string;
  private _platformUserId : string;
  private _nickName       : string;
  private _profileImage   : string;
  private _thumbnailImage : string;
  private _platformType   : string;
  private _country        : string;

  constructor(userId:string, platformUserId:string, nickName:string, profileImage:string,
              thumbnailImage:string, platformType:string, country: string){
    this._userId         = userId;
    this._platformUserId = platformUserId;
    this._nickName       = nickName;
    this._profileImage   = profileImage;
    this._thumbnailImage = thumbnailImage;
    this._platformType   = platformType;
    this._country        = country;
  }


  get userId(): string {
    return this._userId;
  }

  get platformUserId(): string {
    return this._platformUserId;
  }

  get nickName(): string {
    return this._nickName;
  }

  get profileImage(): string {
    return this._profileImage;
  }

  get thumbnailImage(): string {
    return this._thumbnailImage;
  }

  get platformType(): string {
    return this._platformType;
  }

  get country(): string {
    return this._country;
  }
}
