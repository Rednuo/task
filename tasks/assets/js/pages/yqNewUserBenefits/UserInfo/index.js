require("./index.scss");

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import FastClick from 'fastclick'
import axios from 'axios'
import { url } from '../config'
import * as tools from '../../../tools'
import CountUp from 'react-countup'
import { RewardDialog} from '../TaskDialog'

export class UserInfo extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            platform: tools.getQueryParams('platform'),
            userId: '',
            token: tools.getQueryParams('taskToken'),
            goldCountUp: {
                prev:0,
                next:0
            },
            rewardDialog: {
                title: '',
                content: '',
                tip:''
            },
            toast:'',
            manghe:'',
            leftTime:'',
            isfirst:localStorage.getItem('isfirst'),
            countUpRedraw: false,
            showGoldGif: false,
            loopAnimatin:{
                show:0,
                hide:-1
            },
        }
    }
    componentWillReceiveProps(nextProps) {
        let self = this;
        if (nextProps.accountInfo.userid && nextProps.accountInfo.userid!= self.state.userId) {
            self.setState({
                userId: nextProps.accountInfo.userid,
            });
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
    componentDidMount() {
    }
    render() {
        let {userSignData,goldCountUp,loopAnimatin,toast,countUpRedraw,isfirst} = this.state,
            { accountInfo,allDays,nextYqNum,allskus,issigned,currentDay,rankList,videoTask,signVideoTask,manghe} = this.props;
        return (
            <React.Fragment>
                <div className="sign">
                    {
                    <div className="sign-container">
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
                            this.props.openRotate(1)
                            }}>
                                <div className="quota"></div>
                                <div className="text">{manghe}</div>
                            </div>
                            <div className="item item2" onClick={(event) => {
                            event.stopPropagation();
                            this.openLottery();
                            this.props.onUpdateUser();
                            }}>
                                <div className="quota"></div>
                                <div className="text">转盘</div>
                            </div>
                            {videoTask.countid<5?
                                <div className="item item3" id="video" onClick={(event) => {
                                    event.stopPropagation();
                                    this.openAdVideo();
                                    }}>
                                    <div className="quota"><i></i></div>
                                    {videoTask?<div className="text">+{videoTask.skus[0].quantity}</div>:null}
                                </div>:null
                            }
                        </div>
                        <div className="sign-content">
                            <div className="sign-text">
                                <p>已连续签到<span> {allDays} </span>天</p>
                                <span className="sign-tip">明天可领取{nextYqNum}元气糖</span>
                            </div>
                            <div className="sign-list">
                                <div className="curr" id="curr">
                                    {
                                        allskus.map((item,index) => {
                                            return (
                                                index<3?
                                                <div className="item" key={"top_sign_calender"+index} onClick={(event) => {
                                                    event.stopPropagation();
                                                    if(signVideoTask.status!=6 && currentDay==(index+1)){
                                                        this.signVideo()
                                                    }
                                                    }}>
                                                    <div className={item.signed ||item.badge ? 'package gray' : 'package'}>
                                                        <div className="quota"></div>
                                                        <p className="text">{item.calcquantity}</p>
                                                    </div>
                                                    {signVideoTask.status!=6 &&currentDay==(index+1) ?<div className="tip"></div>:null}
                                                    {item.signed?<div className="date already"></div>:(item.badge?<div className="date">已过期</div>:<div className="date">{item.day}天</div>)}
                                                    {index<2?<div className={item.signed ? 'split' : 'split gray'}></div>:null}
                                                </div>:null
                                            )
                                        })
                                    }
                                </div>
                                {/* <div className="after showing" id="after">
                                    {
                                        allskus.map((item,index) => {
                                            return (
                                                index>2?
                                                <div className="item" key={"top_sign_calender"+index}>
                                                    <div className={item.signed ||item.badge ? 'package gray' : 'package'}>
                                                        {index==3?<div className="fourth"></div>:(index==6?<div className="seventh"></div>:<div className="quota"></div>)}
                                                        <p className="text">{item.calcquantity}</p>
                                                    </div>
                                                    {item.signed?<div className="date already"></div>:(item.badge?<div className="date">已过期</div>:<div className="date">{item.day}天</div>)}
                                                    {index<6?<div className={item.signed ? 'split' : 'split gray'}></div>:null}
                                                </div>:null
                                            )
                                        })
                                    }
                                </div> */}
                            </div>
                        </div>
                        <div className="title-tip">
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
                        <span className="cash-out" onClick={(event) => {
                            event.stopPropagation();
                            this.onCashOutClick()
                            }}></span>
                        {toast ? <div className="c-toast"><span>{toast}</span></div> : null}
                    </div>
                    }
                </div>
                <RewardDialog rewardDialog={this.state.rewardDialog}
                            onSure={()=>{
                                this.props.onUpdateUser();
                                this.setState({
                                    rewardDialog: {}
                                });
                            }}
                            onHide={()=>{
                                this.props.onUpdateUser();
                                this.setState({
                                    rewardDialog: {}
                                });
                            }}/>
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
    openAdVideo() {
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
    // 跳转提现
    onCashOutClick(){
        HybridUtil.request({
            action: "jump",
            param: {
                'jumpType':'webview',
                'pageType':'cashOut',
                'title':'兑换 / 提现',
                'link':'http://m.manhuadao.cn/activity/yqPay/withdraw.html?isNewUser=true'
            },
            callback: function() {
                this.props.onUpdateUser();
            },
        });
    }
    // 盲盒
    // openRotate(type){
    //     let self = this,
    //     { userId } = self.state;
    //     console.log('盲盒');
    //     axios({
    //         method: 'POST',
    //         url: url.welfare.time + self.state.token,
    //         data: ApiUtil.format({
    //             projectid: 2,
    //             appid: 13,
    //             platformid: 1,
    //             userid: userId,
    //             itype:type
    //         }),
    //         headers: {
    //             "Content-Type": "application/x-www-form-urlencoded"
    //         }
    //     }).then(function (data) {
    //         if (data.data.code == 200) {//领到奖励
    //             let info=ApiUtil.unformat(data.data.info);
    //             self.openRotate(0);
    //             self.setState({
    //                 rewardDialog: {
    //                     title: '恭喜您',
    //                     content: '+ '+info,
    //                     tip:''
    //                 }
    //             })
    //         } else{//倒计时
    //             if(data.data.code_msg<1){
    //                 self.setState({
    //                     manghe:'盲盒'
    //                 })
    //             }else{
    //                 let leftTime=data.data.code_msg;
    //                 let manghe = self.getDateDiff(Number(leftTime));
    //                 self.setState({
    //                     manghe: manghe[0]+":"+manghe[1]+":"+manghe[2]
    //                 })
    //                 let timer = setInterval(() => {
    //                     leftTime-=1;
    //                     if(leftTime<=0){
    //                         clearInterval(timer);
    //                         self.openRotate(0);
    //                     }
    //                     let manghe = self.getDateDiff(leftTime);
    //                     self.setState({
    //                         manghe: manghe[0]+":"+manghe[1]+":"+manghe[2]
    //                     })
    //                 }, 1000);
    //             }
    //         }
    //     })
    // }
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
    signVideo(){
        let self=this;
        let {signVideoTask}=self.props;
        HybridUtil.request({
            action: 'openVideoAd',
            param: {
                "position": "1",
                // "calcquantity": "" + info && info.data && info.data[0] && info.data[0].calcquantity,
                "bonus": '+ '+signVideoTask.skus[0].quantity,
                "pageType": "videoAd"
            },
            callback: function (response) {
                if (response.result) {
                    if (response.result.status === 'success') {
                        self.props.finishTask(signVideoTask, 4).then(() => {
                            self.props.finishTask(signVideoTask, 6)
                        })
                    } else {
                    }
                }
            }
        });
    }
}