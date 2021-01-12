require("./index.scss");

import React, { Component } from 'react';
// 任务弹窗
export class TaskDialog extends Component {
    render() {
        if (this.props.taskDialog && this.props.taskDialog.title) {
            return (
                <div className="mask">
                    <div className="wrap animated fadeIn" onClick={event=>event.stopPropagation()}>
                        <div className="mask-header">
                            <div className="dec"></div>
                            <div className="titleBg">{this.props.taskDialog.title}</div>
                        </div>
                        <div className="item">
                            <h2>{this.props.taskDialog.content}</h2>
                            <p>{this.props.taskDialog.tip}</p>
                            <div className="btn" onClick={this.props.onSure}>去提现</div>
                        </div>
                        <span className="dismiss" onClick={this.props.onHide}></span>
                    </div>
                </div>
            )
        }else{
            return null
        }
    }
}
export class SignDialog extends Component {
    render() {
        if (this.props.signDialog && this.props.signDialog.title && this.props.signDialog.type != 'task') {
            return (
                <div className="mask">
                    <div className="wrap animated fadeIn">
                        <div className="mask-header">
                            <div className="dec"></div>
                            <div className="titleBg">{this.props.signDialog.title}</div>
                        </div>
                        <div className="item">
                            <h2><i className="candy"></i>{this.props.signDialog.content}</h2>
                            <div className="btn" onClick={this.props.onSure}>看视频可在领取20元气糖</div>
                        </div>
                        <span className="dismiss" onClick={this.props.onHide}></span>
                    </div>
                </div>
            )
        }else{
            return null
        }

    }
}
export class RewardDialog extends Component {
    render() {
        if (this.props.rewardDialog && this.props.rewardDialog.title) {
            return (
                <div className="mask">
                    <div className="wrap animated fadeIn">
                        <div className="mask-header">
                            <div className="dec"></div>
                            <div className="titleBg">{this.props.rewardDialog.title}</div>
                        </div>
                        <div className="item">
                            <h2><i className="candy"></i>{this.props.rewardDialog.content}</h2>
                            <div className="btn" onClick={this.props.onSure}>收下</div>
                        </div>
                        <span className="dismiss" onClick={this.props.onHide}></span>
                    </div>
                </div>
            )
        }else{
            return null
        }

    }
}