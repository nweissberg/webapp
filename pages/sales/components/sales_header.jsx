import React from "react";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

export default class SalesHeader extends React.Component{
    constructor(props){
        super(props)
        this.state={

        }
    }
    render(){
        return(
            <div style={{
                paddingTop:"4px",
                paddingInline:"10px",
                width:"100%",
                height:"50px",
                position:"absolute",
                top:"0px",
                backdropFilter: "blur(10px)",
                background:"var(--glass-c)",
                zIndex:4
            }}>
                <div className="flex justify-content-between">
                    <Button
                        style={{
                            marginRight:"8px"
                        }}
                        label={window.innerWidth > 960?(this.state.show_cart? "Buscar" : "Carrinho"):""}
                        icon={ this.state.show_cart? "pi pi-search" : "pi pi-shopping-cart" }
                        onClick={(e)=>{
                            this.props.select_item?.(null)
                            this.setState({show_cart:!this.state.show_cart, item_info: null})
                        }}
                    />
                
                    
                    {!this.state.show_cart &&<div>
                        <InputText
                            value={this.state.search}
                            style={{
                                width:"33vw",
                                minWidth:"200px"
                            }}
                            placeholder="Buscar..."
                            onChange={(event)=>{
                                this.props.select_item?.(null)
                                // console.log(event.target.value)
                                this.setState({search:event.target.value},()=>{this.get_search()})
                            }}
                            onKeyDown={(event)=>{
                                // console.log(event.target.value)
                                // this.get_search()
                            }}
                        />

                    </div>}
                    <Button
                        style={{marginLeft:"8px", color:"var(--text)"}}
                        label={window.innerWidth > 960? "Criar Filtro": ""}
                        icon="pi pi-filter"
                        iconPos="right"
                        className="p-button-outlined"
                        onClick={(event)=>{
                            
                        }}
                    />
                </div>
            </div>
        )
    }
}