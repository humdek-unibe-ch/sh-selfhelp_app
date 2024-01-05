# SelfHelp Mobile App

The SelfHelp Mobile app is a tool thar renders SelfHelp CMS in the app
The basic concept is as follows:

Pages are organized as menus.
Sub pages are organized as sub-menus

# Instructions
 - require JAVA 17
 - set the NODE_ENV: see the commands bellow in the section `based on projects`
 - generate file `./src/env/project.config.ts` with command: `node ./src/env/script.js`
 - `ionic cap add android`
 - for `android` copy file `google-services.json` in `android/app` folder 
 - `npx capacitor-assets generate` - add resources
 - `ionic cap build`
 - `ionic cap sync`
 - `ionic cap sync --inline` for debugging add source maps
 - `npx ionic cap run android --target=ce09193988d5244e0d7e  --livereload --external --configuration=production` - local command for Stefan's tablet
 - `ionic capacitor run android -l --external` for local testing; check firewall and ports if it does not work on device but works on emulator. Also the device should be in the same network. Check if node is added.
 - `ionic cap run ios -l --external` - iOS - after the error, go to the folder and rename `your_app.app` to `App.app` [fix](https://stackoverflow.com/questions/72969163/problem-with-debugging-on-physical-device-on-ios/73546894#73546894)

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
- Generate the icons:
  - Powershell: `npx capacitor-assets generate --assetPath "./projects/$env:NODE_ENV"`
 - Update the android or iOS project: 
  - Powershell: `npx trapeze run .\projects\$env:NODE_ENV\config.yaml --android-project android` Be sure that the files are not locked when executed. Sometimes a java process is not closed and keep the files locked. Kill it.


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



