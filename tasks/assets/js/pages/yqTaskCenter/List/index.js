require("./index.scss");

import React , {Component} from 'react';
import axios from 'axios'
import { url } from '../config'
import * as tools from '../../../tools'
import SignUtil from '../../../tools/sign'

export class List extends Component{
    constructor( props, context) {
        super( props, context);
        this.state = {
            userid: '',
            progress: {
                width: '0%'
            },
            readTip:{},
            readList: [],
            current: {},
            lastDay: {},
            countDay: 0,
            readLength: 0
        }
    }
    componentWillReceiveProps(nextProps) {
        let self = this;
        if (nextProps.userid && nextProps.userid!= self.state.userid) {
            self.setState({
                userid: nextProps.userid
            }, () => {
                self.continuousReading();
            })
        }
    }
    renderBtn(item){
        if (item.status === 4) {
            return <span className="btn" onClick={(event) => {
                event.stopPropagation();
                this.props.finishTask(item, 6);
            }}>领奖励</span>
        } else if(item.totalamount && (item.countid < item.totalamount)) {
            return <span className="btn link" onClick={(event) => {
                event.stopPropagation();
                this.onCompleteTask(item);
                // this.props.finishTask(item, 4);
            }}>去完成</span>
        }else if (item.status === 6) {
            return <span className="btn disabled">已完成</span>
        } else {
            return <span className="btn link" onClick={(event) => {
                event.stopPropagation();
                this.onCompleteTask(item);
                // this.props.finishTask(item, 4);
            }}>去完成</span>
        }
    }
    componentDidMount() {
        this.getConfigByKey();
    }
    render(){
        const { taskList } = this.props;
        let {progress,readList,current,lastDay,countDay,readLength,readTip} = this.state;
        return <React.Fragment>
                {
                    taskList.length > 0 ?
                    <div className="task-list-wrapper">
                        <span className="task-list-title">我的任务</span>
                        <div className="continuous-read-container">
                            <div className="read_calender">
                                <div className="read_calender_header">
                                    <div className="left">
                                        <span>连续&nbsp;<span>{readLength}</span>&nbsp;天阅读获得大礼包</span>
                                        <span>{readTip && readTip.content}</span>
                                    </div>
                                    {
                                        current && current.isovertask ?
                                        <span className="btn disabled">已领取</span> :
                                        <span className="btn" onClick={(event)=>{
                                            event.stopPropagation();
                                            this.toReader();
                                        }}>去阅读</span>
                                    }

                                </div>
                                <div className="day_line">
                                    <span style={progress}></span>
                                </div>
                                <div className="days">

                                    {
                                        readList.map((item,index) => {
                                            return (
                                                <div className="day_item" key={"read_calender"+index}>
                                                    {index==3?<span className="double"></span>:null}
                                                    {
                                                        (index === (readLength - 1) && countDay === (readLength-1) && !lastDay.isovertask) ?
                                                        <i className="gift shake" onClick={(event)=>{
                                                            event.stopPropagation();
                                                            this.finishReadTask();
                                                        }}></i> :
                                                        <i className={index === (readLength-1) ? 'gift' : item.isovertask ? 'type1' : 'type2'}></i>
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <ul className="task-list-content">
                            {
                                taskList.map((item, index) => {
                                    return (
                                        <li className="list-item" key={"task_list_item"+index}>
                                            <img src={item.icon} className="icon"></img>
                                            <div className="info">
                                                <h6>{item.name + (item.totalamount > 1 ? ('('+item.countid+'/'+item.totalamount+')') : '')}</h6>
                                                <p>+{item.sku && item.sku.quantity}元气糖</p>
                                            </div>
                                            {this.renderBtn(item)}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div> : null
                }
            </React.Fragment>
    }
    onCompleteTask(task,event){
        let self = this,
            jsonvalue = task.jsonvalue;
        switch(jsonvalue){
            //看视频领元气糖
            case '1117':
                HybridUtil.request({
                    action: 'openVideoAd',
                    param: {
                        "position": "3", // 完成任务
                        "pageType": "videoAd"
                    },
                    callback: function (response) {
                        if (response.result) {
                            if (response.result.status == 'success') {
                                self.props.finishTask(task, 4)
                            } else if (response.result.status == 'fail'){
                                alert('该时间段奖励已发放完毕，请十分钟后再来,谢谢！')
                            }
                        }
                    }
                });
                break;
            //阅读漫画
            case '1112':
            case '1113':
            case '1114':
                HybridUtil.request({
                    action: 'openBookshelf',
                    callback: (data) => {
                    }
                });
                break;
            case '1221'://转盘
            HybridUtil.request({
                action: 'jump',
                param: {
                    "link": "http://m.manhuadao.cn/activity/mhd-lottery/index.html?date="+task.date,
                    "jumpType": "webview",
                    "title": "转盘"
                },
                callback: function(data){
                    self.props.getUserTaskHistory();
                    self.props.onUpdateUser();
                }
            })
            break;
            //元气每天分享一次
            case '1102':
                HybridUtil.request({
                    action: 'h5Share',
                    param: {
                        shareType: 'url',
                        shareImgUrl: 'https://statics.zhuishushenqi.com/icon-yuanqi.png',
                        shareUrl: 'https://a.app.qq.com/o/simple.jsp?pkgname=com.haokan.comicsisland.activity',
                        shareTitle: '元气漫画,免费阅读',
                        shareContent: '元气漫画,海量漫画不要钱,元气满满看到爽!',
                    },
                    callback: (res) => {
                        if (res.result == 'success') {
                            self.props.finishTask(task, 4)
                        }
                    }
                });
                break;
            //绑定手机号
            case '2108':
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
            //开启消息推送权限
            case '2109':
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
        }
    }
    continuousReading() {
        let self = this,
            { userid } = self.state;
        axios({
            method: 'POST',
            url: url.continuousReading + self.props.token,
            data: SignUtil.format({
                projectid: 2,
                platformid: 1,
                appid: 13,
                userid,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            if (response.data.code == 200) {
                let countDay = 0,
                    data = SignUtil.unformat(response.data.info),
                    current = {};
                console.log(data)
                let readList = data.map((item, index) => {
                    item.sku = item.skus.find((sku) => {
                        return sku.skutype === 11
                    })
                    // if (item.isovertask && countDay < index) {
                    //     countDay = index
                    // }
                    if (tools.getDate(self.props.currentTime) == item.date.substring(0,10)) {
                        current = item
                        countDay = index
                    }
                    return item
                });
                let lastDay = readList.pop();
                self.setState({
                    readList: readList,
                    readLength: readList.length,
                    progress: {
                        width: countDay/(readList.length - 1)*100 + '%'
                    },
                    current,
                    lastDay,
                    countDay
                })
            } else {}
        })
    }
    getConfigByKey() {
        let self = this,
            { userid } = self.state;
        axios({
            method: 'POST',
            url: url.GetConfigByKey + self.props.token,
            data: SignUtil.format({
                projectid: 2,
                platformid: 1,
                appid: 13,
                userid,
                configkey:'rwzx_continuity_tosh'
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            if (response.data.code == 200) {
                let data = SignUtil.unformat(response.data.info);
                self.setState({
                    readTip:data
                })
            } else {}
        })
    }

    finishReadTask () {
        let self = this;
        self.props.finishTask(self.state.lastDay, 4).then(() => {
            self.props.finishTask(self.state.lastDay, 6).then(() => {
                self.continuousReading();
            })
        });
    }

    toReader() {
        HybridUtil.request({
            action: 'openBookshelf',
            callback: (data) => {
            }
        });
    }
}