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