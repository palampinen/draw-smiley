# Smileys

Smiley drawing tool and feed.

Try it in [smileys.top](http://smileys.top)

![Smileys](https://raw.githubusercontent.com/palampinen/draw-smiley/master/smiley-screenshot.png)

## Development

```bash
git clone https://github.com/palampinen/draw-smiley.git
cd draw-smiley
npm install -g ionic@1.4.0
npm install
```

### Firebase setup

Create Firebase account in https://firebase.google.com/

Create new Firebase project in https://console.firebase.google.com/

Go to Database in your new project and set rules to

```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Go to Storage page and set rules to

```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write;
    }
  }
}
```

```bash
cp www/config.example.js www/config.js
```

Fill www/config.js with your Firebase credentials that are found in Firebase
Console > Project Overview > Add Firebase to your webapp

```bash
ionic serve
```

### Firebase deploy

Install Firebase CLI https://github.com/firebase/firebase-tools

In your project root

```bash
firebase login
```

```bash
firebase init
```

* Choose `Database & Hosting`
* Configure as a single-page app `Yes`
* Set `www` to public directory
* overwrite index.html `No`

```bash
firebase deploy
```

App is now deployed to [your-app-name].firebaseapp.com

## Tech

* UI [Ionic Framework](http://ionicframework.com/) and Angular1.

* Firebase as database and for hosting

* Drawing [sketch.js](http://intridea.github.io/sketch.js/)

## Licence

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
