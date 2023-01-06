import React from "react";
import { Button } from "primereact/button";

export default class MultiStateButton extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            value:props.value,
            selected_state: props.value,
            states:[{
                name:"Igual",
                icon:"pi pi-code",
                filter:(a,b,key)=>{return(a[key]==b[key])}
            },
            {
                name:"Maior",
                icon:"pi pi-chevron-right",
                filter:(a,b,key)=>{return(a[key]>b[key])}
            },
            {
                name:"Menor",
                icon:"pi pi-chevron-left",
                filter:(a,b,key)=>{return(a[key]<b[key])}
            },
            {
                name:"Entre",
                icon:"pi pi-arrow-right-arrow-left",
                filter:(a,b,key)=>{return(a[key]<b[key])}
            }]
        }
    }

    render(){
        return(
            <>
                <Button
                    style={{
                        width:"50px"//this.state.selected_state==3?"33%":"50%"
                    }}
                    tooltip={this.state.states[this.state.selected_state].name}
                    tooltipOptions={{
                        position:"top"
                    }}
                    icon={this.state.states[this.state.selected_state].icon}
                    className="p-button-outlined"
                    onClick={(event)=>{
                        const state_value = (this.state.selected_state+1)% Object.keys(this.state.states).length
                        this.setState({selected_state:state_value})
                        this.props.onChange?.({
                            value:state_value,
                            ...this.state.states[state_value]
                        })
                    }}
                />
            </>
        )
    }
}