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
  signup: function(email, password) {
    // create user
    // ref.child('users').child(authData.uid).set({
    //   name: 'phi',
    //   description: 'Hello, world!',
    //   url: 'http://phairy.me',
    // });
  },

  login: function(email, password) {

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
    links: {
      index: function(uid, callback) {
        var links = ref.child('users').child(uid).child('links');

        links.on('value', function(snapshot) {
          console.log(snapshot.val());

          snapshot.forEach(function(link) {
            ref.child('links').child(link.key()).on('value', function(linkSnapshot) {
              var d = linkSnapshot.val();
              d['id'] = linkSnapshot.key();
              d['note'] = link.val().note;
              d['timestamp'] = link.val().timestamp;

              callback(d);
            });
          });
        });
      },
    }
  },
  links: {
    get: function() {

    },
  },
};



