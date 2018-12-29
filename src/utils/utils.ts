import {Injectable}                 from "@angular/core";

@Injectable()
export class Utils {


  static pad9Digits(n){
    return this.padDigits(n, 9);
  }

  static padDigits(n, width){
    let z = '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }


}
