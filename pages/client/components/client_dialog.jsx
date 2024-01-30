import { Dialog } from "primereact/dialog";
import React from "react";
import { scrollToTop } from "../../utils/util";

export default class ClientsDialog extends React.Component{
    constructor(props){
        super(props)
        this.state={
            show: false
        }
    }
    render(){
        return(
            <>
            <Dialog
                header="Clientes"
                draggable={false}
                visible={ this.props.show }
                style={{ width: '90vw', maxWidth:"600px"}}
                blockScroll={true}
                onShow={()=>{scrollToTop()}}
                onHide={()=>{
                    // console.log(this.state.item_original)
                    this.props?.onHide()
                }}
            >
            </Dialog>
            </>
        )
    }
}