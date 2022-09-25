import React from "react";
import { Button } from "primereact/button";

export default class QuantityInput extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            value:props.value
        }
    }
    updateValue(value){
        this.setState({value})
    }
    render(){
        return(
            <>
            
            <div className="show_on_phone">
                <Button
                    style={{color:"var(--info)"}}
                    className="p-button-outlined"
                    icon='pi pi-plus'
                    onClick={(event)=>{
                        event.stopPropagation()
                        this.props.onAdd?.()
                    }}
                />
                <div 
                    style={{
                        justifyContent:"center",
                        textAlign:"center",
                        marginLeft:"auto",
                        marginRight:"auto",
                        paddingTop:"5px"
                    }}>
                    <h4 style={{
                        // minWidth:"40px",
                    }}>{this.props.value}</h4>
                </div>
                <Button
                    style={{color:this.props.value>1?"var(--info)":"var(--warn)"}}
                    className="p-button-outlined"
                    icon={this.props.value>1?'pi pi-minus':'pi pi-times'}
                    onClick={(event)=>{
                        event.stopPropagation()
                        this.props.onSub?.()
                    }}
                />
                
            </div>
            <div className="hide_on_phone">
                <div className="p-inputgroup"
                    style={{
                        // width:"200px"
                    }}>
                    <Button
                        style={{color:this.props.value>1?"var(--info)":"var(--warn)"}}
                        className="p-button-outlined"
                        icon={this.props.value>1?'pi pi-minus':'pi pi-times'}
                        onClick={(event)=>{
                            this.props.onSub?.()
                        }}
                    />
                    <div style={{
                            justifyContent:"center",
                            textAlign:"center",
                            marginTop:"auto",
                            marginBottom:"auto",
                            paddingInline:"5px"
                        }}>
                        <h4 style={{
                            minWidth:"40px",
                        }}>{this.props.value}</h4>
                    </div>
                    <Button
                        style={{color:"var(--info)"}}
                        className="p-button-outlined"
                        icon='pi pi-plus'
                        onClick={(event)=>{
                            this.props.onAdd?.()
                        }}
                    />
                </div>

            </div>

            </>
        )
    }
}