# 3.4.7
### New Features
 - add `ngx-quill` for rich text editing
 - add support for `Rich Text Editor` questions in `SurveyJS`

# 3.4.6
### New Features
 - add `two-factor` authentication

# 3.4.5
### New Features
 - use `resetOnBack` property for SurveyJS Pages. When enabled, all answers on this page will be cleared when the user navigates back to it. This property was added in surveyJS plugin v1.4.0

# 3.4.4
### New Features
 - remove `capacitor-codepush` as it is not used anymore

# 3.4.3
### New Features
 - add `hide` function for shepherd
 - properly save data when `select` is `image_selector`
 - properly save `shepherd` when initializing with `trigger_type` equal to `started`

# 3.4.2
### Bugfix
 - #25 - properly load form inputs when the parent is: `alert`, `card`, `conditionalContainer`, `container` or `refContainer`
 - #28 - merge the survey data. The default value is kept if not set by the user.

# 3.4.1
 - properly open button url with `mailto`. Ex: `mailto:someone@example.com?subject=Your%20Subject&amp;body=Your%20message%20here`

# 3.4.0
 - update to Capacitor 6

# 3.3.1
 - save voice records in format: `audio/aac`

# 3.3.0
 - add survey-js voice record
 - add [capacitor-voice-recorder](https://github.com/tchvu3/capacitor-voice-recorder)
 - add video capture request
 - #21 - properly set dark or light theme for SurveyJS based on the system

# 3.2.14 Requires SelfHelp v7.0.0+ for these changes
### New Features
 - add style `entryRecordDelete`
 - use `height` and `width` fields for style `image`

### Bugfix
 - adjust `showUserInput` to work with the adjustments of the user input data
 - rename field `label_continue` to `confirmation_continue` and `label_message` to `confirmation_message` 
 - check if there is a selected `surveyJS` in the style before trying to save
 - properly set credentials when uploading files vie surveyJS

# 3.2.13
### Bugfix
 - fix duplication entries for surveys

# 3.2.12
### Bugfix
 - hide `shepherdJS` when it is not needed
 - #22 - `surveyJS` check if data is saved before going to the next page. If not saved show an error message.
 - #22 - `surveyJS` do not keep local state of the data, always use the DB state when the survey is loaded

# 3.2.11
### Bugfix
 - properly handle `shepherdJS` `view_once` functionality
 - properly show HTML entities in `sbAsterChart`
 - use user language for `input` from type `date` and `datetime`

# 3.2.10
### Bugfix
 - fix `logout` and then `login` issue where after the login no content is visible

### New Features
 - on `logout` move to `home`

# 3.2.9
### Bugfix
 - #19 - fix z-index for color input with `shepherdJS`
 - #19 - keyboard disappearing when focusing input with `shepherdJS` - related to [bug](https://github.com/shepherd-pro/shepherd/issues/1143)
 ```
when: {
    show() {
        const vElement = this.getElement();
        if (vElement) vElement.focus = () => { /* Do nothing */ };
    }
}
 ```

# 3.2.8
### New Features
 - add `globals` service for defining variables

### Bugfix
 - always load `home` on app restart

# 3.2.7
### Bugfix
 - #15 - add a check if the notifications are enabled and if they are then we generate the token.
 - update lab.js `css`
 - do not load last page when the app is started. It is awkward.

# 3.2.6
### Bugfix
 - properly keep the last `page` and on start open that page.
 - properly mark the selected menu.

### New Features
 - #13 add support for style `shepherdJS`.

# 3.2.5
### New Features
 - update to angular 17
 - add style `LabJS`
 - load `headless` pages, require SelfHelp `v6.12.1+`
 - #10 - add `htmlTag` style

### Bugfix
 - #12 - load `textareaStyle` properly
 - #5 - properly open mail link from style `link`

# 3.2.4
### Bugfix
 - properly load the password label in style `validation`

# 3.2.3
### Bugfix
 - properly use auto_login when the session expires or on modal url opnening from notification. This was mostly noticible in iOS.

# 3.2.2
### Bugfix
 - when a `child page` link is opened it is properly selected. 

# 3.2.1
### Bugfix
 - properly load `loop` style within `entryList`

# 3.2.0
### New Features
 - add [capacitor-native-settings](https://github.com/RaphaelWoude/capacitor-native-settings) v5.0.1
 - add style `shortcutButton` - open native window
 - add [capacitor/app-launcher](https://capacitorjs.com/docs/apis/app-launcher)
 - add style `openAppButton` - open app based on the configuration, if the app is not installed it opens the installation link if there is one
 - use `initialView`, `headerToolbar_start`, `headerToolbar_center` and `headerToolbar_end` from the config in style `calendar`
 - add `radioStyle` to be load in the basic style
 - add `checkboxStyle`
 - update `survey-angular-ui` from `1.9.109` to `1.9.125`
 - add an option to upload files to the server when uploaded with `survey-js`
 - add `save as pdf` for `survey-js`
 - handle `edit_url` in `card` and show a button on the right side as in the web version
 - handle `custom_style` for style `div`. Adding the customization from `color_background`, `color_border` and `color_text` fields
 - handle field `load_as_table` in style `entryList`
 - add `url_cancel` to `formUserInput`
 - add `confirmation message` functionality to style `button`
 - add `confirmation message` functionality to style `formUserInput`

### Bugfix
 - #2 - fix the validation, `url` is correctly recognized with the capacitor.
 - #3 - properly load localization for `survey-js`
 - [#5](http://phhum-a209-cp.unibe.ch:10012/SLP/plugins/survey-js/issues/5) - do not refresh the survey when end, this way the end message can be seen
 - properly visual the collapsible icon for style `card`. Now the click event is registered when the header of the card is clicked rather than only the icon 

# 3.1.10
 - load `toggle switch` when it is enabled for a input from type `checkbox`

# 3.1.9
 - check field `timeout` in style `surveyJS` and if the time has passed since the survey was started it will start a new survey.
 - collect metadata for `surveyJS`: `start_time`, `end_time`, `duration`, `pages`, `user_agent`, etc.

# 3.1.8
 - disable autofill credentials

# 3.1.7
 - fix HTML codes loading in button label. Now use `innerHTML`

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
