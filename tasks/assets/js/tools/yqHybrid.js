(function () {
  var mhdJSBridge = window.mhdJSBridge;
  var HybridCallBack = {
      name: 'HybridCallBack',
  };
  var HybridUtil = {
      name: 'HybridUtil',
      getQueryParams: function (name, url) {
          if (!url) url = location.href;
          name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
          var regexS = '[\\?&]' + name + '=([^&#]*)';
          var regex = new RegExp(regexS);
          var results = regex.exec(url);
          return results == null ? null : results[1];
      },
      _bridgePostMsg: function (url) {
          if (HybridUtil.getQueryParams('platform') && HybridUtil.getQueryParams('platform') === 'ios') {
              window.location = url;
          } else {
              var iframe = document.createElement('IFRAME');
              iframe.setAttribute('src', url);
              // For some reason we need to set a non-empty size for the iOS6 simulator...
              iframe.setAttribute('height', '1px');
              iframe.setAttribute('width', '1px');
              document.documentElement.appendChild(iframe);
              setTimeout(function () {
                  iframe.parentNode.removeChild(iframe);
                  iframe = null;
              }, 10);
          }
      },
      _getHybridUrl: function (params) {
          var paramStr = '', url = 'jsbridge://';
          url += params.action + '?t=' + Date.now(); //闁哄啫鐖煎Λ鍧楀箣缁涘湱绀夐梻鍐ㄥ级椤掓硢rl濞戞挸绉烽幑锝夊极閿燂拷
          if (params.callback) {
              url += '&callback=' + params.callback;
              delete params.callback;
          }
          if (params.param) {
              paramStr = typeof params.param == 'object' ? JSON.stringify(params.param) : params.param;
              url += '&param=' + encodeURIComponent(paramStr);
          }
          return url;
      },
      _Event: {
          // 闂侇偅淇虹换鍍秐闁规亽鍎辫ぐ娑㈡儎閹存繃鍎斿ù婊冾儎濞嗩晪ventName
          // 濠碘€冲€归悘澶嬬鐎ｂ晜顐絜ventName閻炴凹鍋夎闁告瑦鍩婄槐婵嬪礆濞嗘劕鈷旈悶娑樼暠allback闁搞儳鍋犻惃鐔煎礄閼恒儲娈�
          on: function (eventName, callback) {
              if (!this.handles) {
                  Object.defineProperty(this, 'handles', {
                      value: {},
                      enumerable: false,
                      configurable: true,
                      writable: true
                  });
              }

              this.handles[eventName] = [];
              this.handles[eventName].push(callback);
          },
          // 閻熸瑱绠戣ぐ鍌涚鐎ｂ晜顐� eventName
          emit: function (eventName) {
              //濞达絿濮峰▓鎴炵閿濆洨鍨�
              if (this.handles[arguments[0]]) {
                  for (var i = 0; i < this.handles[arguments[0]].length; i++) {
                      this.handles[arguments[0]][i](arguments[1]);
                  }
              }
          },
          emitTemp: function (params) {
              HybridUtil._Event.emit(params.event, params.data);
          }
      },
      request: function (params) {
          //闁汇垻鍠愰崹姘跺船椤栨瑧顏遍柟绗涘棭鏀介柛鎴ｅГ閺嗙喖鏁嶇仦鎯р挃閻炴稑鑻幃妤呮煥閳ь剙袙閿燂拷
          var tt = Date.now();
          var t = 'hybrid' + tt;
          var tmpFn;

          //ABTEST
          if (window.adhoc && params && params.param && params.param.ABTEST) {
              window.adhoc.increment(params.param.ABTEST, 1);
          }

          //濠㈣泛瀚幃濠囧嫉婢跺﹥绀€閻犲鍟板▓鎴﹀箚閸涱厼鏋�
          if (params.callback && !params.resume) {
              tmpFn = params.callback;
              params.callback = 'window.' + HybridCallBack.name + '.' + t;
              HybridCallBack[t] = function (data) {
                  tmpFn(data);
                  delete HybridCallBack[t];
              };
          }
          HybridUtil._bridgePostMsg(HybridUtil._getHybridUrl(params));
      },
      setUserBehavior: function (params) {
          HybridUtil.request({
              action: 'setUserBehavior',
              param: JSON.stringify({'code': params})
          });
      },
      getUserInfo: function (fn) {
          HybridUtil.request({
              action: 'getUserInfo',
              callback: function (data) {
                  fn && fn(data);
              },
          });
      },
      share: function (params) {
          HybridUtil.request({
              action: 'share',
              param: JSON.stringify(params)
          });
      },
      setBurialPoint: function (params) {
          HybridUtil.request({
              action: 'setBurialPoint',
              param: JSON.stringify(params)
          });
      },
      setBounces: function (flag) {
          HybridUtil.request({
              action: 'setBounces',
              param: JSON.stringify({'enabled': flag})
          });
      },
      pop: function (params) {
          HybridUtil.request({
              action: 'pop',
              param: params,
              resume: true,
              callback: 'window.' + HybridUtil.name + '._Event.emitTemp'
          });
      },
      init: function () {
          window[HybridUtil.name] = HybridUtil;
          window[HybridCallBack.name] = HybridCallBack;
      },
      isNative: function () {
          return !!mhdJSBridge;
      },
      login: function (data) {
          if (!mhdJSBridge) {
              return;
          }
          mhdJSBridge.login(JSON.stringify(data));
      },
      getUserInfo: function () {
          var user = {};
          if (!mhdJSBridge) {
              return user;
          }
          user = JSON.parse(mhdJSBridge.getUserInfo());
          if (!user.userId) {
              user.userId = undefined;
          }
          return user;
      },
      setSensorsUserBehavior: function(params) {
          HybridUtil.request({
              action: 'setSensorsUserBehavior',
              param: params
          })
      },
  };
  if (!window[HybridUtil.name]) {
      HybridUtil.init();
  }
})();