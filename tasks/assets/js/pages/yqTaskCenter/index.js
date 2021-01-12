import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick'
import axios from 'axios'

import * as tools from '../../tools'
import { url } from './config'

import SignUtil from '../../tools/sign'
import { SignIn } from './SignIn'
// import { ContinuousRead } from './ContinuousRead'
import { List } from './List'
import { CommonDialog } from './Dialog'

import StatisicsService from '../../service/statistics'

// import VConsole from 'VConsole'
// new VConsole();


class YQtaskCenter extends Component {
    constructor(state, context) {
        super(state, context);

        //初始化FastClick
        if ('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function() {
                FastClick.attach(document.body);
            }, false);
        }
        HybridUtil.init();
        this.state = {
            token: tools.getQueryParams('taskToken') || "",
            userid: tools.getQueryParams('userid') || "",
            packageName:tools.getQueryParams('packageName'),
            currentTime: new Date(),
            accountInfo: {},
            taskList: [],
            hidetask: [],
            rankList:[],
            videoTask:{},
            taskLoaded: false,
            dialog: {
                title: '',
                content: ''
            }
        }
    }
    componentWillMount(){
        let self = this;
        if (!self.state.userid) {
            HybridUtil.request({
                action: 'login',
                callback: function(data) {
                    self.setState({
                        userid: data.userId,
                    }, () => {
                        self.init();
                    })
                },
            });
        } else {
            self.init();
        }
    }
    init() {
        let self = this;
        self.getServerTime()
        self.getUserAccountAdInfo()
        self.newUserRank()
        self.getTasks().then(() => {
            self.setState({
                taskLoaded: true
            })
        })

        // HybridUtil.setSensorsUserBehavior(`{"event":"TaskCenterVisit","task_center_type":"常规","task_center_source":"${decodeURIComponent(tools.getQueryParams('operationSource'))}"}`);
    }
    componentDidMount() {
    }
    render() {
        return (
            <React.Fragment>
                <SignIn
                    currentTime={this.state.currentTime}
                    userid={this.state.userid}
                    token={this.state.token}
                    accountInfo={this.state.accountInfo}
                    taskList={this.state.taskList}
                    hidetask={this.state.hidetask}
                    videoTask={this.state.videoTask}
                    taskLoaded={this.state.taskLoaded}
                    rankList={this.state.rankList}
                    onUpdateUser={()=>{this.getUserAccountAdInfo();}}
                    finishTask={(task, status)=>{return this.finishTask(task, status);}}
                    getUserTaskHistory={()=>{return this.getUserTaskHistory();}}/>
                <List
                    userid={this.state.userid}
                    token={this.state.token}
                    taskList={this.state.taskList}
                    onUpdateUser={()=>{this.getUserAccountAdInfo();}}
                    finishTask={(task, status)=>{return this.finishTask(task, status);}}
                    getPhoneBindTaskIsOver={()=>{return this.getPhoneBindTaskIsOver();}}
                    currentTime={this.state.currentTime}
                    getUserTaskHistory={()=>{return this.getUserTaskHistory();}}/>
                <CommonDialog
                    dialog={this.state.dialog}
                    onSure={()=>{
                        this.getUserAccountAdInfo();
                        this.setState({
                            dialog: {}
                        });
                    }}
                    onHide={()=>{
                        this.getUserAccountAdInfo();
                        this.setState({
                            dialog: {}
                        });
                    }} />
           </React.Fragment>
        );
    }

    getServerTime() {
        let self = this;
        axios.get(url.getServerTime + self.state.token + '&t=' + new Date().getTime()).then((res) => {
            if (res.data.code == 200) {
                let info = SignUtil.unformat(res.data.info);
                self.setState({
                    currentTime: new Date(info * 1000)
                })
            }
        })
    }
    // 账户余额
    getUserAccountAdInfo() {
        let self = this;
        axios({
            method: 'POST',
            url: url.GetUserAccountAdInfo + self.state.token,
            data: SignUtil.format({
                projectid: 2,
                appid: 13,
                platformid: 1,
                userid: self.state.userid
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (data) {
            if (data.data.code == 200) {
                self.setState({
                    accountInfo: SignUtil.unformat(data.data.info)
                })
            }
        });
    }
    // 排行列表
    newUserRank() {
        let self = this;
        return new Promise((resolve)=>{
            axios({
                method: 'POST',
                url: url.newUserRank + self.state.token,
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
    getTasks() {
        let self = this,
            { userid } = self.state;
        return new Promise((resolve, reject) => {
            Promise.all([axios({
                method: 'POST',
                url: url.getTasks + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    platformid: 1,
                    appid: 13,
                    appflag: 1,
                    userid
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
                }),axios({
                    method: 'POST',
                    url: url.getUserTaskHistory + self.state.token,
                    data: SignUtil.format({
                        projectid: 2,
                        platformid: 1,
                        appid: 13,
                        appflag: 1,
                        userid
                    }),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })
            ]).then((res) => {
                console.log(res);
                if (res[0].data.code == 200 && res[1].data.code == 200) {
                    let data1 = SignUtil.unformat(res[0].data.info);
                    let taskList = data1.daytask.concat(data1.normaltask)
                    let hidetask = data1.hidetask
                    console.log('hidetask');
                    console.log(hidetask);
                    taskList = taskList.map((item, index) => {
                        item.sku = item.skus.find((sku) => {
                            return sku.skutype == 11
                        })
                        item.status = 0;
                        return item
                    })
                    console.log('taskList');
                    console.log(taskList);
                    let needAvoidAd = window && window.mhdJSBridge && window.mhdJSBridge.needAvoidAd && window.mhdJSBridge.needAvoidAd();
                    if (needAvoidAd) {
                        taskList = taskList.filter((item) => item.jsonvalue != '1117')
                    }
                    hidetask = hidetask.map((item, index) => {
                        item.sku = item.skus.find((sku) => {
                            return sku.skutype == 11
                        })
                        item.status = 0;
                        return item
                    })
                    let data2 = SignUtil.unformat(res[1].data.info);
                    let historyTaskList = data2.daytask.concat(data2.normaltask)
                    taskList = taskList.map((item) => {
                        let temp = historyTaskList.find((hitem) => {
                            return hitem.taskid == item.id
                        }) || {}
                        item.countid = temp.countid || 0
                        item.status = temp.status || 0
                        return item
                    })
                    let videoTask=taskList.filter((item) => item.jsonvalue == "1117")[0];
                    hidetask = hidetask.map((item) => {
                        let temp = historyTaskList.find((hitem) => {
                            return hitem.taskid == item.id
                        }) || {}
                        item.countid = temp.countid || 0
                        item.status = temp.status || 0
                        return item
                    })
                    self.setState({
                        taskList,
                        hidetask,
                        videoTask
                    },() => {
                        resolve()
                    })
                } else {
                    reject()
                }
            }).then(() => {
                self.getPhoneBindTaskIsOver();
            })
        })
    }

    finishTask(task, status = 6) {
        let self = this,
            { userid } = self.state;
        return new Promise((resolve,reject) => {
            axios({
                method: 'POST',
                url: url.finishTask + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    platformid: 1,
                    appid: 13,
                    taskid: task.id,
                    tasktype: task.type,
                    jsonvalue: task.jsonvalue,
                    status,
                    userid
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (response) {
                if (response.data.code == 200) {
                    if (status == 6) {
                        let info = SignUtil.unformat(response.data.info);
                        self.setState({
                            dialog: {
                                title: '任务完成',
                                content: info[0].quantity
                            }
                        })
                    }
                    self.getUserTaskHistory();
                    resolve()
                } else {
                }
            })
        })
    }
    getUserTaskHistory() {
        let self = this,
            { userid, taskList, hidetask } = self.state;
        return new Promise((resolve, reject) => {
            axios({
                method: 'POST',
                url: url.getUserTaskHistory + self.state.token,
                data: SignUtil.format({
                    projectid: 2,
                    platformid: 1,
                    appid: 13,
                    appflag: 1,
                    userid
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(function (response) {
                if (response.data.code == 200) {
                    let data = SignUtil.unformat(response.data. info);
                    let historyTaskList = data.daytask.concat(data.normaltask)
                    // .concat(data.hidetask)
                    taskList = taskList.map((item) => {
                        let temp = historyTaskList.find((hitem) => {
                            return hitem.taskid == item.id
                        }) || {}
                        item.countid = temp.countid || 0
                        item.status = temp.status || 0
                        return item
                    })
                    hidetask = hidetask.map((item) => {
                        let temp = historyTaskList.find((hitem) => {
                            return hitem.taskid == item.id
                        }) || {}
                        item.countid = temp.countid || 0
                        item.status = temp.status || 0
                        return item
                    })
                    self.setState({
                        taskList,
                        hidetask
                    },() => {
                        resolve()
                    })
                } else {
                    reject()
                }
            }).then(() => {
                self.getPhoneBindTaskIsOver()
            })
        })
    }
    getPhoneBindTaskIsOver() {
        console.log('getPhoneBindTaskIsOver')
        let self = this;
        return new Promise((resolve,reject) => {
            let task = self.state.taskList.find((item) => {
                return ['2008','2108','2208','40070002'].indexOf(item.jsonvalue) > -1
            })
            if (task) {
                axios({
                    method: 'POST',
                    url: url.getPhoneBindTaskIsOver + self.state.token,
                    data: SignUtil.format({
                        projectid: 2,
                        platformid: 1,
                        appid: 13,
                        appflag: 1,
                        userid: self.state.userid,
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
}

ReactDOM.render(
    <YQtaskCenter/>,
    document.getElementById('root')
);
