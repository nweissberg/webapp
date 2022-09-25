import React from "react";
import { Button } from 'primereact/button';
import { deepEqual, moneyMask } from "../../utils/util";
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
// import AnimatedNumbers from "react-animated-numbers";
import localForage from "localforage";
import { InputText } from "primereact/inputtext";

const pedidos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

export default class SalesFooter extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            sale_total:0,
            num:0,
            isSaved:true,
            save_name:""
        }
        
        this.accept = this.accept.bind(this);
        // this.reject = this.reject.bind(this);
        this.confirmSave = this.confirmSave.bind(this);
    }

    accept(event) {
        // console.log(event)
        this.setState({save_visible:false})
        var _sale_cart = {...this.props.sale_cart}
        _sale_cart.name = this.state.save_name
        pedidos_db.setItem( this.props.user.uid, _sale_cart ).then(()=>{
            this.setState({isSaved:true})
            this.toast.show({ severity: 'info', summary: 'Sucesso', detail: `Pedido ${this.state.save_name} salvo!`, sticky: true });
            console.log("Pedido Salvo")
            this.props.save_cart?.(_sale_cart)
        })
    }

    // reject() {
    //     this.toast.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    // }

    confirmSave(event) {
        confirmPopup({
            target: event.currentTarget,
            message: this.state.save_name?"Salvar pedido?":"Nome do pedido rascunho?",
            icon: 'pi pi-save',
            footer:
            <div className="p-input-group m-2">
                <InputText
                    style={{
                        width:'calc(100% - 40px)',
                    }}
                    // value={this.save_name}
                    placeholder={this.state.save_name?this.state.save_name:"Digite aqui..."}
                    type="text"
                    onChange={(event)=>{
                        this.setState({save_name:event.target.value})
                    }}
                />
                <Button
                    // disabled={this.state.save_name==""?true:false}
                    className="p-button-outlined"
                    icon="pi pi-check"
                    onClick={()=>{
                        this.accept()
                    }}
                />
            </div>,
            // accept: this.accept,
            // reject: this.reject
        });
    }

    componentDidMount(){
        // console.log("Did mount", this.props.sale_cart.name)
        
        if(this.props.user && this.props.sale_cart.items.length > 0){
            pedidos_db.getItem(this.props.user.uid).then((data)=>{
                if(data){
                    this.setState({isSaved:true, save_name:data.name})
                }else{
                    this.setState({isSaved:true})
                }
            })
        }
    }
    // componentWillUnmount(){
    //     console.log("Will unmount")
    // }
    componentDidUpdate(){
        // console.log("Did update", this.props.sale_cart.name)

        if(this.state.save_name != this.props.sale_cart.name){
            this.setState({save_name:this.props.sale_cart.name, isSaved:true})
        }

        if(this.state.isSaved){
            pedidos_db.getItem(this.props.user.uid).then((data)=>{
                if(data){
                    const isEqual = deepEqual(this.props.sale_cart.items,data.items)
                    if(isEqual == false){
                        this.setState({isSaved:false})
                    }
                }else{
                    this.setState({isSaved:false})
                }
            })
        }
    }
    render(){
        return(
            <div className="flex justify-content-between flex-wrap"
                    style={{
                        height:"auto",
                        width:"100%",
                        position:"fixed",
                        color:"var(--text)",
                        bottom:"0px",
                        backgroundColor:"var(--glass)",
                        backdropFilter: "blur(10px)",
                        padding:"10px",
                        zIndex:3
                    }}
                >   
                    {/* <div style={{position:"absolute"}}> */}
                    <ConfirmPopup
                        style={{position:"absolute"}}
                        visible={this.state.save_visible}
                        onHide={(event) => {
                            this.setState({save_visible:false})
                        }}
                        closeOnEscape={(even)=>{
                            console.log(event)
                        }}
                    />

                    {/* </div> */}
                    <div className="flex justify-content-between flex-wrap" style={{width:"69%"}}>
                        <div className="flex align-items-start justify-content-center"
                        style={{
                            justifyContent:"center",
                            marginTop:window.innerWidth<500?"10px":"auto",
                            marginBottom:"auto",
                        }}>
                            <Button
                                className="p-button-small p-button-outlined"
                                style={{color:"var(--text)"}}
                                icon="pi pi-user-plus"
                                label={window.innerWidth<500?"":"Adicionar Cliente"}
                            />
                        </div>
                        <div className="flex flex-column align-items-end">
                            <div style={{display:"inline-flex"}}>
                                <span style={{
                                    // fontSize:"calc(3vw + 3vh)",
                                    marginTop:"-10px",
                                    marginBottom:"-5px",
                                    fontSize:"40px"//window.innerWidth > 500?"40px":"calc((75vw - 4rem) / 8)",
                                }}> { moneyMask(this.props.sale_cart.items.length > 0 ? this.props.sale_cart.items.map((item)=>{return((item.data.price-(item.data.price*(item.discount/100)))*item.quantity)}).reduce((sum,i)=> sum + i) : 0) }</span>
                            </div>
                            {this.props.sale_cart.items.length > 1 && <div>
                                <Button
                                    label={this.props.sale_cart.items.length + " itens"}
                                    className="p-button-sm p-button-text p-button-secondary"
                                    icon="pi pi-shopping-cart"
                                    style={{
                                        height:"20px",
                                        color:"var(--info)"
                                    }}
                                    onClick={()=>{
                                        this.props.updateProducts()
                                    }}
                                />
                            </div>}
                        </div>
                    </div>

                    <div className="flex flex-column" style={{ width:"29%" }}>
                        
                        <Button
                            disabled={this.props.sale_cart.items.length == 0 || this.state.isSaved}
                            iconPos="right"
                            icon={this.state.isSaved?"pi pi-check":"pi pi-save"}
                            label={this.state.isSaved?"Salvo":(window.innerWidth>500?"Salvar Pedido":"Salvar")}
                            className="p-button-sm p-button-secondary"
                            style={{
                                background:"var(--glass-c)",
                                border:"0px",
                                color:"var(--text)"
                            }}
                            onClick={this.props.sale_cart.name==""?this.confirmSave:this.accept}
                        />
                        <Button
                            disabled={this.props.sale_cart.items.length == 0}
                            iconPos="right"
                            icon="pi pi-percentage"
                            label={window.innerWidth>500?"Calcular Impostos":"Impostos"}
                            className="p-button-sm mt-1 p-button-secondary"
                            style={{
                                background:"var(--glass-c)",
                                border:"0px",
                                color:"var(--text)"
                            }}
                        />
                    </div>
                    <Toast ref={(el) => this.toast = el} position="bottom-left"/>
                </div>
            
        )
    }
}