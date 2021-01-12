function getQueryParams(name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}

export const HybridApi = {
    _bridgePostMsg: function(url) {
        console.log(decodeURIComponent(url))
        /*if (getQueryParams('platform') && getQueryParams('platform')==='ios') {
            setTimeout(function(){
                window.location = url;
            },10)
        } else {
            var iframe = document.createElement("IFRAME");
            iframe.setAttribute("src", url);
            iframe.setAttribute("style", 'display:none');
            // For some reason we need to set a non-empty size for the iOS6 simulator...
            iframe.setAttribute("height", "1px");
            iframe.setAttribute("width", "1px");
            document.documentElement.appendChild(iframe);
            setTimeout(function(){
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            },10)
        }*/

        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", url);
        iframe.setAttribute("style", 'display:none');
        // For some reason we need to set a non-empty size for the iOS6 simulator...
        iframe.setAttribute("height", "1px");
        iframe.setAttribute("width", "1px");
        document.documentElement.appendChild(iframe);
        setTimeout(function() {
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        }, 10)

    },
    _getHybridUrl: function(params) {
        var k, paramStr = '',
            url = 'jsbridge://';
        url += params.action + '?t=' + new Date().getTime(); //时间戳，防止url不起效
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
        // 通过on接口监听事件eventName
        // 如果事件eventName被触发，则执行callback回调函数
        on: function(eventName, callback) {
            //你的代码
            if (!this.handles) {
                //this.handles={};
                Object.defineProperty(this, "handles", {
                    value: {},
                    enumerable: false,
                    configurable: true,
                    writable: true
                })
            }

            if (!this.handles[eventName]) {
                this.handles[eventName] = [];
            }
            this.handles[eventName].push(callback);
        },
        // 触发事件 eventName
        emit: function(eventName) {
            //你的代码
            if (this.handles[arguments[0]]) {
                for (var i = 0; i < this.handles[arguments[0]].length; i++) {
                    this.handles[arguments[0]][i](arguments[1]);
                }
            }
        },
        emitTemp: function(params) {
            HybridApi._Event.emit(params.event, params.data)
        }
    },
    request: function(params) {
        var self = this;
        //生成唯一执行函数，执行后销毁
        var tt = (new Date().getTime());
        var t = 'hybrid' + tt;
        var tmpFn;

        //统计点击跳转动作
        if (params && params.param) {
            if (params.param.jumpType === 'native' || params.param.jumpType === 'webview') {
                window.REDIRECTCLICKCOUNT = window.REDIRECTCLICKCOUNT ? window.REDIRECTCLICKCOUNT + 1 : 1;
            }
        }

        //友盟埋点
        if (params && params.param && params.param.umeng) {
            let temp = params.param.umeng.split('-');
            window._czc && window._czc.push(["_trackEvent", ...temp]);
        }

        //处理有回调的情况
        if (params.callback && !params.resume) {
            tmpFn = params.callback;
            params.callback = 'window.HybridCallBack.' + t;
            window.HybridCallBack[t] = function(data) {
                tmpFn(data);
                // delete window.HybridCallBack[t];
            }
        }
        self._bridgePostMsg(self._getHybridUrl(params));
    },
    setUserBehavior: function(params) {
        var self = this;
        self.request({
            action: 'setUserBehavior',
            param: JSON.stringify({ "code": decodeURIComponent(params) })
        })
    },
    publicUpLoadExposure: function( value ){
        try{
            /*
                默认书籍曝光, RESOURCEBIT开头为资源位曝光
            */
            /*
                书籍曝光
                56fdfeba93abbf1f4738fcd4##女总裁的全能兵王##书城##男频精选##畅销精选##-1##5##false##-1##-1
                return {
                    "book_id":"${item._id}",
                    "book_name":"${item.title}",
                    "is_vip_book":false,
                    "is_finish_book":false,
                    "is_freeread_book":false,
                    "exposure_category1":"书城",
                    "exposure_category2":"${codeAlias}",
                    "exposure_category3":"${data.title}",
                    "exposure_categry4":"",
                    "exposure_index":"${index+1}",
                    "exposure_ismore":false,
                    "booklist_id":"",
                    "booklist_name":""
                }
            */
            /*
                资源位曝光
                RESOURCEBIT##书城可配置跳转的广告位节点##书籍详情##c-bookdetail##5721d80d843a87e12703f469##最强升级系统
                return {
                    activity_category1:'书城可配置跳转的广告位节点',
                    dest_name:'书籍详情',
                    dest_key:'c-bookdetail',
                    dest_id:'5721d80d843a87e12703f469',
                    activity_name:'最强升级系统'
                }
            */
            function filterParams( params ){
                let temp = params.split('##'),
                    result = {};
                if( temp[0] === 'RESOURCEBIT' ){
                    result = {
                        activity_category1:temp[1],
                        dest_name:temp[2],
                        dest_key:temp[3],
                        dest_id:temp[4],
                        activity_name:temp[5]
                    }
                }else{
                    result = {
                        "book_id":temp[0],
                        "book_name":temp[1],
                        "is_vip_book":temp[2],
                        "is_finish_book":temp[3],
                        "is_freeread_book":temp[4],
                        "exposure_category1":temp[5],
                        "exposure_category2":temp[6],
                        "exposure_category3":temp[7],
                        "exposure_categry4":temp[8],
                        "exposure_index":temp[9],
                        "exposure_ismore":temp[10],
                        "booklist_id":temp[11],
                        "booklist_name":temp[12]
                    }
                }
                return JSON.stringify( result );
            }

            if( getQueryParams('platform')==='android' ){
                value = decodeURIComponent(filterParams(value));
                console.log('Android sensors: ' + value);
                if( value[0] === 'RESOURCEBIT' ){
                    window.ZssqApi && window.ZssqApi.upLoadResourceExposure && window.ZssqApi.upLoadResourceExposure( value );
                }else{
                    window.ZssqApi && window.ZssqApi.upLoadBookExposure && window.ZssqApi.upLoadBookExposure( value );
                }
            }else if( getQueryParams('platform')==='ios' ){
                value = decodeURIComponent(filterParams(value));
                console.log('iOS: sensors' + value);
                if( value[0] === 'RESOURCEBIT' ){
                    window.webkit && window.webkit.messageHandlers.ZssqApi.postMessage({
                      action:'upLoadResourceExposure',
                      value:value
                    })
                }else{
                    window.webkit && window.webkit.messageHandlers.ZssqApi.postMessage({
                      action:'upLoadBookExposure',
                      value:value
                    })
                }
            }
        }catch(error){
            console.error(error)
        }
    },
    setSensorsUserBehavior: function(params) {
        var self = this;
        self.request({
            action: 'setSensorsUserBehavior',
            param: params
        })
    },
    upLoadResourceExposure( value ) {
        if (getQueryParams('platform') === 'android') {
            console.log('Android sensors: ' + value);
            window.ZssqApi && window.ZssqApi.upLoadResourceExposure && window.ZssqApi.upLoadResourceExposure(value);
        } else if (getQueryParams('platform') === 'ios') {
            console.log('ios sensors: ' + value);
            window.webkit && window.webkit.messageHandlers.ZssqApi.postMessage({
                action: 'upLoadResourceExposure',
                value: value
            })
        }
    },
    getUserInfo: function(fn) {
        var self = HybridApi;
        self.request({
            action: 'getUserInfo',
            callback: function(data) {
                fn && fn(data);
            }
        })
    },
    getDeviceInfo: function(fn) {
        var self = this;
        self.request({
            action: 'getDeviceInfo',
            callback: function(data) {
                fn && fn(data);
            }
        })
    },
    share: function(params) {
        var self = HybridApi;
        self.request({
            action: 'share',
            param: JSON.stringify(params)
        })
    },
    setBurialPoint: function(params) {
        var self = HybridApi;
        self.request({
            action: 'setBurialPoint',
            param: JSON.stringify(params)
        })
    },
    setBounces: function(flag) {
        var self = this;
        self.request({
            action: 'setBounces',
            param: JSON.stringify({ "enabled": flag })
        })
    },
    pop: function(params) {
        HybridApi.request({
            action: 'pop',
            resume: true,
            param: params,
            callback: 'HybridApi._Event.emitTemp'
        });
    },
    backEvent: function(params) {
        HybridApi.request({
            action: 'backEvent',
            resume: true,
            param: params,
            callback: 'HybridApi._Event.emitTemp'
        });
    },
    releaseSlide: function(temp) {
        if (getQueryParams('platform') === 'android') {
            window.ZssqAndroidApi && window.ZssqAndroidApi.releaseSlide(temp);
            window.ZssqApi && window.ZssqApi.releaseSlide(temp);
        }
    },
    getUserPreference: function() {
        try {
            let temp = { female: [], male: [], picture: [], press: [] };

            if (getQueryParams('platform') === 'android') {
                if (window.ZssqAndroidApi && window.ZssqAndroidApi.getUserPreference && window.ZssqAndroidApi.getUserPreference() !== '' && window.ZssqAndroidApi.getUserPreference() !== 'null') {
                    temp = JSON.parse(window.ZssqAndroidApi.getUserPreference());
                } else if (window.ZssqApi && window.ZssqApi.getUserPreference && window.ZssqApi.getUserPreference() !== '' && window.ZssqApi.getUserPreference() !== 'null') {
                    temp = JSON.parse(window.ZssqApi.getUserPreference());
                }
            } else if (getQueryParams('platform') === 'ios') {
                if (window.ZssqApi && window.ZssqApi.getUserPreference) {
                    temp = window.ZssqApi.getUserPreference();
                }
            }

            if (temp === '') {
                temp = localStorage.getItem('userPreference') ? JSON.parse(localStorage.getItem('userPreference')) : temp;
            }

            temp = temp['female'].concat(temp['male']).concat(temp['picture']).concat(temp['press']).join(',')

            return temp;

        } catch (error) {
            console.log(error)
        }
    },
    updateUserPreference: function(data) {
        let self = this;
        self.request({
            action: 'updateUserPreference',
            param: JSON.stringify({ "LikeCate": data })
        })
    },
    login: function(fn) {
        var self = this;
        self.request({
            action: 'login',
            callback: function(data) {
                fn && fn(data);
            }
        })
    },
    insertNoInterestBookToAvoidArray: function(id) {
        if (getQueryParams('platform') === 'android') {
            window.ZssqApi && window.ZssqApi.insertNoInterestBookToAvoidArray && window.ZssqApi.insertNoInterestBookToAvoidArray(id);
        }
    },
    copyBoard: function(str, fn) {
        var self = HybridApi;
        self.request({
            action: 'copyBoard',
            param: JSON.stringify({ "copyStr": str }),
            callback: function(data) {
                fn && fn(data);
            }
        })
    },
    init: function() {
        window.HybridApi = HybridApi;
        window.HybridCallBack = window.HybridCallBack || {};
    }
}