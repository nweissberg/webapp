import React from "react";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import MultiStateButton from "./state_button";

export default class FilterInputRange extends React.Component{
    constructor(props){
        super(props)
        this.state = props.value || {
            min:0,
            max:Infinity,
            selected_state:0
        }
    }
    render(){
        return(
            <>
                <div className="flex align-items-center">
                    <label>{this.props.label}</label>
                    <div>
                        <Button
                            disabled={!(this.state.min != Infinity || this.state.max != 0 || this.state.selected_state != 0)}
                            className="p-button-text p-button-rounded"
                            icon="pi pi-times"
                            onClick={(event)=>{
                                this.setState({min:0, max:Infinity, selected_state:0},()=>{
                                    this.props.reset?.(this.state)
                                })
                            }}
                        />
                    </div>
                </div>
                <div className="p-inputgroup">
                    <InputNumber
                        value={this.props.value?this.props.value.min:this.state.min}
                        suffix={this.props.suffix}
                        // max={this.state.selected_state == 3? this.state.max:1000}
                        onChange={(event)=>{
                            this.setState({min:event.value},()=>{
                                this.props.onChange?.(this.state)
                            })
                        }}
                    />
                    <MultiStateButton
                        value={this.props.value?this.props.value.selected_state:this.state.selected_state}
                        onChange={(data) => {
                            
                            this.setState({selected_state:data.value},()=>{
                                this.props.onChange?.(this.state)
                            })
                    }}/>
                    {(this.state.selected_state == 3 || this.props.value?.selected_state == 3) && <InputNumber
                        value={this.props.value?this.props.value.max:this.state.max}
                        suffix={this.props.suffix}
                        // min={this.state.min}
                        onChange={(event)=>{
                            
                            this.setState({max:event.value},()=>{
                                this.props.onChange?.(this.state)
                            })
                        
                        }}
                    />}
                </div>
            </>
        )
    }
}