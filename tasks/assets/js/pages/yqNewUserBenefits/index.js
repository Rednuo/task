import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick'
import axios from 'axios'
import "../../tools/api"

import SignUtil from '../../tools/sign'
import * as tools from '../../tools'
import { url } from './config'
import { UserInfo } from './UserInfo'
import { List } from './List'
import { RewardDialog, TaskDialog } from './TaskDialog'
// import VConsole from 'VConsole'
// new VConsole();

class YqNewUserBenefits extends Component {
    constructor(props, context) {
        super(props, context);
        //初始化hybrid api
        HybridUtil.init();
        //初始化FastClick
        if ('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function() {
                FastClick.attach(document.body);
            }, false);
        }

        this.state = {
            token: tools.getQueryParams('taskToken') || "",
            userId: tools.getQueryParams('userid') || "",
            // userId: '207250254',
            tasks:[],
            hideTask:[],
            taskList:[],
            videoTask:[],
            issigned:null,
            threeTasks:[],
            rankList:[],
            taskList1:[],
            taskList2:[],
            taskList3:[],
            beforeTask:null,
            signVideoTask:{},
            taskHistory:[],
            isSignInfo:{},
            signInfo:{},
            accountInfo:{},
            signHistory:[],
            manghe:'',
            isfirst:localStorage.getItem('isfirst'),
            allskus:[],
            progress: {
                width: '0%'
            },
            nextYqNum:null,
            allDays:null,
            currentDay:null,
            tasksStatus:[],
            withDrawListsLength:null,
            rewardDialog: {
                title: '',
                content: '',
                tip:''
            },
            toast:'',

            taskDialog:{
                title: '',
                content: '',
                tip:''
            },
            currentTime:new Date(),
            allFinsished: false
            // isNotification:window.mhdJSBridge&&window.mhdJSBridge.isNotificationEnabled()
        }
    }
    componentWillMount(){
        let self = this;
        if (!self.state.userId) {
            HybridUtil.request({
                action: 'login',
                callback: function(data) {
                    self.setState({
                        userId: data.userId,
                    },()=>{
                        self.init()
                    })
                },
            });
        }else{
            self.init();
        }
    }

    componentDidMount() {

    }
    render() {
        let {toast} = this.state
        return (
            <React.Fragment>
                <UserInfo allskus = {this.state.allskus}
                          allDays = {this.state.allDays}
                          videoTask={this.state.videoTask}
                          nextYqNum = {this.state.nextYqNum}
                          accountInfo={this.state.accountInfo}
                          signHistory={this.state.signHistory}
                          currentDay={this.state.currentDay}
                          rankList={this.state.rankList}
                          isfirst={this.state.isfirst}
                          signVideoTask={this.state.signVideoTask}
                          finishTask={(task, status)=>{return this.finishTask(task, status);}}
                          issigned={this.state.issigned}
                          manghe={this.state.manghe}
                          allFinsished={this.state.allFinsished}
                          onUpdateUser={()=>{this.getYqAccountInfo();}}
                          openRotate={()=>{this.openRotate(1);}}
                          doubleTask={()=>{return this.doubleTask();}}
                          />
                <List
                    taskList={this.state.taskList}
                    userId={this.state.userId}
                    currentDay={this.state.currentDay}
                    accountInfo={this.state.accountInfo}
                    taskHistory={this.state.taskHistory}
                    finishTask={(task, status)=>{return this.finishTask(task, status);}}
                    onUpdateUser={()=>{this.getYqAccountInfo();}}
                    getPhoneBindTaskIsOver={()=>{this.getPhoneBindTaskIsOver();}}
                    tasksStatus={this.state.tasksStatus}
                    allFinsished={this.state.allFinsished}
                    withDrawListsLength={this.state.withDrawListsLength}
                    accountInfo={this.state.accountInfo}
                    threeTasks={this.state.threeTasks}
                    beforeTask={this.state.beforeTask}
                    userId={this.state.userId}
                    finishTask={(task, status)=>{return this.finishTask(task, status);}}
                    isfinishAll={(task, status)=>{return this.isfinishAll(task, status);}}
                    finishBfTask={(task, status)=>{return this.finishBfTask(task, status);}}
                    addBeforeTask={(task, status)=>{return this.addBeforeTask();}}
                    userTaskHistory={()=>{return this.userTaskHistory();}}
                    taskHistory={this.state.taskHistory} onUpdateUser={()=>{this.getYqAccountInfo();}}
                 />
                 <RewardDialog rewardDialog={this.state.rewardDialog}
                            onSure={()=>{
                                this.getYqAccountInfo();
                                this.setState({
                                    rewardDialog: {}
                                });
                            }}
                            onHide={()=>{
                                this.getYqAccountInfo();
                                this.setState({
                                    rewardDialog: {}
                                });
                            }}/>
                 <TaskDialog taskDialog={this.state.taskDialog}
                            onSure={()=>{
                                this.onCashOutClick();
                                this.setState({
                                    taskDialog: {}
                                });
                            }}
                            onHide={()=>{
                                this.getYqAccountInfo();
                                this.setState({
                                    taskDialog: {}
                                });
                            }}/>
                {toast ? <div className="c-toast"><span>{toast}</span></div> : null}
            </React.Fragment>
        );
    }
    init() {
        let self = this;
        self.serverTime();
        self.newUserRank();
        self.openRotate(2);
        self.withDrawList();
        self.isfinishAll();
        self.getYqAccountInfo().then(()=>{
            self.isSigned().then(() => {
                if (!self.state.issigned) {
                    self.fetchTaskList().then(()=>{
                        self.userTaskHistory().then(()=>{
                            self.userSign();
                        });
                    })
                }
            })
            self.fetchTaskList().then(()=>{
                self.userTaskHistory().then(()=>{
                    self.userSign();
                });
            })
        });
        // HybridUtil.setSensorsUserBehavior(`{"event":"TaskCenterVisit","task_center_type":"常规","task_center_source":"${decodeURIComponent(tools.getQueryParams('operationSource'))}"}`);
    }
     // 账户余额
     getYqAccountInfo() {
        let self = this,
            {userId}=this.state;
         return new Promise((resolve)=>{
            axios({
                method: 'POST',
                url: url.welfare.getUserAccountAdInfo + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid: 1,
                    appflag:1,
                    type:7,
                    userid: self.state.userId
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    let accountInfo = SignUtil.unformat(data.data.info);
                    console.log('账户信息');
                    console.log(accountInfo);
                    let currentDay=0;
                    if(accountInfo.newusertime>=172800){
                        currentDay=1
                    }else if(accountInfo.newusertime>=86400){
                        currentDay=2
                    }else{
                        currentDay=3
                    }
                    self.setState({
                        accountInfo: accountInfo,
                        currentDay:currentDay
                    })
                    resolve()
                }
            });
         })

    }
    // 盲盒
    openRotate(type){
        let self = this,
        { userId } = self.state;
        console.log('盲盒');
        axios({
            method: 'POST',
            url: url.welfare.time + self.state.token,
            data: ApiUtil.format({
                projectid: 2,
                appid: 13,
                platformid: 1,
                userid: userId,
                itype:type
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (data) {
            console.log(data);
            if (data.data.code == 200) {//领到奖励
                let info=ApiUtil.unformat(data.data.info);
                self.openRotate(0);
                self.setState({
                    rewardDialog: {
                        title: '恭喜您',
                        content: '+ '+info,
                        tip:''
                    }
                })
            } else{//倒计时
                if(type==1){
                    self.setState({
                        toast:'倒计时结束后，可再次领取哦~'
                    },()=>{
                        setTimeout(()=>{
                            self.setState({
                                toast:''
                            })
                        },1500)
                    })
                }
                if(data.data.code_msg<1){
                    self.setState({
                        manghe:'盲盒'
                    })
                }else{
                    let leftTime=data.data.code_msg;
                    let manghe = self.getDateDiff(Number(leftTime));
                    self.setState({
                        manghe: manghe[0]+":"+manghe[1]+":"+manghe[2]
                    })
                    let timer = setInterval(() => {
                        leftTime-=1;
                        if(leftTime<=0){
                            clearInterval(timer);
                            self.openRotate(0);
                        }
                        let manghe = self.getDateDiff(leftTime);
                        self.setState({
                            manghe: manghe[0]+":"+manghe[1]+":"+manghe[2]
                        })
                    }, 1000);
                }
            }
        })
    }
       // 倒计时
       getDateDiff(timeStamp){
        if(timeStamp<=0){
            timeStamp=0;
        }
        let hourC = parseInt(timeStamp/(60*60)%24),
            minC = parseInt(timeStamp/60%60),
            secondC = parseInt(timeStamp%60);
        return [
            hourC < 10 ? '0'+hourC : ''+hourC,
            minC < 10 ? '0'+minC : ''+minC,
            secondC < 10 ? '0'+secondC : ''+secondC
        ];
    }
    // 排行列表
    newUserRank() {
        let self = this;
        return new Promise((resolve)=>{
            axios({
                method: 'POST',
                url: url.welfare.newUserRank + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid:1,
                    type:7,
                    appflag:1
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    let rankList = SignUtil.unformat(data.data.info);
                    self.setState({
                        rankList:rankList,
                    })
                }
                resolve()
            });
        })
    }
    // 任务列表
    fetchTaskList() {
        let self = this;
        let {userId} = self.state;
        return new Promise((resolve)=>{
            axios({
                method: 'POST',
                url: url.welfare.newUserTasks + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid:1,
                    userid: userId,
                    appflag:1
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    let tasks = SignUtil.unformat(data.data.info).newusertask;
                    let hideTask = SignUtil.unformat(data.data.info).newuserhidetask;
                    let needAvoidAd = window && window.mhdJSBridge && window.mhdJSBridge.needAvoidAd && window.mhdJSBridge.needAvoidAd();
                    if (needAvoidAd) {
                        tasks = tasks.filter((item) => item.jsonvalue != "40040000")
                    }
                    self.setState({
                        tasks:tasks,
                        hideTask:hideTask,

                    })
                }
                resolve()
            });
        })
    }
    userTaskHistory(checkIsAllFinish = false){ //用户任务历史
        let self = this;
        let {tasks,userId,hideTask,currentDay} = self.state;
        return new Promise((resolve)=>{
            axios({
                method: 'POST',
                url: url.welfare.userTasksHistory + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid:1,
                    userid: userId,
                    type:7,
                    appflag:1,
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    let useTaskList = SignUtil.unformat(data.data.info).newusertask;
                    tasks = tasks.map((item) => {
                        let temp = useTaskList.find((hitem) => {
                            return hitem.taskid === item.id
                        })||{}
                        item.countid = temp.countid || 0
                        item.status = temp.status || 0
                        return item
                    });
                    console.log('tasks');
                    console.log(tasks);
                    let videoTask=hideTask.filter((item) => item.jsonvalue == "40190006")[0];
                    hideTask = hideTask.map((item) => {
                        let temp = useTaskList.find((hitem) => {
                            return hitem.taskid === item.id
                        }) || {}
                        item.countid = temp.countid || 0
                        item.status = temp.status || 0
                        return item
                    })
                    let signVideoTask = hideTask.find((task) => {
                        return task.jsonvalue == "40190005"
                    }) || {};
                    let threeTasks=hideTask.filter((item)=>{
                        return item.jsonvalue == '40180000'
                    }).sort((a,b)=> a.taskorder-b.taskorder)
                        .map((item, index) => {
                            let filterTasks = tasks.filter((item) => {
                                return item.jsonvalue.slice(4) == "0000"||item.jsonvalue.slice(4) == ("000" + (index + 1))
                            });
                            item.alltaskNum=filterTasks.length;
                            item.finishedNum=filterTasks.filter((t)=>{
                                return t.status == 6
                            }).length;
                            if ((index+1) == self.state.currentDay&&(item.alltaskNum>item.finishedNum)) {
                                item.threeStatus = 1; // 进行中
                            } else if (item.status == 6) {
                                item.threeStatus = 2; // 已领取
                            } else if ((index+1) == self.state.currentDay&&(item.alltaskNum==item.finishedNum)) {
                                item.threeStatus = 3; // 去领取
                            } else if ((index+1) < self.state.currentDay) {
                                item.threeStatus = 4; // 未完成
                            }
                            return item;
                        });
                    for(let i=0;i<=3;i++){
                        if(i==self.state.currentDay && threeTasks[i].threeStatus==3){
                            self.setState({
                                toast:'任务已完成，请领取礼包哦~',
                                beforeTask:beforeTask
                            },()=>{
                                setTimeout(()=>{
                                    self.setState({
                                        toast:''
                                    })
                                },1500)
                            })
                        }
                    }
                    let taskList = tasks.filter((item) => {
                        return item.jsonvalue.slice(4) == "0000"||item.jsonvalue.slice(4) == ("000" + self.state.currentDay)
                    });
                    console.log('taskList');
                    console.log(taskList);
                    let addStatus = threeTasks && threeTasks[2] && threeTasks[2].threeStatus!==1;
                    localStorage.setItem('addStatus',addStatus);
                    if (threeTasks.filter((item) => {
                        return item.isallfinish
                    }).length == 3) {
                        self.setState({
                            allFinsished: true
                        },()=>{
                            if (checkIsAllFinish) {
                                self.getYqAccountInfo();
                                self.setState({
                                    taskDialog: {
                                        title: '恭喜你',
                                        content: '完成新手任务',
                                        tip: '现在即可获得现金奖励~',
                                        type: 'task'
                                    }
                                })
                            }
                        })
                    }
                    self.setState({
                        threeTasks: threeTasks,
                        videoTask:videoTask,
                        hideTask: hideTask,
                        signVideoTask:signVideoTask,
                        taskList: taskList.sort((a,b)=> a.totalamount - b.totalamount),
                    })
                    resolve()
                }
            }).then(() => {
                self.getPhoneBindTaskIsOver();
                console.log(333333333);
                self.addBeforeTask();
            })
        })
    }
    // 是否已签到
    isSigned() {
        let self = this;
        let {userId,currentDay}=self.state;
        let isSignInfo = null;
        return new Promise((resolve,reject) => {
            axios({
                method: 'POST',
                url: url.welfare.userIsSign + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid:1,
                    first:0,
                    userid: userId,
                    type:5,
                    appflag:1,
                    date: tools.getDate(self.state.currentTime)
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    isSignInfo = SignUtil.unformat(data.data.info);
                    let allskus = isSignInfo.allskus.filter((item) => {
                        return item.skutype === 11
                    });
                    let nextYqNum=null;
                    if(currentDay<2){
                        nextYqNum=allskus[currentDay].calcquantity;
                    }else{
                        nextYqNum=allskus[3].calcquantity; //需要接口提供
                    }
                    self.setState({
                        allskus: allskus,
                        nextYqNum:nextYqNum,
                        currentDay:currentDay,
                        issigned:isSignInfo.issigned
                    })
                    resolve()
                }
            }).then(()=>{
                return new Promise((resolve,reject) => {
                    self.getSignHistory();
                    resolve();
                })
            });
        })
    }
    // 签到历史
    getSignHistory() {
        let self = this;
        return new Promise((resolve,reject) => {
            axios({
                method: 'POST',
                url: url.welfare.getSignHistory + self.state.token + '&date=' + tools.getDate(self.state.currentTime),
                data: SignUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid:1,
                    userid: self.state.userId,
                    type:7,
                    appflag:1,
                    date: tools.getDate(self.state.currentTime)
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    let allDays = 0
                    let signHistory = SignUtil.unformat(data.data.info).map((item) => {
                        item.SignTime = item.SignTime.substring(0,10);
                        return item
                    });
                    let allskus = self.state.allskus.map((item) => {
                        item.date = tools.getDate(new Date(self.state.currentTime.getTime() + (item.day - self.state.currentDay)*1000*60*60*24))
                        return item
                    }).map((item) => {
                        let temp = signHistory.find((sign) => {
                            return sign.SignTime == item.date
                        })
                        if (temp) {
                            item.signed = true;
                            allDays++;
                        } else if (item.day < self.state.currentDay) {
                            allDays = 0;
                            item.badge = true
                        }
                        return item
                    })
                    self.setState({
                        allskus: allskus,
                        allDays:allDays,
                    }, ()=> {
                        resolve()
                    })
                }
            });
        })
    }
    //服务器时间
    serverTime(){
        let self = this;
        axios.get(url.welfare.getServerTime + '&t=' + new Date().getTime()).then((res) => {
            if (res.data.code == 200) {
                let info = SignUtil.unformat(res.data.info);
                let time=new Date(info*1000);
                    let d = time.getDate();
                    let before=localStorage.getItem('beforedate');
                    if(before==d){
                        localStorage.setItem('isfirst',true);
                    }else{
                        localStorage.setItem('isfirst',true);
                    }
                    localStorage.setItem('beforedate',d);
                self.setState({
                    currentTime: new Date(info * 1000),
                })
            }
        })
    }
    // 签到
    userSign(date = this.state.currentTime) {
        let self = this,
            {userId,hideTask}=self.state;
            console.log('hideTask');
            console.log(hideTask);
        return new Promise((resolve)=>{
            axios({
                method: 'POST',
                url: url.welfare.userSign + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid:1,
                    userid: userId,
                    type:7,
                    date: tools.getDate(self.state.currentTime)
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    let info = SignUtil.unformat(data.data.info);
                    let task = hideTask.find((task) => {
                        return task.jsonvalue == "40190005"
                    }) || {};
                    console.log();
                    HybridUtil.request({
                        action: 'sign',
                        param: {
                            "position": "1",
                            "calcquantity": "" + info && info.data && info.data[0] && info.data[0].calcquantity,
                            "bonus": task.status==0?(""+task.skus[0].quantity):"0",
                            "pageType": "videoAd"
                        },
                        callback: function (response) {
                            if (response.result) {
                                if (response.result.status === 'success') {
                                    self.finishTask(task, 4).then(() => {
                                        self.finishTask(task, 6).then(() => {
                                            self.getYqAccountInfo();
                                            self.isSigned();
                                        })
                                    })
                                } else {
                                }
                            }
                        }
                    });
                    self.getYqAccountInfo();
                    self.isSigned();
                }else{
                    console.log('未签到成功');
                }
                resolve();
            });
        })
    }
    // 签到视频
    // signVideo(){
    //     console.log('签到视频');
    //     let {hideTask}=this.state;
    //     let task = hideTask.find((task) => {
    //         return task.jsonvalue == "40190005"
    //     }) || {};
    //     HybridUtil.request({
    //         action: 'sign',
    //         param: {
    //             "position": "1",
    //             // "calcquantity": "" + info && info.data && info.data[0] && info.data[0].calcquantity,
    //             "bonus": task.status==0?(""+task.skus[0].quantity):"0",
    //             "pageType": "videoAd"
    //         },
    //         callback: function (response) {
    //             if (response.result) {
    //                 if (response.result.status === 'success') {
    //                     self.finishTask(task, 4).then(() => {
    //                         self.finishTask(task, 6).then(() => {
    //                             self.getYqAccountInfo();
    //                             self.isSigned();
    //                         })
    //                     })
    //                 } else {
    //                 }
    //             }
    //         }
    //     });
    // }
    doubleTask(){
        let self = this,
            {hideTask}=self.state;
        let task = hideTask.find((task) => {
            return task.jsonvalue == "40190005"
        }) || {};
        HybridUtil.request({
            action: 'sign',
            param: {
                "position": "1",
                "calcquantity": "" + info && info.data && info.data[0] && info.data[0].calcquantity,
                "bonus": task.status==0?(""+task.skus[0].quantity):"0",
                "pageType": "videoAd"
            },
            callback: function (response) {
                if (response.result) {
                    if (response.result.status === 'success') {
                        self.finishTask(task, 4).then(() => {
                            self.finishTask(task, 6).then(() => {
                                self.getYqAccountInfo();
                                self.isSigned();
                            })
                        })
                    } else {
                    }
                }
            }
        });

    }
    finishTask(task, status = 6) {
        let self = this,
            { userId } = self.state;
        return new Promise((resolve,reject) => {
            axios({
                method: 'POST',
                url: url.welfare.finishTask + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    platformid: 1,
                    appid: 13,
                    taskid: task.id,
                    tasktype: task.type,
                    jsonvalue: task.jsonvalue,
                    status,
                    userId
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                console.log(data)
                if (data.data.code == 200) {
                    if (status == 6) {
                        let info = SignUtil.unformat(data.data.info);
                        self.setState({
                            rewardDialog: {
                                title: '任务完成',
                                content: '+'+info[0].quantity
                            }
                        })
                    }
                    self.userTaskHistory();
                    resolve()
                } else {
                }
            })
        })
    }
    finishBfTask(task, status = 6) {
        let self = this,
            { userId } = self.state;
        return new Promise((resolve,reject) => {
            axios({
                method: 'POST',
                url: url.welfare.finishTask + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    platformid: 1,
                    appid: 13,
                    taskid: task.id,
                    tasktype: task.type,
                    jsonvalue: task.jsonvalue,
                    status,
                    userId,
                    date:task.date
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                console.log(data)
                if (data.data.code == 200) {
                    if (status == 6) {
                        let info = SignUtil.unformat(data.data.info);
                        self.setState({
                            rewardDialog: {
                                title: '任务完成',
                                content: info[0].quantity
                            }
                        })
                    }
                    self.userTaskHistory();
                    resolve()
                } else {
                }
            })
        })
    }
    openVideo(){
        let self = this;
        HybridUtil.request({
            action: 'openVideoAd',
            param: {
                "pageType": "videoAd"
            },
            callback: function (response) {
                if (response.result) {
                    if (response.result.status === 'success') {
                        self.finishTask(task, 6)
                    } else if (response.result.status == 'fail'){
                        alert('该时间段奖励已发放完毕，请十分钟后再来,谢谢！')
                    }
                }
            }
        });
    }
     //提币历史

     isfinishAll() {
        let self = this,
            { userId } = self.state;
        return new Promise((resolve,reject) => {
            axios({
                method: 'POST',
                url: url.welfare.isAllOver + self.state.token,
                data: ApiUtil.format({
                    projectid: 2,
                    appid: 13,
                    platformid: 1,
                    userid: userId
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    let info=SignUtil.unformat(data.data.info);
                    if(info){
                        self.setState({
                            taskDialog: {
                                title: '恭喜您',
                                content: '完成新手任务',
                                tip:'现在即可获得现金奖励~'
                            }
                       })
                    }
                    resolve()
                } else {
                }
            })
        })
    }
    withDrawList() {
        let self = this,
        {userId}=self.state;
        axios({
            method: 'POST',
            url: url.welfare.withdrawList,
            data: ApiUtil.format({
                userid: userId,
                pageindex:1,
                pagesize:10,
                projectid: 2,
                appid: 13,
                platformid: 1,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (data) {
            if (data.data.code == 200) {
                if (data.data.info) {
                    let withDrawListsLength = JSON.parse(ApiUtil.unformat(data.data.info)).length;
                    self.setState({
                        withDrawListsLength:withDrawListsLength
                    })
                }else{
                    self.setState({
                        withDrawListsLength:0
                    })
                }
            }
        });
    }
    // 未完成
    addBeforeTask(){
        let self = this,
        { userId,threeTasks,withDrawListsLength } = self.state;
        console.log('threeTasks');
        console.log(threeTasks);
        console.log(threeTasks && threeTasks[2] && threeTasks[2].threeStatus!==1&&withDrawListsLength<1);
        if(threeTasks && threeTasks[2] && threeTasks[2].threeStatus!==1&&withDrawListsLength<1){
        // if(threeTasks && threeTasks[2]){
            axios({
                method: 'POST',
                url: url.welfare.addBeforeTask,
                data: ApiUtil.format({
                    userid: userId,
                    projectid: 2,
                    appid: 13,
                    platformid: 1,
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (data) {
                if (data.data.code == 200) {
                    if (data.data.info) {
                        let beforeTask = JSON.parse(ApiUtil.unformat(data.data.info));
                        console.log(beforeTask);
                        if(beforeTask.length==0){
                            self.setState({
                                toast:'恭喜您完成3天新手任务，已获得新手专享1元提现',
                                beforeTask:beforeTask
                            },()=>{
                                setTimeout(()=>{
                                    self.setState({
                                        toast:''
                                    })
                                },1500)
                            })
                        }else{
                            self.setState({
                                beforeTask:beforeTask
                            })
                        }
                    }
                }
            });
        }

    }
    getPhoneBindTaskIsOver() {
        let self = this;
        return new Promise((resolve,reject) => {
            let task = self.state.taskList.find((item) => {
                return ['2008','2108','2208','40070002'].indexOf(item.jsonvalue) > -1
            })
            if (task) {
                axios({
                    method: 'POST',
                    url: url.welfare.getPhoneBindTaskIsOver + self.state.token,
                    data: SignUtil.format({
                        projectid: 2,
                        platformid: 1,
                        appid: 13,
                        appflag: 1,
                        userid: self.state.userId,
                        taskid: task.id
                    }),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }).then(function (response) {
                    if (response.data.code == 200) {
                        let data = SignUtil.unformat(response.data. info);
                        if (data == 2) {
                            self.finishTask(task, 4).then(()=>{
                                let taskList = self.state.taskList.map((item) => {
                                    if (item.id == task.id) {
                                        item.status = data
                                    }
                                    return item
                                })
                                self.setState({
                                    taskList
                                },() => {
                                    resolve()
                                })
                            })
                        } else {
                            let taskList = self.state.taskList.map((item) => {
                                if (item.id == task.id) {
                                    item.status = data
                                }
                                return item
                            })
                            self.setState({
                                taskList
                            },() => {
                                resolve()
                            })
                        }
                    } else {
                        reject()
                    }
                })
            }
        })
    }
    // 跳转提现
    onCashOutClick(){
        HybridUtil.request({
            action: "jump",
            param: {
                'jumpType':'webview',
                'pageType':'cashOut',
                'title':'兑换 / 提现',
                'link':'http://m.manhuadao.cn/activity/yqPay/withdraw.html?isNewUser=true'
            }
        });
    }
}
ReactDOM.render(
    <YqNewUserBenefits/>,
    document.getElementById('root')
);
