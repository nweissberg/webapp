import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { readRealtimeData } from "../api/firebase";
export default class UserIcon extends React.Component{
    constructor(props){
        super(props)
        this.state={user:null}
    }
    componentDidMount(){
        if(this.props.uid) readRealtimeData("users/"+this.props.uid).then((user_data)=>{
            // console.log(user_data)
            this.setState({user:user_data})
        })
    }
    render(){
        const size = !this.props.pointer?(this.props.size || 50):30
        if(this.state.user == null){
            return(<><Skeleton width={size+"px"} height={size+"px"} borderRadius="50%"/></>)
        }
        return(<div className={this.props.pointer?'shadow-3':""}
        style={this.props.pointer?{
            backgroundColor:"white",
            borderRadius:"2px 50% 50% 50%",
            padding:"2px"
        }:{}}>
            {this.props.profiles && this.props.role != false && <div style={{
                position:"absolute",
                left:"50px",
                marginTop:"30px",
                zIndex:1
            }}>
                <Button
                    tooltip={this.props.profiles[this.state.user.role]?.name}
                    tooltipOptions={{position:"top"}}
                    className="p-button-rounded"
                    icon={"pi pi-"+this.props.profiles[this.state.user.role].icon}
                    style={{
                        background:"var(--glass-b)",
                        color:"var(--text)",
                        backdropFilter:"blur(5px)",
                        border:"0px"
                    }}
                />
            </div>}
            <Button
                tooltip={this.props.icon_only!= true && this.props.name == false? this.state.user.name:""}
                tooltipOptions={{position:this.props.tooltip || "left"}}
                className="p-button-rounded p-0" style={{border:"0px"}}
            >
                <img className={!this.props.pointer?'shadow-7':""}
                    src={'./images/avatar/'+this.state.user.photo+'_icon.jpg'} width={size}
                />
            </Button>
            {!this.props.pointer && this.props.name != false && this.props.icon_only != true && <h6>{this.state.user.name}</h6>}
        </div>)
    }
}