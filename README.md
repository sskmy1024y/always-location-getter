# Always Get Loaction App

定期的に（常に）位置情報を取得するやばいアプリ

# require

* npm
* cordova

```bash
$ brew install carthage
$ gem install xcodeproj
```

## How to setup
```bash
$ cordova prepare --force
$ npm install
```

### Fix
fix plugin `plugins/cordova-plugin-carthage-support/scripts/modify_pbxproj.js`
```js
+ var semver = require("semver)
...
- var semver = context.requireCordovaModule("semver")
```
