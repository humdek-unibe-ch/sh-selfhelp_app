# SelfHelp Mobile App

The SelfHelp Mobile app is a tool thar renders SelfHelp CMS in the app
The basic concept is as follows:

Pages are organized as menus.
Sub pages are organized as sub-menus

# Instructions
 - require JAVA 17
 - `ionic cap add android`
 - for `android` copy file `google-services.json` in `android/app` folder 
 - `ionic cap build`
 - `ionic cap sync`
 - `npx ionic cap run android --target=ce09193988d5244e0d7e  --livereload --external --configuration=production` - local command for Stefan's tablet
 - `ionic capacitor run android -l --external` for local testing; check firewall and ports if it does not work on device but works on emulator. Also the device should be in the same network. Check if node is added.



