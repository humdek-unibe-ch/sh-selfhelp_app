# 3.1.6
 - fix `select` style loading in forms
 - check push update only for native devices

# 3.1.5
 - add styling `info` to style `button`, `form`, `formUserInput`, `login`, `register` and `card`

# 3.1.4
 - show all styles in `form` styles and not only inputs

# 3.1.3
 - add autofill for passwords

# 3.1.2
 - remove web icons file from tracking

# 3.1.1
 - adjust `enc/script.js` to work with folder `configs`

# 3.1.0
 - add `trapeze` configuration for handling multiple builds

# 3.0.1
## New Features
 - add style `sbAsterChart`

# 3.0.0
## New Features
 - update `Angular` to `v16`
 - migrate from `cordova` to `capacitor`
 - add official SelfHelp icons
 - use appcenter for code-push with app-center-cli
 - use capacitor browser for opening external links and pdf files
 - add `min` and `max` characters config for `input` from type `text` and `textarea`
 - automatically detect user locale and load the app based on that locale if the language is supported
 - rework the `calendar` style base on [Full Calendar](https://fullcalendar.io) library
 - add style `modal`
 - add `role` when closing a `modal`
 - add `color` type to the `input` style
 - add `reset server` button to the dev app 

## Bugfix
 - improve the title in style `card`
 - add dismiss functionality in style `alert`
 - properly load the language

# 2.1.3
 - add anonymous users functionality

# 2.1.2
 - add style `surveyJS`

# 2.1.1
 - add style `loop`

# v2.1.0
 - update `cordova-plugin-firebasex` to v16.0.0. Now the notifications work on Android 12+
 - fork `cordova-plugin-code-push` to `MaximBelov/cordova-plugin-code-push#2.0.0-custom`. The auto-update works with corodova-android 10.1.1 - `ionic cordova platform add android@10.1.1`

# v2.0.11
 - load extra fields for validation style

# v2.0.10
 - adjust `entryList` load, not table but just a normal style. Better for customization

# v2.0.9
 - add preview in the browser

# v2.0.8
 -  fix markdown text in `card` title

# v2.0.7
 - fix icon load
 - fix `cordova-plugin-zip` - forked [from](https://github.com/bikubi/cordova-plugin-zip/)

# v2.0.6
 - adjust language load - requires SelfHelp v5.1.2+
 - add `datetime` support for style `input`

# v2.0.5
 - close modal on successful registration for better use experience

# v2.0.4
 - set the default ionic theme to `light`;

# v2.0.3
 - add style `refContainer`
 - input date now save the value in format `YYYY-MM-DD`
 - all formFields are properly loaded if they are in a holder in the form

# v2.0.2
 - load `css_mobile` field for css styles
 - load `linkStyle` children
 - set `cardStyle` color type
 - add `pdfViewer` which open pdf files if they are detected in the url. Note: `<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>` is needed in a `.htaccess` file in folder `assets`;

# v2.0.1
 - add support for styles: `formUserInputLog`, `formUserInputRecord` and `conditionFailed`

# v2.0.0

- Angular 12 update
- update server moved to codepush.philhum.unibe.ch

# v1.0.1

- SelfHelp-Dev app


------------

# v1.0.0

- SOAPP app
