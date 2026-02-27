# Preview Instructions

- Add `https://tpf-test.humdek.unibe.ch` to the exceptions in the cookie settings and allow it to accept third party settings
- Clear site data if you want to select another server
- for local testing add the local IP address to take cookies or localhost, depending on what is used

# Preview Instructions Build

- recommended command (v4_0_0): `npm run build:preview:v4_0_0`
- equivalent direct command: `npx ng build --configuration production --base-href /SelfHelpMobilePreview/v4_0_0/ --deploy-url /SelfHelpMobilePreview/v4_0_0/`
- for other versions, replace `v4_0_0` in both flags with your version folder
- copy the files in folder `SelfHelpMobilePreview` and the `version_number`
- change the `.htaccess` file to match the version, example:
  - `RewriteRule ^(.*) /SelfHelpMobilePreview/v4_0_0/index.html [NC,L]`
- do not open `index.html` directly as `file://...`
  - this causes `Not allowed to load local resource` for JS/CSS chunks
  - always open through a web server URL (`http://` or `https://`)
- important: never use a filesystem path in `--base-href` or `--deploy-url` (for example `C:/Program Files/...`), otherwise Angular writes absolute local paths into `index.html`
