import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { readRealtimeData } from "../api/firebase";
import localForage from "localforage";
import Link from 'next/link'

var roles_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'cargos'
});

export default class UserIcon extends React.Component{
    constructor(props){
        super(props)
        this.state={user:null}
    }
    async getUser(){
        if(this.state.user?.uid != this.props.user?.uid || (this.props.uid && this.state.user?.uid != this.props.uid)){
            var user = null
            if(this.props.user){
                user = this.props.user
            }else if(this.props.uid) await readRealtimeData("users/"+this.props.uid).then((user_data)=>{
                user = user_data
            })
            if(this.props.role == true) roles_db.getItem(user.role.toString())
            .then((user_role)=>{
                user.job = user_role
                this.setState({user:user})
            })
        }
    }
    componentDidMount(){
        this.getUser()
    }
    componentDidUpdate(){
        this.getUser()
    }
    render(){
        const size = !this.props.pointer?(this.props.size || 50):30
        if(this.state.user == null){
            return(<><Skeleton key={this.props.key +'_tmp'} width={size+"px"} height={size+"px"} borderRadius="50%"/></>)
        }
        return(<div key={this.props.key +'_cursor'} className={this.props.pointer?'shadow-3':""}
        style={this.props.pointer?{
            backgroundColor:"white",
            borderRadius:"2px 50% 50% 50%",
            padding:"2px"
        }:{}}>
            {this.props.profiles && this.props.role != false && <div style={{
                position:"absolute",
                // left:"50px",
                // marginTop:"30px",
                transform:`Translate(${size-20}px, ${size-30}px)`,
                zIndex:1
            }}>
                    {/* <Link href={{
                        pathname: '/profile',
                        hash: "#"+this.props.uid
                    }}
                    // as={"/profile#"+this.props.uid}
                    prefetch={false}
                    passHref
                    legacyBehavior
                > */}
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
                {/* </Link> */}
            </div>}
            <div className={this.props.inline?"flex gap-3 align-items-center":""}>
                {/* <Link href={{
                        pathname: '/profile',
                        hash: "#"+this.props.uid
                    }}
                    // as={"/profile#"+this.props.uid}
                    prefetch={false}
                    passHref
                    legacyBehavior
                > */}
                    <Button
                        tooltip={this.props.icon_only!= true && this.props.name == false? this.state.user.name:""}
                        tooltipOptions={{position:this.props.tooltip || "left"}}
                        className="p-button-rounded w-min p-0 p-button-text" style={{border:"0px"}}
                    >   
                    
                        <img className={!this.props.pointer?'shadow-7':""}
                            src={'./images/avatar/'+this.state.user.photo+'_icon.jpg'} width={size}
                        />
                    </Button>
                    {/* </Link> */}
                {this.props.inline && <div className="flex flex-grow-1 gap-3 justify-content-between">
                    {this.props.fullname != false? <label>{this.state.user.name}</label>:<label>{this.state.user.name.split(" ")[0]}</label>}
                    {this.props.currentUser?.uid == this.state.user.uid && <label style={{color:"var(--info)"}}>você</label>}
                    {this.props.role == true && this.props.currentUser?.uid != this.state.user.uid && <label style={{color:"var(--text-c)"}}>{this.props.fullname != false? this.state.user.job[this.state.user.photo[0]]: this.state.user.job.name}</label>}
                </div>
                }    
                {this.props.inline != true && !this.props.pointer && this.props.name != false && this.props.icon_only != true && <h6>{this.state.user.name}</h6>}
            </div>
        </div>)
    }
}