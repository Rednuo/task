require("./index.scss");

import React, { Component } from 'react';

// 弹窗
export class CommonDialog extends Component {
    render() {
        if (this.props.dialog && this.props.dialog.title) {
            return (
                <div className="mask" onClick={this.props.onHide}>
                    <div className="dialog-wrapper reward animated fadeIn" onClick={event=>event.stopPropagation()}>
                        <i className="dialog-close" onClick={this.props.onHide}></i>
                        <i className="dialog-top"></i>
                        <div className="dialog-title">{this.props.dialog.title}</div>
                        <div className="dialog-body">
                            <p><i className="sugar"></i>+{this.props.dialog.content}</p>
                            <span className="btn" onClick={this.props.onSure}>{this.props.dialog.btn || '收下'}</span>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}