// 存在チェック
if (String.prototype.format == undefined) {  
  /**
   * フォーマット関数
   */
  String.prototype.format = function(arg)
  {
    // 置換ファンク
    var rep_fn = undefined;
    // オブジェクトの場合
    if (typeof arg == "object") {
      rep_fn = function(m, k) { return arg[k]; }
    }
    // 複数引数だった場合
    else {
      var args = arguments;
      rep_fn = function(m, k) { return args[ parseInt(k) ]; }
    }
    return this.replace( /\{(\w+)\}/g, rep_fn );
  }
}

var getTitle = function(url, callback) {
  var END_POINT = 'http://query.yahooapis.com/v1/public/yql';
  
  $.ajax({
    type: 'GET',
    url: END_POINT,
    dataType: 'jsonp',
    data: {
      q: 'select * from html where url="{0}" and xpath = "//title | //meta[@name=\'description\']"'.format(url),
      format: 'json'
    },
    success: function(data) {
      callback && callback(data.query.results);
    },
  });
};



var ref = new Firebase("https://orenobukuma.firebaseio.com/");

var db = {
  signup: function(email, password, callback) {
    ref.createUser({
      email: email,
      password: password,
    }, function(error, authData) {
      if (error) {
        switch (error.code) {
          case 'EMAIL_TOKEN':
            console.log("The new user account cannot be created because the email is already in use.");
            break;
          case 'INVALID_EMAIL' :
            console.log("The specified email is not a valid email.");
            break;
          default :
            console.log("Error creating user:", error);
        }
      }
      else {
        console.log("Successfully created user account with uid:", authData.uid);

        // login
        ref.authWithPassword({
          email: email,
          password: password,
        }, function(error, authData) {
          db.users.post(authData.uid, 'hoge', 'text text text text', callback(authData));
        });
      }
    });
  },

  login: function(email, password) {
    ref.authWithPassword({
      email: this.email.value,
      password: this.password.value,
    }, function(error, authData) {
      window.authData = authData;
      riot.route('home');
    });
  },

  twitterLogin: function(callback) {
    ref.authWithOAuthPopup("twitter", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        window.authData = authData;

        var userRef = ref.child('users').child(authData.uid).on('value', function(snapshot) {
          if (snapshot.exists()) {
            callback(authData);
          }
          else {
            // create user
            var name = authData.twitter.username;
            var description = authData.twitter.cachedUserProfile.description;
            db.users.post(authData.uid, name, description, function() {
              callback(authData);
            });
          }
        });
      }
    });
  },

  logout: function() {
    window.authData = null;
    ref.unauth();
  },

  isLogin: function(callback) {
    ref.onAuth(function(authData) {
      callback(authData);
    });
  },

  users: {
    post: function(uid, name, description, callback) {
      var userRef = ref.child('users').child(uid);

      userRef.set({
        name: name,
        description: description,
      }, callback || function() {
        console.log('success');
      });
    },

    links: {
      index: function(uid, callback) {
        var links = ref.child('users').child(uid).child('links');
        var ps = [];

        links.once('value', function(snapshot) {
          snapshot.forEach(function(link) {
            var p = new Promise(function(resolve) {
              ref.child('links').child(link.key()).once('value', function(linkSnapshot) {
                var d = linkSnapshot.val();
                d['id'] = linkSnapshot.key();
                d['note'] = link.val().note;
                d['timestamp'] = link.val().timestamp;
                d['tags'] = [
                  {name:'web'},
                  {name:'javascript'},
                ];

                resolve(d);
              });
            });
            ps.push(p);
          });

          Promise.all(ps).then(function(res) {
            callback(res);
          });
        });

      },
      post: function(uid, url, title) {
        var linksRef = ref.child('links');
        var userLinksRef = ref.child('users').child(uid).child('links');

        return new Promise(function(resolve, reject) {
          var link = linksRef.push({
            title: title,
            url: url,
            uid: uid,
            timestamp: Date.now(),
          });

          link.child('users').child(uid).set(true);

          userLinksRef.child(link.key()).set({
            note: 'new memo',
            timestamp: Date.now(),
          }, function() {
            resolve();
          });
        });
      },
      del: function(uid, linkId) {
        var users = ref.child('links').child(linkId).child('users');
        users.child(authData.uid).remove();
        ref.child('users').child(uid).child('links').child(linkId).remove();
      },
    }
  },
  links: {
    index: function() {
      ref.child('links').once('added_child', callback);
    },
  },
};



