require("./index.scss");

import React , {Component} from 'react';
import * as tools from '../../../tools'
import axios from 'axios'

import { url } from '../config'
import { TaskDialog,RewardDialog } from '../TaskDialog'

export class List extends Component{
    constructor( props, context) {
        super( props, context);
        this.state = {
            token: tools.getQueryParams('taskToken'),
            userId: '',
            toast:'',
            rewardDialog: {
                title: '',
                content: '',
                tip:''
            },
            taskDialog:{
                title: '',
                content: '',
                tip:''
            },
        }
    }
    componentWillReceiveProps(nextProps) {
        let self = this;
        if (nextProps.accountInfo.userid && nextProps.accountInfo.userid!= self.state.userId) {
            self.setState({
                userId: nextProps.accountInfo.userid,
            })
        }
    }
    renderBtn(item){
        if (item.status === 4) {
            return <span className="actionBtn" onClick={(event) => {
                event.stopPropagation();
                this.props.finishTask(item, 6);
                this.props.addBeforeTask();
                this.props.isfinishAll();
            }}>领奖励</span>
        } else if (item.status === 6) {
            return <span className="actionBtn done">已完成</span>
        } else {
            return <span className="actionBtn play" onClick={(event) => {
                event.stopPropagation();
                this.onCompleteTask(item);
            }}>{item.jsonvalue=='1221'||item.jsonvalue=='40190007'?'去抽奖':'去完成'}</span>
        }
    }
    renderBfBtn(item){
        if (item.status === 4) {
            return <span className="actionBtn" onClick={(event) => {
                event.stopPropagation();
                this.props.finishTask(item, 6);
                this.props.isfinishAll();
            }}>领奖励</span>
        } else if (item.status === 6) {
            return <span className="actionBtn done">已完成</span>
        } else {
            return <span className="actionBtn play" onClick={(event) => {
                event.stopPropagation();
                this.completeBfTask(item);
            }}>{item.jsonvalue=='1221'||'40190007'?'去抽奖':'去完成'}</span>
        }
    }
    componentDidMount() {
    }
    render(){
        let { taskList,currentDay,threeTasks,beforeTask,allFinsished,withDrawListsLength} = this.props,
            {rewardDialog,taskDialog,toast}=this.state;
            return <React.Fragment>
                <div className="main">
                    <div className="three-tasks">
                        <div className="title">完成3天新手任务100%领现金！</div>
                        {withDrawListsLength<1&&(allFinsished || (beforeTask&&beforeTask.length<1))?<div className="getMore" onClick={(event) => {
                            event.stopPropagation();
                            this.onCashOutClick()
                            }}>领现金奖</div>:null}
                        <div className="finish">
                            <div className="finish-list">
                                {
                                    threeTasks.map((task, index) => {
                                        return (<div key={'threeTasks'+index} className={"item item"+index + ' ' + (task.threeStatus == 1 ? 'playing' : task.threeStatus == 2 ? 'over' : task.threeStatus == 3  ? 'overhalf'  : task.threeStatus == 4 ? 'overdue' : '')}  onClick={(event) => {
                                            event.stopPropagation();
                                            if (task.threeStatus == 3) {
                                                this.props.finishTask(task, 4).then(()=>{
                                                    this.props.finishTask(task, 6).then(()=>{
                                                        this.props.userTaskHistory()
                                                    });
                                                })
                                            }else if(task.threeStatus==1){
                                                this.setState({
                                                    toast:'任务未完成哦~',
                                                },()=>{
                                                    setTimeout(()=>{
                                                        this.setState({
                                                            toast:''
                                                        })
                                                    },1500)
                                                })
                                            }else if(task.threeStatus==2){
                                                this.setState({
                                                    toast:'明天来再领3000元气糖大礼包哦！',
                                                },()=>{
                                                    setTimeout(()=>{
                                                        this.setState({
                                                            toast:''
                                                        })
                                                    },1500)
                                                })
                                            }else{
                                                this.setState({
                                                    toast:'明天来再领3000元气糖大礼包哦！',
                                                },()=>{
                                                    setTimeout(()=>{
                                                        this.setState({
                                                            toast:''
                                                        })
                                                    },1500)
                                                })
                                            }
                                        }}>
                                            <div className="content">
                                                <div className="package">
                                                    <div className="quota"></div>
                                                    {/* <p className="text">{index == 0 ?2000:index == 1 ?3000:index == 2 ?5000:0}</p> */}
                                                    <p className="text">{ (!task.threeStatus || task.threeStatus == 1) ? 'X'+(task.skus && task.skus [0] && task.skus[0].quantity) : ''}</p>
                                                </div>
                                                <div className="date">{task.threeStatus == 1 ? '待完成'+'( '+task.finishedNum+'/'+task.alltaskNum+' )' : task.threeStatus == 2 ? '已领取' : task.threeStatus == 3 ? '领取奖励' : task.threeStatus == 4 ? '未完成' : ('第'+(index+1)+'天')}</div>
                                            </div>
                                            {index==2?null:<div className="split"></div>}
                                        </div>)
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <TaskDialog taskDialog={taskDialog}
                                onSure={()=>{
                                    this.onCashOutClick();
                                    this.props.onUpdateUser();
                                    this.setState({
                                        taskDialog: {}
                                    });
                                }}
                                onHide={()=>{
                                    this.props.onUpdateUser();
                                    this.setState({
                                        taskDialog: {}
                                    });
                                }}/>
                    {beforeTask && beforeTask.length>0 && threeTasks && threeTasks[2] && (threeTasks[2].threeStatus==3 || threeTasks[2].threeStatus==2)?<div className="lists">
                        <div className="tip">
                            <span className="icon-tip"></span>
                            <div className="txt">恭喜您获得新手任务补完的机会，完成后仍拥有新手专享1元提现资格哦～</div>
                        </div>
                        <ul className="taskList">
                            {
                                beforeTask.map((item,index)=>{
                                    return item? (
                                        <li className="item" key={index}>
                                            <span className="itemImg"><img src={item.icon} alt=""/></span>
                                            <div className="info">
                                                <h6>{item.name} <span>第{item.day}天 <i></i></span></h6>
                                                <p>+{item.skus[0].name}</p>
                                            </div>
                                            {this.renderBfBtn(item)}
                                        </li>
                                    ) : null
                                })
                            }
                        </ul>
                    </div>:null}

                    <div className="lists">
                        <ul className="taskList">
                            {
                                taskList.map((item,index)=>{
                                    return item? (
                                        <li className="item" key={index}>
                                            <span className="itemImg"><img src={item.icon} alt=""/></span>
                                            <div className="info">
                                                <h6>{item.name}</h6>
                                                <p>+{item.skus[0].name}</p>
                                            </div>
                                            {this.renderBtn(item)}
                                        </li>
                                    ) : null
                                })
                            }
                        </ul>
                    </div>
                    <RewardDialog rewardDialog={rewardDialog}
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
                </div>
                {toast ? <div className="c-toast"><span>{toast}</span></div> : null}
                </React.Fragment>

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

    onCompleteTask(task,event){
        let self = this;
        let jsonvalue = task.jsonvalue;
        switch(jsonvalue){
            //阅读10分钟 done
            case '40010000':
            //收藏2本漫画 done
            case '40020000':
                HybridUtil.request({
                    action: 'openBookshelf',
                    callback: (data) => {
                    }
                });
                break;
            //开启消息推送权限 done
            case '40030001':
                HybridUtil.request({
                    action: 'notification',
                    param: {
                        "pageType": "notification"
                    },
                    callback: (res) => {
                        if (res.result == 'success') {
                            self.props.finishTask(task, 4)
                        }
                    }
                });
                break;
            // 看一次激励视频
            case '40040000':
                HybridUtil.request({
                    action: 'openVideoAd',
                    param: {
                        "position": "3", // 完成任务
                        "pageType": "videoAd"
                    },
                    callback: function (response) {
                        if (response.result) {
                            if (response.result.status == "success") {
                                self.props.finishTask(task, 4)
                            } else if (response.result.status == 'fail'){
                                alert('该时间段奖励已发放完毕，请十分钟后再来,谢谢！')
                            }
                        }
                    }
                });
                break;
            // 分享
            case '40060002':
                HybridUtil.request({
                    action: 'h5Share',
                    param: {
                        shareType: 'url',
                        shareImgUrl: 'https://statics.zhuishushenqi.com/icon-yuanqi.png',
                        shareUrl: 'https://a.app.qq.com/o/simple.jsp?pkgname=com.haokan.comicsisland.activity',
                        shareTitle: '元气漫画,免费阅读',
                        shareContent: '元气漫画,海量漫画不要钱,元气满满看到爽!',
                    },
                    callback: (data) => {
                        if(data.result=="success"){
                            self.props.finishTask(task, 4)
                        }
                    }
                });
                break;
            // 绑定手机号
            case '40070002':
                HybridUtil.request({
                    action: 'openBindPhone',
                    param: {
                        "test": "1"
                    },
                    callback: (res) => {
                        self.props.getPhoneBindTaskIsOver();
                    }
                });
                break;
            // 应用市场
            case '40090003':
                HybridUtil.request({
                    action: 'openSupport',
                    callback: (data) => {
                        self.props.finishTask(task, 4)
                    }
                });
                break;
                case '40050000'://转盘
                HybridUtil.request({
                    action: 'jump',
                    param: {
                        "link": "http://m.manhuadao.cn/activity/mhd-lottery/index.html?date="+task.date,
                        "jumpType": "webview",
                        "title": "转盘"
                    },
                    callback: function(data){
                        self.props.userTaskHistory();
                        self.props.onUpdateUser();
                    }
                })
                break;
            // 进行一次抽奖 done
            case '40100003':
                HybridUtil.request({
                    action: 'jump',
                    param: {
                        "link": "http://m.manhuadao.cn/activity/luckDraw/20200813.html",
                        "jumpType": "webview",
                        "title": "抽奖"
                    },
                    callback: function(data){
                        self.props.finishTask(task, 4)
                    }
                })
                break;
        }
    }
    completeBfTask(task,event){
        let self = this;
        let jsonvalue = task.jsonvalue;
        switch(jsonvalue){
            //阅读10分钟 done
            case '40010000':
            //收藏2本漫画 done
            case '40020000':
                HybridUtil.request({
                    action: 'openBookshelf',
                    callback: (data) => {
                    }
                });
                break;
            //开启消息推送权限 done
            case '40030001':
                HybridUtil.request({
                    action: 'notification',
                    param: {
                        "pageType": "notification"
                    },
                    callback: (res) => {
                        if (res.result == 'success') {
                            self.props.finishBfTask(task, 4)
                        }
                    }
                });
                break;
            // 看一次激励视频
            case '40040000':
                HybridUtil.request({
                    action: 'openVideoAd',
                    param: {
                        "position": "3", // 完成任务
                        "pageType": "videoAd"
                    },
                    callback: function (response) {
                        if (response.result) {
                            if (response.result.status == "success") {
                                self.props.finishBfTask(task, 4)
                            } else if (response.result.status == 'fail'){
                                alert('该时间段奖励已发放完毕，请十分钟后再来,谢谢！')
                            }
                        }
                    }
                });
                break;
            // 分享
            case '40060002':
                HybridUtil.request({
                    action: 'h5Share',
                    param: {
                        shareType: 'url',
                        shareImgUrl: 'https://statics.zhuishushenqi.com/icon-yuanqi.png',
                        shareUrl: 'https://a.app.qq.com/o/simple.jsp?pkgname=com.haokan.comicsisland.activity',
                        shareTitle: '元气漫画,免费阅读',
                        shareContent: '元气漫画,海量漫画不要钱,元气满满看到爽!',
                    },
                    callback: (data) => {
                        if(data.result=="success"){
                            self.props.finishBfTask(task, 4)
                        }
                    }
                });
                break;
            // 绑定手机号
            case '40070002':
                HybridUtil.request({
                    action: 'openBindPhone',
                    param: {
                        "test": "1"
                    },
                    callback: (res) => {
                        self.props.getPhoneBindTaskIsOver();
                    }
                });
                break;
            // 应用市场
            case '40090003':
                HybridUtil.request({
                    action: 'openSupport',
                    callback: (data) => {
                        self.props.finishBfTask(task, 4)
                    }
                });
                break;
            case '40050000'://转盘
                console.log('0000');
                HybridUtil.request({
                    action: 'jump',
                    param: {
                        "link": "http://m.manhuadao.cn/activity/mhd-lottery/index.html?date="+task.date,
                        "jumpType": "webview",
                        "title": "转盘"
                    },
                    callback: function(data){
                        self.props.finishBfTask(task, 4).then(()=>{
                            self.props.onUpdateUser();
                        })
                    }
                })
                break;
            // 进行一次抽奖 done
            case '40100003':
                HybridUtil.request({
                    action: 'jump',
                    param: {
                        "link": "http://m.manhuadao.cn/activity/luckDraw/20200813.html",
                        "jumpType": "webview",
                        "title": "抽奖"
                    },
                    callback: function(data){
                        self.props.finishBfTask(task, 4)
                    }
                })
                break;
        }
    }

}