angular.module('smileyApp.services', [])


/**
 * Service that returns smilies data from Firebase.
 */
.factory('Smiley', function($firebaseArray, CONFIG) {
  var ref = firebase.database().ref(CONFIG.fbRoot);
  // Add three-way data binding
  return $firebaseArray(ref);
})

.factory('SmileyService', function($firebaseArray, $firebaseObject, CONFIG) {
  var ref = firebase.database().ref(CONFIG.fbRoot);

  // Add three-way data binding
  return {
    load: function(limit) {
      var query = ref.orderByChild('added').limitToLast(limit);
      return $firebaseArray(query);
    },
    get: function(id){
      var query = ref.child(id)
      return $firebaseObject(query);
    },
    findByUser: function(userName) {
      var query = ref.orderByChild('nick').equalTo(userName);
      return $firebaseArray(query);
    },
    remove: function(item) {
      return item.$remove();
    }
  }
})

.factory('SmileyStorage', function() {
  var ref = firebase.storage().ref();

  return {
    uploadDataUrl: function(file) {
      return ref.child('images/' + file.name).putString(file.data, 'data_url');
    }
  };

})

.factory('User', function() {
  var prefix = 'smileyApp-'
  return {
    get: function() {
      if (localStorage.getItem(prefix+'name') == null) {
        return '';
      }

      return localStorage.getItem(prefix+'name');
    },
    save: function(name) {
      // Simple index lookup
      return localStorage.setItem(prefix+'name', name);
    },
    lastChecked: function() { // with refresh
      var tmp =  localStorage.getItem(prefix+'lasttime-checked');
      if(!tmp) {
        tmp = 0;
      }
      localStorage.setItem(prefix+'lasttime-checked',new Date().getTime());
      return tmp;
    },
    last: function() {  // without refresh
       var tmp =  localStorage.getItem(prefix+'lasttime-checked');
       if(!tmp)
        return 0;
       return tmp;
    },
    getSetting: function(key) {
      return !!localStorage.getItem(prefix+key);
    },
    setSetting: function(key, value) {
      if (value) {
        localStorage.setItem(prefix+key, value);
      } else {
        localStorage.removeItem(prefix+key);
      }
    },
    getCompactMode: function() {
      return this.getSetting('compact')
    },
    setCompactMode: function(compact) {
      this.setSetting('compact', compact)
    },
    getShowDatesMode: function() {
      return this.getSetting('showDates')
    },
    setShowDatesMode: function(value) {
      this.setSetting('showDates', value)
    },
  }

})

.factory('Helpers', function() {
  return {
    getTimeAgo: function(ago) {
      if (!ago) {
        return '';
      }

      var day = 60 * 24;
      var diffInMinutes = (new Date().getTime() - ago) / 60000; // minutes
      var diffInDays = diffInMinutes / day; // days

      var agoFormat = 'ddd HH:mm';
      if (diffInDays > 2) {
        agoFormat = 'ddd D.M. HH:mm'
      }

      return moment(ago).format(agoFormat);
    },
    debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    composeFileName: function(time, userName) {
      var formattedUserName = userName.replace(/ /g, '-');
      return 'smiley-' + formattedUserName + '-' + time + '.png'
    }
  }

})
// background image directive
.directive('backImg', function(){
  return function(scope, element, attrs){
    attrs.$observe('backImg', function(value) {
      element.css({
        'background-image': 'url(' + value +')'
      });
    });
  };
})
