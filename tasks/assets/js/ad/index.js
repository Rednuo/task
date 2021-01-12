require("./index.css");
require('es6-promise').polyfill();
import 'swiper/dist/css/swiper.css';

import axios from 'axios'
import swiper from 'swiper'

const url = {
    cpt: location.protocol + '//b.zhuishushenqi.com/advert_center/cpt_adverts',
    cpm: location.protocol + '//b.zhuishushenqi.com/advert_center/cpm_adverts',
    advertising: {
        token:'9SyECksdaddTmXfosdsADcdas',
        link:'http://ad.1391.com:50214/v1.0.0/h/warehouse/advertising/message/batch/receive'
    },
    advertisingInRealTime: {
        token:'9SyECksdaddTmXfosdsADcdas',
        link:'http://d.1391.com:50216/v1.0.0/h/warehouse/advertising/message/receive'
    }
}

export default class AdSdk{
    constructor( params ) {
        this.data = {
            currentAdType: 'cpt',
            ads:[],
        }
        this.init( params );
    }
    /*
        --- 获取广告 ---
        containerId:'',    广告容器
        userId: '',            用户ID
        platform:'',           平台 1:iOS 2:Android
        device_imei:'',        设备码
        package_name:'',       包名
        channel:'',            渠道
        version:'',            版本号
        package_type:'',       包类型 0:主版本 1:独立版 2:sdk
        position:'',           广告位置

        --- 埋点(公用参数)(见BI文档) ---
        product_line : '',     产品线
        ad_source: '',         广告源
        ad_type: '',           广告位类型

        --- 埋点(实时埋点) ---
        ad_category: '0'        广告类别 0:图片广告 1:横版视频 2:竖版视频
    */
    init( param ){
        let self = this;
        
        self.data = self.extend( self.data, param );

        this.getAdList({
            position:self.data.position,
            subCategoryId:'',
            has_spread_app:'0',
            network_type:'',
            sex:'',
            device_imei:self.data.device_imei,
            channel:self.data.channel,
            package_type:self.data.package_type,
            latitude:'',
            longitude:'',
            app_market:'',
            city:'',
            version:self.data.version,
            product_line:'6', //产品线 1:追书 2:漫画岛 3:开卷 4:免费阅读广告app 5:芒果 6:独立包(此产品先非埋点的产品线)
            package_name:self.data.package_name,
            platform:self.data.platform,
            bookid:'',
            os_version:'',
            device_model:'',
            age:'0',
            categoryId:'',
            userId:self.data.userId,
        })
    }
    extend(destination,source) {
        for(var property in source) {
            destination[property] = source[property]
        }
        return destination
    }
    /*
        bookid 追书id(没有传空)
        position 广告位置
        platform 平台1:iOS2:Android
        package_type 包类型 0主版本1独立版 2 sdk
        package_name 包名
        channel 渠道
        categoryId 分类(没有传空)
        subCategoryId 子分类(没有传空)
        userId 用户id
        product_line 产品线1:追书2:漫画岛3:开卷4：免费阅读广告app 5:芒果 6:独立包
        version 客户端版本[Ios格式：4.011001,Android传versionCode格式：4033]
        app_market 应用市场
        device_imei 设备IMEI
        longitude 经度
        latitude 纬度
        network_type 网络类型
        device_model 手机型号
        os_version 手机系统版本
        sex 性别 ['none','male','female']备用
        age 年龄 [未知传0]
        has_spread_app 是否安装了推广app (0没有 1有)
        city 城市名
    */
    getAdList( param ){
        let self = this;
        self.data.request_time = self.getNowFormatDate();
        return self.getCptAd( param ).then(function( response ){
            if( response.data.ok && response.data.data.adverts.length > 0 ){
                self.data.ad_source = '1000'
                self.data.ads =  response.data.data.adverts;
                self.render();
            }else{
                return self.getCpmAd( param ).then(function( response ){
                    if( response.data.ok && response.data.data.adverts.length > 0 ){
                        self.data.currentAdType = 'cpm';
                        self.data.ad_source = '1001'
                        self.data.ads =  self.filterAds( response.data.data.adverts );
                        if( self.data.ads.length>0 ){
                            self.render();
                        }else{
                            self.clearContainer();
                        }
                    }else{
                        self.clearContainer();
                    }
                })
            }
        })
    }
    getCptAd( param ){
        param.v = new Date().getTime();
        return axios.get( url.cpt, { params:param } );
    }
    getCpmAd( param ){
        param.v = new Date().getTime();
        return axios.get( url.cpm, { params:param } );
    }
    isOverLimitToday( param ){
        let self = this,
            date = self.getNowFormatDate().substr(0,10);

        try{
            if( localStorage.getItem('ADSLIMIT') ){
                let adsLimit = JSON.parse(localStorage.getItem('ADSLIMIT'));
                if( !adsLimit[date] ){
                    adsLimit[date] = {};
                    adsLimit[date][param.id] = 1;
                    localStorage.setItem('ADSLIMIT', JSON.stringify(adsLimit) );
                    return false;
                }else if( !adsLimit[date][param.id] ){
                    adsLimit[date][param.id] = 1;
                    localStorage.setItem('ADSLIMIT', JSON.stringify(adsLimit) );
                    return false;
                }else if( adsLimit[date][param.id] < param.limit){
                    adsLimit[date][param.id] += 1;
                    localStorage.setItem('ADSLIMIT', JSON.stringify(adsLimit) );
                    return false;
                }else{
                    return true;
                }
            }else{
                let temp = {};
                temp[date] = {};
                temp[date][param.id]= 1;
                localStorage.setItem('ADSLIMIT', JSON.stringify(temp) );
                return false;
            }
        }catch(error){
            console.log(error);
            return true;
        }
    }
    filterAds( ads ){
        let self = this,
            temp = [];
        for(let i=0; i<ads.length; i++){
            if( !self.isOverLimitToday({id:ads[i]['advId'], limit:ads[i]['everyoneLimit']}) ){
                temp.push(ads[i])
            }
        }
        return temp;
    }
    clearContainer(){
        let self = this,
            containerElement = document.getElementById(self.data.containerId);
        containerElement.parentNode.removeChild(containerElement);
    }
    uuid() {
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
    getNowFormatDate() {
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
    postAdBehaviorData( param ) {
        try {

            let self = this,
                postData = {
                    "advertisingInfos": [{
                        "product_line": param.product_line || "6",
                        "platform": param.platform || '2',
                        "client_version": "-1",
                        "app_market": "-1",
                        "device_imei": param.device_imei,
                        "device_model": "-1",
                        "longitude": "-1",
                        "latitude": "-1",
                        "os_version": "-1",
                        "network_type": "-1",
                        "user_id": param.userId,
                        "book_id": param.bookId || "-1",
                        "chapter_id": param.chapterId || "-1",
                        "chapter_order_num": param.chapterOrderNumber || "-1",
                        "param1": param.param2 || "-1", //章节阅读时长，单位秒
                        "param2": param.param2 || "-1", //章节属性 1免费章节 2vip收费章节 3单章购买章节
                        "param3": param.param3 || "-1", //模式属性 1 正常模式 2赚钱模式 3 vip章节广告免费看模式 4 全网搜索
                        "param4": param.param4 || "-1",
                        "param5": param.param5 || "-1",
                        "param6": param.param6 || "-1",
                        "ad_infos": [{
                            "ad_opt_num": param.ad_opt_num || "1",
                            "ad_source": param.ad_source || "0",
                            "ad_type": param.ad_type || "-1",
                            "event_id": self.uuid() + '-' + new Date().getTime(), //随机生成且唯一，不能重复
                            "event_type": param.event_type || "1",
                            "log_time": self.getNowFormatDate(),
                            "ad_placeid": param.ad_placeid || "-1",
                            "param1_1": param.param1_1 || "-1",
                            "param1_2": param.param1_2 || "-1",
                            "param1_3": param.param1_3 || "-1",
                            "param1_4": param.param1_4 || "-1"
                        }]
                    }]
                };

            axios.post(url.advertising.link, postData, {
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-AuthToken': url.advertising.token
                }
            }).then((response) => {
                return response
            }).catch(err => {
                console.log('error')
            })

        }catch( error ){
            console.error('advertising somthing is wrong : ' + param)
        }
    }
    postAdBehaviorDataInRealTime( param ) {
        try {

            let self = this,
                postData = {
                        "platform": param.platform || "2",
                        "product_line": param.product_line || "6",
                        "ad_source": param.ad_source || "0",
                        "ad_type": param.ad_type || "-1",
                        "ad_opt_num": param.ad_opt_num || "1",
                        "ad_placeid": param.ad_placeid || "-1",
                        "user_id": param.userId,
                        "book_id": param.bookId || "-1",
                        "chapter_id": param.chapterId || "-1",
                        "chapter_order_num": param.chapterOrderNumber || "-1",
                        "client_ip":"-1",
                        "client_version": "-1",
                        "device_imei": param.device_imei,
                        "device_model": "-1",
                        "event_id": self.uuid() + '-' + new Date().getTime(), //随机生成且唯一，不能重复
                        "event_type": param.event_type || "1",
                        "app_market": "-1",
                        "longitude": "-1",
                        "latitude": "-1",
                        "request_time": self.data.request_time,
                        "post_time": self.getNowFormatDate(),
                        "os_version": "-1",
                        "position_alias": self.data.position,
                        "advert_ownerId":param.advert_ownerId,
                        "plan_id": param.plan_id,
                        "ad_category": param.ad_category || '0',
                        "video_play_time":"-1",
                        "network_type": "-1",
                        "log_time": self.getNowFormatDate(),
                        "param1": param.param1 || "-1", //章节阅读时长，单位秒
                        "param2": param.param2 || "-1", //章节属性 1免费章节 2vip收费章节 3单章购买章节
                        "param3": param.param3 || "-1", //模式属性 1 正常模式 2赚钱模式 3 vip章节广告免费看模式 4 全网搜索
                        "param4": param.param4 || "-1",
                        "param5": param.param5 || "-1",
                        "param6": param.param6 || "-1",
                };

            axios.post(url.advertisingInRealTime.link, postData, {
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-AuthToken': url.advertisingInRealTime.token
                }
            }).then((response) => {
                return response
            }).catch(err => {
                console.log('error')
            })

        }catch( error ){
            console.error('advertisingInRealTime somthing is wrong : ' + param)
        }
    }
    doClick( param ){
        let self = this;
        self.postAdBehaviorData({
            platform: self.data.platform,
            product_line : self.data.product_line,
            device_imei : self.data.device_imei,
            userId: self.data.userId,
            ad_source: self.data.ad_source,
            ad_type: self.data.ad_type,
            event_type: 2,
            ad_placeid: param.ad_placeid,
            param1_2:`${param.title}|${encodeURIComponent(param.url)}|0`
        })
        if( self.data.currentAdType === 'cpm' ){
            self.postAdBehaviorDataInRealTime({
                platform: self.data.platform,
                product_line : self.data.product_line,
                device_imei : self.data.device_imei,
                userId: self.data.userId,
                ad_source: self.data.ad_source,
                ad_type: self.data.ad_type,
                event_type: 2,
                ad_placeid: param.ad_placeid,
                advert_ownerId:param.advert_ownerId,
                plan_id: param.plan_id,
                ad_category: self.data.ad_category,
            })
        }
    }
    doExposure( param ){
        let self = this;
        self.postAdBehaviorData({
            platform: self.data.platform,
            product_line : self.data.product_line,
            device_imei : self.data.device_imei,
            userId: self.data.userId,
            ad_source: self.data.ad_source,
            ad_type: self.data.ad_type,
            event_type: 1,
            ad_placeid: param.ad_placeid,
            param1_2:`${param.title}|${encodeURIComponent(param.url)}|0`
        })
        if( self.data.currentAdType === 'cpm' ){
            self.postAdBehaviorDataInRealTime({
                platform: self.data.platform,
                product_line : self.data.product_line,
                device_imei : self.data.device_imei,
                userId: self.data.userId,
                ad_source: self.data.ad_source,
                ad_type: self.data.ad_type,
                event_type: 1,
                ad_placeid: param.ad_placeid,
                advert_ownerId:param.advert_ownerId,
                plan_id: param.plan_id,
                ad_category: self.data.ad_category,
            })
        }
    }
    doExposureQueue(){
        let self = this,
            ads = self.data.ads;
        for(let i=0; i<ads.length; i++){
            self.doExposure({
                ad_placeid:ads[i]['advId'],
                title:ads[i]['title'],
                url:ads[i]['url'],
                advert_ownerId: ads[i]['advertOwnerId'] ? ads[i]['advertOwnerId'] : '-1',
                plan_id: ads[i]['planId'] ? ads[i]['planId'] : '-1',
            })
        }
    }
    render(){
        this.renderBannerAd();
    }
    renderBannerAd( data ){
        let self = this,
            container = self.data.containerId,
            ads = self.data.ads,
            element = `<div class="swiper-container ad-container" id="J_ad_${self.data.containerId}">
                            <div class="swiper-wrapper">`;

        if( this.data.ads.length ){
            for(let i=0; i<ads.length; i++){
                element += `<div class="swiper-slide"><img src="${ads[i]['img']}" alt="" /></div>`;
            }

            element += `</div>
                    ${ads.length>1?'<div class="swiper-pagination"></div>':null}
                </div>`;

            document.getElementById(container).innerHTML = element;

            new Swiper(`#J_ad_${self.data.containerId}`, {
                autoplay: 3000,
                loop: ads.length>1,
                pagination : '.swiper-pagination',
                onInit: function(swiper){
                    self.doExposureQueue();
                    self.data.onInit && self.data.onInit();
                },
                onTap: function( swiper ){
                    self.doClick({
                        ad_placeid:self.data.ads[swiper.realIndex]['advId'],
                        title:self.data.ads[swiper.realIndex]['title'],
                        url:self.data.ads[swiper.realIndex]['url'],
                        ad_placeid:self.data.ads[swiper.realIndex]['advId'],
                        advert_ownerId: self.data.ads[swiper.realIndex]['advertOwnerId'] ? self.data.ads[swiper.realIndex]['advertOwnerId'] : '-1',
                        plan_id: self.data.ads[swiper.realIndex]['planId'] ? self.data.ads[swiper.realIndex]['planId'] : '-1',
                    });
                    self.data.onClick({
                        ad:self.data.ads[swiper.realIndex],
                        swiper:swiper
                    })
                },
                onSlideChangeEnd( swiper){

                }
            },);
        }else{
            console.log('null ad')
        }
    }
}