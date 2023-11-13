# Preview Instructions

- Add `https://tpf-test.humdek.unibe.ch` to the exceptions in the cookie settings and allow it to accept third party settings
- Clear site data if you want to select another server
- for local testing add the local IP address to take cookies or localhost, depending on what is used

# Preview Instructions Build

- run command: `ng build --base-href "/SelfHelpMobilePreview/v3_0_0/" --deploy-url "/SelfHelpMobilePreview/v3_0_0/"` for the version number you want.
- copy the files in folder `SelfHelpMobilePreview` and the `version_number`
- change the `.htaccess` file `RewriteRule ^(.*) /SelfHelpMobilePreview/v3_0_0/index.html [NC,L]` to much the version
