var ENV = {
  FIREBASE_API_KEY: 'your-firebase-api-key',
  FIREBASE_AUTH_DOMAIN: '[your-app].firebaseapp.com',
  FIREBASE_DATABASE_URL: 'https://[your-app].firebaseio.com'
};

// Angular config
angular.module('config', [])
.constant('CONFIG', {
  fbRoot: '' // Optionally set app database root, eg. 'v1'
})
