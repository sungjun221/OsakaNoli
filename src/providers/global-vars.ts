import { Injectable } from '@angular/core';
import { User }       from '../dtos/user-dto';

export class ReloadOsakaSights{
  private minami      : boolean = false;
  private kita        : boolean = false;
  private osakacastle : boolean = false;
  private tennoji     : boolean = false;
  private bayarea     : boolean = false;

  constructor(minami:boolean, kita:boolean, osakacastle:boolean, tennoji:boolean, bayarea:boolean){
    this.minami      = minami;
    this.kita        = kita;
    this.osakacastle = osakacastle;
    this.tennoji     = tennoji;
    this.bayarea     = bayarea;
  }

  public getNeedReloadByGrpId(grpId:string) : boolean{
    if(grpId === 'MM'){
      return this.minami;
    }else if(grpId === 'KT'){
      return this.kita;
    }else if(grpId === 'OC'){
      return this.osakacastle;
    }else if(grpId === 'TJ'){
      return this.tennoji;
    }else if(grpId === 'BA'){
      return this.bayarea;
    }
  }

  public setNeedReloadByGrpId(grpId:string, val:boolean){
    if(grpId === 'MM'){
      this.minami = val;
    }else if(grpId === 'KT'){
      this.kita = val;
    }else if(grpId === 'OC'){
      this.osakacastle = val;
    }else if(grpId === 'TJ'){
      this.tennoji = val;
    }else if(grpId === 'BA'){
      this.bayarea = val;
    }
  }

  public setNeedReload(manami:boolean, kita:boolean, osakacastle:boolean, tennoji:boolean, bayarea:boolean){
    this.minami      = manami;
    this.kita        = kita;
    this.osakacastle = osakacastle;
    this.tennoji     = tennoji;
    this.bayarea     = bayarea;
  }
}

@Injectable()
export class GlobalVars {
  private hasGoOut                : boolean = false;
  private isLogin                 : boolean = false;
  private user                    : User    = null;
  private needReloadBbs           : boolean = true;
  private needReloadHome          : boolean = false;
  private needReloadOsakaSights   : ReloadOsakaSights = new ReloadOsakaSights(false, false, false, false, false);
  private lang                    : string  = '';

  constructor() {
    this.hasGoOut = false;
  }

  public setHasGoOut(flag) {
    this.hasGoOut = flag;
  }

  public getHasGoOut() {
    return this.hasGoOut;
  }

  public setIsLogin(flag){
    this.isLogin = flag;
  }

  public getIsLogin(){
    return this.isLogin;
  }

  public setUserByObj(user){
    this.user = user;
  }

  public setUserNull(){
    this.setIsLogin(false);
    this.user = null;
  }

  public setUser(userId, platformUserId, nickName, profileImage, thumbnailImage, platformType, country){
    this.setIsLogin(true);
    this.user = new User(userId, platformUserId, nickName, profileImage, thumbnailImage, platformType, country);
  }

  public getUser(){
    return this.user;
  }

  public getNeedReloadBbs() {
    return this.needReloadBbs;
  }

  public setNeedReloadBbs(needReloadBbs) {
   this.needReloadBbs = needReloadBbs;
  }

  public getLang(): string{
    return this.lang;
  }

  public setLang(lang:string){
    this.lang = lang;
  }

  public getNeedReloadHome() : boolean{
    return this.needReloadHome;
  }

  public setNeedReloadHome(needReloadHome:boolean){
    this.needReloadHome = needReloadHome;
  }

  public getNeedReloadSight() : ReloadOsakaSights{
    return this.needReloadOsakaSights;
  }
}
