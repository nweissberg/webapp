import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';

export default class Modal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            position: 'center'
        };
	}
    onClick(e, position) {
        let state = {
            [`${e}`]: true
        };

        if (position) {
            state = {
                ...state,
                position
            }
        }

        this.setState(state);
    }
    onHide(e) {
        this.setState({
            [`${e}`]: false,
            maximized:false
        });
        if(this.props.onHide) this.props.onHide(e)
    }
    renderFooter(e) {
        return (
            <div>
                <Button label="No" icon="pi pi-times" onClick={() => this.onHide(e)} className="p-button-text" />
                <Button label="Yes" icon="pi pi-check" onClick={() => this.onHide(e)} autoFocus />
            </div>
        );
    }
	render() {
		return(
			<div>
                <Dialog
                    header={this.props.header?this.props.header:"Header"}
                    visible={this.props.visible?this.props.visible:false}
                    style={{
                        maxWidth:'700px',
                        width: 'calc(100% - 40px)',
                        ...this.props.style,
                    }}
                    maximized={this.props.maximized?this.props.maximized:(this.state.maximized?this.state.maximized:false)}
                    maximizable={this.props.maximizable?true:false}
                    footer={this.props.footer?this.props.footer:this.renderFooter('visible')}
                    onHide={() => this.onHide('visible')}
                    onMaximize={(e)=>{
                        this.props.onMaximize?.(!this.state.maximized)
                        this.setState({ maximized:!this.state.maximized })
                    }}>
                        
                    {this.props.children}
                </Dialog>
			</div>
		)
	}
}