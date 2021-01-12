require("./index.scss");

import React, { Component } from 'react'
import axios from 'axios'
import { url } from '../config'
import * as tools from '../../../tools'
import SignUtil from '../../../tools/sign'
import StatisicsService from '../../../service/statistics'
import { CommonDialog } from '../Dialog'
import CountUp from 'react-countup'

export class SignIn extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            userid: '',
            signHistory: [],
            allskus: [],
            progress: {
                width: '0%'
            },
            goldCountUp: {
                prev:0,
                next:0
            },
            manghe:'',
            accountInfo: {},
            allDays: 0,
            dialog: {
                title: '',
                content: ''
            },
            toast:'',
            loopAnimatin:{
                show:0,
                hide:-1
            },
            countUpRedraw: false,

        }
    }
    componentWillReceiveProps(nextProps) {
        let self = this
        if (nextProps.userid && nextProps.taskLoaded && nextProps.userid!= self.state.userid) {
            self.setState({
                userid: nextProps.userid
            }, ()=> {
                self.isSigned();
                self.openRotate(2);
            })
        }
        if(nextProps.rankList !== this.props.rankList){
            this.startLoopAnimation(nextProps.rankList);
        }
        if(nextProps.accountInfo.usingpresentad !== this.props.accountInfo.usingpresentad){
            self.setState({
                goldCountUp:{
                    prev: this.props.accountInfo.usingpresentad||0,
                    next: nextProps.accountInfo.usingpresentad
                },
                countUpRedraw: true
            })
        }else{
            self.setState({
                countUpRedraw: false
            })
        }
    }
    render() {
        let {progress,allskus,allDays,dialog,loopAnimatin,manghe,countUpRedraw,goldCountUp,toast} = this.state;
        let {rankList,videoTask,accountInfo} = this.props;
        return (
            <React.Fragment>
                <div className="sign-in-container">
                    <div className="rank-list">
                        {
                            rankList.length>0?
                            <div className="content">
                                <ul>
                                    {
                                        rankList.map((item,index)=>{
                                            return (
                                                <li key={'ranking-'+index} className={`${loopAnimatin.show==index?'showing':''}${loopAnimatin.hide==index?'hiding':''}`}><span>{item}</span></li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>:null
                        }
                    </div>
                    <div className="bubbles">
                            <div className="item item1" onClick={(event) => {
                            event.stopPropagation();
                            this.openRotate(1)
                            }}>
                                <div className="quota"></div>
                                <div className="text">{manghe}</div>
                            </div>
                            <div className="item item2" onClick={(event) => {
                            event.stopPropagation();
                            this.openLottery()
                            }}>
                                <div className="quota"></div>
                                <div className="text">转盘</div>
                            </div>
                            {videoTask.countid<5?
                                <div className="item item3" id="video" onClick={(event) => {
                                    event.stopPropagation();
                                    this.openTaskVideo()
                                    }}>
                                    <div className="quota"><i></i></div>
                                    {videoTask?<div className="text">+{videoTask.skus[0].quantity}</div>:null}
                                </div>:null
                            }
                        </div>
                    <div className="top_header">
                        <div className="sugar">
                            {/* <p>
                                <CountUp className="number BEBAS" redraw={countUpRedraw?true : false} decimals={0} duration={1} start={goldCountUp.prev} end={goldCountUp.next} />
                                <span className="txt">元气糖</span>
                            </p> */}
                            <p>
                                <span className="number BEBAS">{accountInfo.usingpresentad}</span>
                                <span className="txt">元气糖</span>
                            </p>
                            <div className="tip">约{accountInfo?(accountInfo.usingpresentad/10000).toFixed(2):'0'}元 <span></span></div>
                        </div>
                        <span className="btn" onClick={(event)=>{
                            event.stopPropagation();
                            this.routeToWithDraw();
                            // this.sign(true)
                        }}></span>
                    </div>
                    <div className="top_sign_calender">
                        <p className="tip">已连续签到&nbsp;<span>{allDays}</span>&nbsp;天</p>
                        <div className="line">
                            <span style={progress}></span>
                        </div>
                        <div className="days">
                            {
                                allskus.map((item,index) => {
                                    return (
                                        <div className="day_item" key={"top_sign_calender"+index}>
                                            <span className={(index==3 || index==6) ? '' : 'gray'}>+{item.calcquantity}</span>
                                            {index==3?
                                            <i className="type4"></i>:(index==6?
                                            <i className="gift"></i>:<i className={(item.badge ? 'badge' : '') + (item.signed ? ' type1' : ' type2')}></i>)}
                                            {
                                                item.signed ? <i className="check"></i>
                                                : <span className={item.signed ? 'gray' : ''}>{item.day}天</span>
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        {
                            allskus.find((item) => {return item.badge}) ?
                            <span className="btn" onClick={(event) => {
                                event.stopPropagation();
                                this.openAdVideo();

                            }}><i className="icon_video"></i>看激励视频可补签</span> :null
                        }
                    </div>
                    {toast ? <div className="c-toast"><span>{toast}</span></div> : null}
                    <CommonDialog
                        dialog={dialog}
                        onSure={()=>{
                            this.props.onUpdateUser();
                            this.setState({
                                dialog: {}
                            });
                        }}
                        onHide={()=>{
                            this.props.onUpdateUser();
                            this.setState({
                                dialog: {}
                            });
                        }} />
                </div>
            </React.Fragment>
        );
    }

    startLoopAnimation(list){
        let self = this;
        if(list.length>2){
            let showIndex, nextIndex;
            setInterval(()=>{
                showIndex = self.state.loopAnimatin.show;
                nextIndex = (showIndex+1)%list.length;
                self.setState({
                    loopAnimatin:{
                        show:nextIndex,
                        hide:showIndex
                    }
                })
            },3000)
        }
    }
    // 看视频
    openTaskVideo() {
        let self = this,
        { videoTask } = self.props;
        HybridUtil.request({
            action: 'openVideoAd',
            param: {
                "position": "3", // 完成任务
                "pageType": "videoAd"
            },
            callback: function (response) {
                if (response.result) {
                    if (response.result.status === 'success') {
                        let videoDom = document.getElementById('video');
                        videoDom.className = videoDom.className+' animate';
                        self.props.finishTask(videoTask, 4).then(()=>{
                            self.props.finishTask(videoTask, 6).then(()=>{
                                self.props.onUpdateUser();
                            })
                        })
                        setTimeout(function(){
                            videoDom.className = videoDom.className.replace(' animate','');
                        },4000)
                    } else if (response.result.status == 'fail'){
                        alert('该时间段奖励已发放完毕，请十分钟后再来,谢谢！')
                    }
                }
            }
        });
    }
     // 盲盒
    openRotate(type){
        let self = this,
        { userid } = self.props;
        axios({
            method: 'POST',
            url: url.time + self.state.token,
            data: SignUtil.format({
                projectid: 2,
                appid: 13,
                platformid: 1,
                userid: userid,
                itype:type
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (data) {
            console.log(data)
            if (data.data.code == 200) {//领到奖励
                let info=SignUtil.unformat(data.data.info);
                self.openRotate(0);
                self.setState({
                    dialog: {
                        title: '恭喜您',
                        content: info,
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
    // 转盘
    openLottery(){
        let self=this;
        HybridUtil.request({
            action: 'jump',
            param: {
                "link": "http://m.manhuadao.cn/activity/mhd-lottery/index.html",
                "jumpType": "webview",
                "title": "转盘"
            },
            callback: function(data){
                self.props.onUpdateUser();
            }
        })
    }
    routeToWithDraw() {
        let self=this;
        HybridUtil.request({
            action: 'jump',
            param: {
                jumpType: 'webview',
                link: 'http://m.manhuadao.cn/activity/yqPay/withdraw.html?isNewUser=false',
                title: '兑换福利'
            },
            callback: function() {
                self.props.onUpdateUser();
            },
        });
    }
    isSigned() {
        let self = this,
            { userid } = self.state;
        axios({
            method: 'POST',
            url: url.isSigned + self.props.token,
            data: SignUtil.format({
                projectid: 2,
                platformid: 1,
                appid: 13,
                type: 5,
                userid,
                date: tools.getDate(self.props.currentTime)
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            if (response.data.code == 200) {
                let data = SignUtil.unformat(response.data.info);

                let signhistory = (data.signhistory && data.signhistory.sort((a,b)=> a.day - b.day)) || [];
                let tempList = signhistory.filter((item) => item.skus == null);
                let currentDay = data.signhistory ? (tempList[tempList.length - 1] && tempList[tempList.length - 1].day) : 1;

                let allskus = data.allskus.filter((item) => {
                    return item.skutype === 11
                });
                let allDays = 0;
                let needAvoidAd = window && window.mhdJSBridge && window.mhdJSBridge.needAvoidAd && window.mhdJSBridge.needAvoidAd();
                allskus = allskus.map((item) => {
                    if (signhistory.find((sign) => {
                        return sign.day == item.day && sign.skus == null
                    })) {
                        item.signed = true
                        allDays ++;
                    } else if (item.day < currentDay) {
                        allDays = 0;
                        if (item.day == (currentDay-1) && !needAvoidAd) {
                            item.badge = true
                        }
                    }
                    return item
                })
                self.setState({
                    signHistory: signhistory,
                    allskus: allskus,
                    progress: {
                        width: (currentDay - 1)/6*100 + '%'
                    },
                    allDays
                }, ()=> {
                    if (!data.issigned) {
                        self.sign(true)
                    }
                })
            } else {}
        })
    }
    // 是否每日签到
    sign(status,date = this.props.currentTime) {
        let self = this,
            { userid } = self.state;
        axios({
            method: 'POST',
            url: url.sign + self.props.token,
            data: SignUtil.format({
                projectid: 2,
                platformid: 1,
                appid: 13,
                type: 5, // 元气连续签到
                date: tools.getDate(date),
                userid
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            if (response.data.code == 200) {
                let info = SignUtil.unformat(response.data.info);
                console.log(info)
                console.log(self.props.hidetask)
                if (status) {
                    let task = self.props.hidetask.find((task) => {
                        return task.jsonvalue == '1118'
                    }) || {}
                    console.log(task)
                    console.log({
                        "position": "1",
                        "calcquantity": "" + info && info.data && info.data[0] && info.data[0].calcquantity,
                        "bonus": task.status==0?(""+task.sku.quantity):"0",
                        "pageType": "videoAd"
                    })
                    HybridUtil.request({
                        action: 'sign',
                        param: {
                            "position": "1",
                            "calcquantity": "" + info && info.data && info.data[0] && info.data[0].calcquantity,
                            "bonus": task.status==0?(""+task.sku.quantity):"0",
                            "pageType": "videoAd"
                        },
                        callback: function (response) {
                            console.log(response)
                            if (response.result) {
                                if (response.result.status === 'success') {
                                    self.props.finishTask(task, 4).then(() => {
                                        self.props.finishTask(task, 6).then(() => {
                                            self.isSigned();
                                            self.props.onUpdateUser();
                                        })
                                    })
                                } else {
                                }
                            }
                        }
                    });
                } else {
                    self.setState({
                        dialog: {
                            title: '签到成功',
                            content: info && info.data && info.data[0] && info.data[0].calcquantity
                        }
                    })
                }
                self.isSigned();
                self.props.onUpdateUser();
            } else {
            }
        })
    }
    openAdVideo() {
        let self = this;
        HybridUtil.request({
            action: 'openVideoAd',
            param: {
                "position": "2",// 补签
                "pageType": "videoAd"
            },
            callback: function (response) {
                if (response.result) {
                    if (response.result.status === 'success') {
                        self.sign(false,new Date(self.props.currentTime - 24*60*60*1000))
                    } else if (response.result.status == 'fail'){
                        alert('该时间段奖励已发放完毕，请十分钟后再来,谢谢！')
                    }
                }
            }
        });
    }
}