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
        
        
    }  authParams:nil authType:(KOAuthType)KOAuthTypeTalk, nil];
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
