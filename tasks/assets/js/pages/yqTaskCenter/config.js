let ENV = "pro",
    protocol = location.protocol + '//';

let baseUrl = (ENV === "pro") ? protocol + "mhdpay.1391.com" :
    (ENV === "test") ? protocol + "192.168.21.154" : protocol + "localhost:3000";
let payUrl = (ENV === "pro") ? protocol + "pay.manhuadao.cn" :
    (ENV === "test") ? protocol + "192.168.21.154" : protocol + "localhost:3000";

const params = '?apptype=8&appversion=1&channel=web-app&token='
export const url = {
    cdn: protocol + 'statics.zhuishushenqi.com',
    //获取用户账户信息(元气漫画-元气糖)
    GetUserAccountAdInfo: payUrl + '/UserAccount/GetUserAccountAdInfo' + params,
    //1. 获取签到历史记录
    getSignHistory: baseUrl + '/usersign/GetSignHistory' + params,
    //2. 判断用户是否已经签到过
    isSigned: baseUrl + '/usersign/IsSigned' + params,
    //3. 签到
    sign: baseUrl + '/usersign/Sign' + params,
    // 获取连续阅读任务情况
    continuousReading: baseUrl + '/activity/continuousReading' + params,
    //任务：
    //1. 任务列表：
    getTasks: baseUrl + '/Activity/GetTasks' + params,
    //2. 任务完成状态：
    getUserTaskHistory: baseUrl + '/Activity/GetUserTaskHistory' + params,
    //3. 完成任务：
    finishTask: baseUrl + '/Activity/UpdateUserTaskStatus' + params,
    //获取服务器时间：
    getServerTime: baseUrl + '/Config/GetServerTime' + params,
    //获取手机号绑定状态:
    getPhoneBindTaskIsOver: baseUrl + '/Activity/PhoneBindTaskIsOver' + params,
    //任务中心连续阅读提示:
    GetConfigByKey: baseUrl + '/Config/GetConfigByKey' + params,
    // 排行
    newUserRank: baseUrl + '/Activity/GetAsessRecode'+ params,
    // 盲盒
    time:baseUrl+'/UserAdExchange/BlindBoxGetAD' + params,
}
