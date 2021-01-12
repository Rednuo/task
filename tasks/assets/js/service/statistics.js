require('es6-promise').polyfill();

import * as cache from '../tools/cache';
import { md5 } from '../tools/biMd5'
import Fingerprint2 from 'fingerprintjs2'
import axios from 'axios'


function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = getNewDate(date.getMonth() + 1);
    var day = getNewDate(date.getDate());
    var hours = getNewDate(date.getHours());
    var minutes = getNewDate(date.getMinutes());
    var seconds = getNewDate(date.getSeconds());
    //统一格式为两位数
    function getNewDate(date) {
        if (date <= 9) {
            date = "0" + date;
        }
        return date;
    }

    var currentDate = date.getFullYear() + seperator1 + month + seperator1 + day +
        " " + hours + seperator2 + minutes + seperator2 + seconds;
    return currentDate;
}

function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

function getFingerprint2() {
    return new Promise(function(resolve, reject) {
        if (localStorage.getItem('device_imei')) {
            resolve(localStorage.getItem('device_imei'));
        } else {
            Fingerprint2.get(function(components) {
                let temp = Fingerprint2.x64hash128(components.map(function(pair) { return pair.value }).join(), 31);
                localStorage.setItem('device_imei', temp)
                resolve(temp);
            })
        }
    });
}


const StatisicsService = {
    getToken: function() {
        return getFingerprint2().then(function(data) {

            let userId = localStorage.getItem('userId') || '0000',
                biTokenCache = localStorage.getItem('biTokenCache_'+userId),
                device_imei = data;

            let url = 'https://d.1391.com:50217/v1.0.0/h/warehouse/appevent/get/token?user_id=0000&device_imei=-1&product_line=3&password=123456&sign_type=md5&sign=';
            // let url = 'http://d.1391.com:50210/v1.0.0/h/warehouse/appevent/get/token?user_id=0000&device_imei=-1&product_line=3&password=123456&sign_type=md5&sign=';
            let sign = md5('device_imei=-1&password=123456&product_line=3&token_secret=b988e7f56f9b4d24bed8dc28d0fc5528&user_id=0000');

            if (biTokenCache) {
                return new Promise(function(resolve, reject) {
                    resolve({ 'msg': biTokenCache });
                });
            } else {
                return axios.post(url + sign, {}, {
                    headers: {
                        "Content-Type": "application/json;charset=UTF-8"
                    }
                })
            }

        })
    },
    postForTT: function( param ) {
        
        console.info( param );
        
        let self = this,
            url = 'https://d.1391.com:50217/v1.0.0/h/warehouse/appevent/client/batch/receive?token=',
            // url = 'http://d.1391.com:50210/v1.0.0/h/warehouse/appevent/client/batch/receive?token=',
            userId = localStorage.getItem('userId') || '0000',
            biTokenCache = localStorage.getItem('biTokenCache_'+userId),
            pos_name = localStorage.getItem('pos_name') || 'douyin001';

        getFingerprint2().then((device_imei) => {
            try {
                let fun_type = param.split('|')[0].split('##')[0],
                    pos_id = param.split('|')[0].split('##').length > 1 ? param.split('|')[0].split('##')[1] : '-1',
                    paramArray = param.split('|')[1] ? param.split('|')[1].split('##') : [],
                    param1 = paramArray.length >= 0 ? paramArray[0] : '-1',
                    param2 = paramArray.length >= 1 ? paramArray[1] : '-1',
                    param3 = paramArray.length >= 2 ? paramArray[2] : '-1',
                    param4 = paramArray.length >= 3 ? paramArray[3] : '-1',
                    param5 = paramArray.length >= 4 ? paramArray[4] : '-1',
                    param6 = paramArray.length >= 5 ? paramArray[5] : '-1',
                    param7 = paramArray.length >= 6 ? paramArray[6] : '-1',
                    param8 = paramArray.length >= 7 ? paramArray[7] : '-1';

                let postData = {
                    "product_line": "1",
                    "platform": "16",
                    "event_name": "-1",
                    "client_version": "2.1.0",
                    "app_market": "-1",
                    "device_imei": device_imei,
                    "device_longitude": "-1",
                    "device_latitude": "-1",
                    "network_type": "-1",
                    "device_mac": "-1",
                    "phone_model": "-1",
                    "phone_resolution": "-1",
                    "os_version": "-1",
                    "event_record": [{
                        "user_id": userId,
                        "event_id": uuid() + '-' + new Date().getTime(),
                        "log_time": getNowFormatDate(),
                        "fun_type": fun_type,
                        "pos_id": pos_id,
                        "pos_name": pos_name,
                        "param1": param1,
                        "param2": param2,
                        "param3": param3,
                        "param4": param4,
                        "param5": param5,
                        "param6": param6,
                        "param7": param7,
                        "param8": param8
                    }]
                }

                self.getToken().then(function(data) {

                    data.msg = data.msg || data.data.msg;

                    if (!biTokenCache) {
                        localStorage.setItem('biTokenCache_'+userId, data.msg);
                    }
                    axios.post(url + data.msg + '&timestamp=' + getNowFormatDate(), postData, {
                        headers:{
                            'Accept': 'application/json',
                            'Content-Type': 'application/json;charset=UTF-8'
                        }
                    }).then((response) => {
                        return response
                    }).catch(err => {
                        console.log('error')
                    })
                })
            } catch (e) {
                console.error('bi somthing is wrong : ' + e)
            }
        })
    }
}

export default StatisicsService;