import React, { Component } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import  TimeoutChecker  from './timeout_checker';

class InViewWrapper extends Component {
    constructor(props) {
        super(props);
        this.state={ progress:100 }
        this.onExecute = props.onExecute;
        this.inView = props.inView;
        this.outView = props.outView;
        this.timer = props.timer || 3000;
        this.observer = null;
        this.ref = null;
        this.timeoutChecker = null;
    }
  
    setObserver() {
        this.setState({progress: 100});
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.inView?.(this)
                if(this.props.timer == 0 || !this.props.timer){
                    this.onExecute?.(this);
                    return
                }
                this.timeoutChecker = new TimeoutChecker(this.timer, () => {
                    this.inView?.(this)
                    this.onExecute?.(this);
                },(time)=>{
                    console.log(time)
                    this.setState((state) => {
                        return { progress: time };
                    });
                });
                this.timeoutChecker.start();
            } else {
                this.timeoutChecker?.cancel();
                this.outView?.(this)
            }
            });
        });
        this.observer.observe(this.ref);
    }
  
    stopObserver() {
        this.setState({progress: 100});
        try {
            this.observer?.unobserve(this.ref);
            this.outView?.(this)
        } catch (error) {
            console.log(error.message)
        }
    }
  
    componentDidMount() {
      this.setObserver();
      this.inView?.(this)
    }
  
    componentWillUnmount() {
        this.stopObserver();
        this.outView?.(this)
        this.timeoutChecker?.cancel();
    }
  
    render() {
        return (
            <div className={this.props?.className?this.props?.className:'relative w-full h-full'}>
                <div ref={(el) => this.ref = el}>
                    {this.props.children}
                </div>
                {this.props.progress &&
                <div style={{transitionProperty:'height opacity', height:this.state.progress+'%', opacity:this.state.progress/100}}
                    className='pointer-events-none bg-white-gradient-bottom screen-2 transition-duration-300 transition-linear flex absolute w-full bottom-0 left-0'
                />}
            </div>
        );
    }
}
  

export default InViewWrapper;
