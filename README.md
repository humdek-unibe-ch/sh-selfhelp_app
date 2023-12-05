# SelfHelp Mobile App

The SelfHelp Mobile app is a tool thar renders SelfHelp CMS in the app
The basic concept is as follows:

Pages are organized as menus.
Sub pages are organized as sub-menus

# Instructions
 - require JAVA 17
 - `ionic cap add android`
 - for `android` copy file `google-services.json` in `android/app` folder 
 - `npx capacitor-assets generate` - add resources
 - `ionic cap build`
 - `ionic cap sync`
 - `ionic cap sync --inline` for debugging add source maps
 - `npx ionic cap run android --target=ce09193988d5244e0d7e  --livereload --external --configuration=production` - local command for Stefan's tablet
 - `ionic capacitor run android -l --external` for local testing; check firewall and ports if it does not work on device but works on emulator. Also the device should be in the same network. Check if node is added.

# Instructions for build and release
## General
 - run `ionic cap build` 
 - run `ionic cap copy`
 - run `ionic cap sync` 
 - then in Android / Xcode studio generate bundle and sign it
## Based on project
 - Set the environmental variable. Check the options in `capacitor.config.ts`
    - Windows:
      - CMD: `set NODE_ENV=habirupt` , check: `echo %NODE_ENV%`
      - Powershell: `$env:NODE_ENV = "habirupt"` , check `echo $env:NODE_ENV`
    - Unix: 
      - `NODE_ENV=habirupt`
 - Run the commands
    - run `ionic cap build` 
    - run `ionic cap copy`
    - run `ionic cap sync`
 - Update the android or iOS project: `npx trapeze run ./projects/habirupt/config.yaml --android-project android`
 - Generate the icons: `npx capacitor-assets generate --assetPath "./projects/habirupt"`


# iOS Push notifications
 - [instructions](https://capacitorjs.com/docs/guides/push-notifications-firebase) 

# Instructions App center Code-Push
 - Install: `npm install -g appcenter-cli`
 - Login: `appcenter login`
 - Create: create react-native app in the [appcenter](https://appcenter.ms) web interface
 - Publish: 
  - `ionic cap build android`
  - `ionic cap build ios`
  - `ionic cap sync android`
  - `ionic cap sync ios`
  - Android
   - `appcenter codepush release -a TPF-UniBe/SelfHelp-Android -c android/app/src/main/assets/public/ -d Production -t 1.0.0 --description 'My Description' --mandatory true`
   - History Check: `appcenter codepush deployment history -a TPF-UniBe/SelfHelp-Android Production`
  - iOS
   - create production: `appcenter codepush deployment add -a TPF-UniBe/SelfHelp-ios Production`
   - check keys: `appcenter codepush deployment list -k --app TPF-UniBe/SelfHelp-ios`
   - `appcenter codepush release -a TPF-UniBe/SelfHelp-ios -c ios/App/App/public/ -d Production -t 3.0.0 --description 'My Description' --mandatory true`
   - History Check: `appcenter codepush deployment history -a TPF-UniBe/SelfHelp-ios Production`



