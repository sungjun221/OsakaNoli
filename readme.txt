1. 카카오톡 로그인 기능을 위해 추가해야 하는 로직


(1) appDelegate.m 로직 추가
    > url : https://developers.kakao.com/docs/ios/user-management#%EB%A1%9C%EA%B7%B8%EC%9D%B8
==========================================================================================================
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
                                       sourceApplication:(NSString *)sourceApplication
                                              annotation:(id)annotation {
    ...
    if ([KOSession isKakaoAccountLoginCallback:url]) {
        return [KOSession handleOpenURL:url];
    }
    ...
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
                                                 options:(NSDictionary<NSString *,id> *)options {
    ...
    if ([KOSession isKakaoAccountLoginCallback:url]) {
        return [KOSession handleOpenURL:url];
    }
    ...
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    [KOSession handleDidBecomeActive];
}
==========================================================================================================




(2) kakaotalk.m
==========================================================================================================
#import "KakaoTalk.h"
#import <Cordova/CDVPlugin.h>
#import <KakaoOpenSDK/KakaoOpenSDK.h>

@implementation KakaoTalk

- (void) login:(CDVInvokedUrlCommand*) command
{
    NSLog(@"login start.");
    [[KOSession sharedSession] close];
    NSLog(@"login close.");

    [[KOSession sharedSession] openWithCompletionHandler:^(NSError *error) {
        NSLog(@"openWithCompletionHandler.");

        if ([[KOSession sharedSession] isOpen]) {
            NSLog(@"isOpen.");
            // login success
            NSLog(@"login succeeded.");
            [KOSessionTask meTaskWithCompletionHandler:^(KOUser* result, NSError *error) {
                CDVPluginResult* pluginResult = nil;
                if (result) {
                    // success
                    NSLog(@"userId=%@", result.ID);
                    NSLog(@"nickName=%@", [result propertyForKey:@"nickname"]);
                    NSLog(@"profileImage=%@", [result propertyForKey:@"profile_image"]);
                    NSLog(@"thumbnail_image=%@", [result propertyForKey:@"thumbnail_image"]);

                    NSDictionary *userSession = @{
                                                  @"id": result.ID,
                                                  @"nickname": [result propertyForKey:@"nickname"],
                                                  @"profile_image": [result propertyForKey:@"profile_image"],
                                                  @"thumbnail_image": [result propertyForKey:@"thumbnail_image"]};
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:userSession];
                } else {
                    // failed
                    NSLog(@"login session failed.");
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
                }
                [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            }];
        } else {
            // failed
            NSLog(@"login failed.");
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }


    }  authType:(KOAuthType)KOAuthTypeTalk, nil];
}

- (void)logout:(CDVInvokedUrlCommand*)command
{
    [[KOSession sharedSession] logoutAndCloseWithCompletionHandler:^(BOOL success, NSError *error) {
        if (success) {
            // logout success.
            NSLog(@"Successful logout.");
        } else {
            // failed
            NSLog(@"failed to logout.");
        }
    }];
    CDVPluginResult* pluginResult = pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)share:(CDVInvokedUrlCommand *)command
{
}

@end
==========================================================================================================




(3) kakaotalk.js
==========================================================================================================
cordova.define("cordova-plugin-htj-kakaotalk.KakaoTalk", function(require, exports, module) {
var exec = require('cordova/exec');

var KakaoTalk = {
	login: function (successCallback, errorCallback) {
		exec(successCallback, errorCallback, "KakaoTalk", "login", []);
    },
	logout: function (successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'KakaoTalk', 'logout', []);
	},
	share : function(options, successCallback, errorCallback) {

		for(var options_key in options){
			if(typeof options[options_key] === 'object'){
				for(var key in options[options_key]){
					options[options_key][key] = options[options_key][key] || '';
				};
			}else{
				options[options_key] = options[options_key] || '';
			}
		};
	    exec(successCallback, errorCallback, "KakaoTalk", "share", [options]);
	}
};

module.exports = KakaoTalk;

});
==========================================================================================================



(4) KakaoTalk.java의 아래 function을 변경 (Android)
==========================================================================================================
/**
	 * Log in
	 */
	private void login()
	{
		Handler mHandler = new Handler(Looper.getMainLooper());
		mHandler.postDelayed(new Runnable() {
			@Override
			public void run() { Session.getCurrentSession().open(AuthType.KAKAO_TALK, currentActivity); }
		}, 0);
	}

	/**
	 * Log out
	 * @param callbackContext
	 */
	private void logout(final CallbackContext callbackContext)
	{
		Handler mHandler = new Handler(Looper.getMainLooper());
		mHandler.postDelayed(new Runnable() {
			@Override
			public void run() {
				UserManagement.requestLogout(new LogoutResponseCallback() {
					@Override
					public void onCompleteLogout() {
						Log.v(LOG_TAG, "kakao : onCompleteLogout");
						callbackContext.success();
					}
				});
			}
		}, 0);
	}
==========================================================================================================



2. google maps 사용을 위한 추가 설정
(1) PROJECT_NAME-info.plist 에 아래의 설정을 추가
==========================================================================================================
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Access your location information only when you're using the app.</string>
==========================================================================================================



3. Android 'error: spawn eacces' 에러 (Permission 에러)
프로젝트 루트 디렉토리로 가서 아래 명령어 실행
chmod -R u+x .



4. Android ratson 모듈 오류 해결
https://github.com/ratson/cordova-plugin-admob-free
다운 받은 뒤 ..../src/android 내용을 프로젝트의 ..../app/src/main/java/name/ratson/cordova/admob/
밑에 복사해야함.


5. Android Firebase Analystic 설정 위한 수정
참고 : https://stackoverflow.com/questions/48307382/build-exception-with-cordova-plugin-smooch?rq=1
./gradlew myapp:dependencies 실행하여 변경해야할 버전을 확인하여 아래 파일들에서 해당 내용을 수정

project.properties
app/build.gradle
gradle-wrapper.properties
android.json
GradleBuilder.js
StudioBuilder.js


6. iOS Firebase Analystic 설정 위한 CocoaPods 세팅
- Project 선택 > Build Settings > + >
  > PODS_PODFILE_DIR_PATH : ${SRCROOT}
  > PODS_ROOT : ${SRCROOT}/Pods
