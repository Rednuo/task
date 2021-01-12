let ENV = "pro",
    protocol = location.protocol + '//';

// let baseUrl = (ENV === "pro") ? protocol + "mhdpay.1391.com" :
let baseUrl = (ENV === "pro") ? protocol + "mhdpay.1391.com" :
    (ENV === "test") ? protocol + "192.168.21.154" : protocol + "localhost:3000";

// let payUrl = (ENV === "pro") ? protocol + "pay.manhuadao.cn" :
let payUrl = (ENV === "pro") ? protocol + "pay.manhuadao.cn" :
    (ENV === "test") ? protocol + "192.168.21.154" : protocol + "localhost:3000";

const params = '?apptype=8&appversion=1&channel=web-app&token='
export const url = {
    cdn: protocol + 'statics.zhuishushenqi.com',
    welfare: {
        // 所有任务
        newUserTasks: baseUrl + '/Activity/GetTasks'+ params,
        // 排行
        newUserRank: baseUrl + '/Activity/GetAsessRecode'+ params,
        //是否签到信息
        userIsSign: baseUrl + '/usersign/IsSigned'+ params,
        //签到信息
        userSign: baseUrl + '/usersign/Sign'+ params,
        //签到历史
        getSignHistory: baseUrl + '/usersign/GetSignHistory'+ params,
        //获取用户账户信息(元气漫画-元气糖)
        getUserAccountAdInfo: payUrl + '/UserAccount/GetUserAccountAdInfo'+ params,
        // 用户任务完成历史
        userTasksHistory : baseUrl + '/Activity/GetUserTaskHistory'+ params,
        //获取服务器时间：
        getServerTime: baseUrl + '/Config/GetServerTime'+ params,
        //获取任务奖励
        finishTask: baseUrl + '/Activity/UpdateUserTaskStatus'+ params,
        //3天任务是否完成
        isAllOver:baseUrl+'/Activity/IsOverThreeDaysTask'+ params,
        //获取手机号绑定状态:
        getPhoneBindTaskIsOver: baseUrl + '/Activity/PhoneBindTaskIsOver' + params,
        time:baseUrl+'/UserAdExchange/BlindBoxGetAD' + params,
        //提现记录
        withdrawList:baseUrl+'/UserWithdrawal/UserWithdrawalList'+ params,
        // 补任务
        addBeforeTask:baseUrl+'/Activity/ThreeDayIsNotOverTask'+ params,
    }
}
