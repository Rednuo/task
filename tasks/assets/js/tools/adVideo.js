import axios from 'axios'

const protocol = location.protocol + '//';
const urls = {
    getConfig: protocol + 'goldcoin.zhuishushenqi.com/tasks/videoConfig',
    getVideoGift: protocol + 'goldcoin.zhuishushenqi.com/tasks/videoAdGift'
}

const getQueryParams = (name, url) => {
    if (!url) url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}

const _getDeviceInfo = function() {
    return new Promise((resolve, reject) => {
        HybridApi.getUserInfo(function(data) {
            let channel = getQueryParams('platform')==='ios'?'ios':data.channel;
            if (data.IMEI) {
                resolve({
                    'deviceId':data.IMEI,
                    'channel':channel
                });
            } else {
                HybridApi.getDeviceInfo(function(data) {
                    resolve({
                        'deviceId':data.deviceId,
                        'channel':channel
                    });
                })
            }
        })
    })
}

const _getConfig = function() {
    const self = this,
        {version, adType, token } = self._initParams;
 
    return (window.zssqDeviceInfo || _getDeviceInfo()).then((data) => {
        return axios.get(`${urls.getConfig}?token=${token}&adType=${adType}&channel=${data.channel}&version=${version}&app=free`, {
            headers: {
                'x-device-id': data.deviceId||data.deviceIMEI
            }
        }).then(response=>{
            self._initParams.giftConfig = response.data.videoGiftConfig;
            return response.data;
        })
    })
}

const _getVideoGift = function(nativeResult) {
    const { version, adType, token } = this._initParams;
    return axios.post(urls.getVideoGift,`version=${version}&adType=${adType}&token=${token}&data=${encodeURIComponent(nativeResult.msg)}&deviceId=${nativeResult.imei}`,{
        headers: {
            'x-device-id': nativeResult.imei
        }
    }).then((response)=>{
            return response.data;
    })
}

export default class ADVideo {
    constructor(param = { version:'3', adType: 'taskCenter', token: '' }) {
        this._initParams = param;
        this._configPromise = _getConfig.call(this);
    }
    onInitCallback(callback) {
        this._configPromise.then(callback);
    }
    onPlayDoneCallback(func) {
        if (!this.playDoneFnQueue) {
            this.playDoneFnQueue = [];
        }
        this.playDoneFnQueue.push(func);
    }
    playVideo() {
        const self = this;
        HybridApi.request({
            action: 'openVideoAd',
            param: {
                "jumpType": "native",
                "pageType": "videoAd"
            },
            callback: function(response){
                let delay = getQueryParams('platform')==='ios'?100:0;
                if (response.result.status === 'success') {
                    setTimeout(function(){
                        _getVideoGift.call(self, response.result).then((data) => {
                            for (let i = 0; self.playDoneFnQueue && i < self.playDoneFnQueue.length; i++) {
                                self.playDoneFnQueue[i](data)
                            }
                        })
                    }, delay)
                } else if (response.result.status === 'reset') {

                } else if(response.result.status === 'fail'){
                    var errorMsg = (response.result.msg||'')+(response.result.code?' errorCode:'+response.result.code:'');
                    alert(errorMsg || '加载失败，请重试（海外地区暂不支持使用激励视频功能，感谢您的支持与理解。）');
                }
            }
        });
    }
}