import { Component } from "react";
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from "primereact/button";
import { moneyMask } from "../../utils/util";
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';

export default class ProductInfo extends Component{
    constructor(props){
        super(props)
        this.state={
            item:this.props.item,
            item_original:{...this.props.item},
            interval:null,
            canClose:false
        }
    }
    setItem(){
        this.setState({canClose:false})
        this.props?.onHide(this.state.item)
    }
    render(){
        return(
            <Dialog
                onKeyDown={(event)=>{
                    if(event.keyCode == 13){
                        this.setState({canClose:true})
                        if(this.state.interval == null){
                            this.setItem(this.state.item)
                        }
                    }
                }}
                header={this.state.item?.data.name}
                footer={
                    <div className="flex justify-content-between" style={{marginTop:"10px", width:"100%"}}>
                        <Button
                            icon="pi pi-trash"
                            className="p-button-outlined p-button-sm p-button-danger"
                            label="Remover item"
                            onClick={(event)=>{
                                this.props.removeItem(this.state.item)
                            }}
                        />
                        <Button
                            icon="pi pi-send"
                            className="p-button-outlined p-button-sm"
                            label="Enviar para aprovação"
                            onClick={(event)=>{
                                this.setItem();
                            }}
                        />
                    </div>
                }
                visible={ this.props.show }
                style={{ width: '90vw'}}
                onHide={()=>{
                    // console.log(this.state.item_original)
                    this.props?.onHide(this.state.item_original)
                }}
                onShow={()=>{
                    this.setState({
                        item:this.props.item,
                        item_original:{...this.props.item}
                    })
                }}>
                    <div className="show_on_mobile" style={{textAlign:"center"}}>
                        <img alt="Product Card"
                            src={this.props.item?.data.photo.img?  this.props.item?.data.photo.img: "images/sem_foto.jpg"}
                            onError={(e) => e.target.src='images/sem_foto.jpg'}
                            style={{
                                width:'50vw',
                                maxWidth:"250px",
                                borderRadius:"10px",
                                marginBottom:"10px"
                            }}
                        />
                        {/* <p>{this.props.item?.data.name}</p> */}
                        
                    </div>
                    <div style={{display:"flex"}}>
                        <div className="hide_on_mobile"
                            style={{
                                justifyContent:"center",
                                marginTop:"auto",
                                marginBottom:"auto",
                            }}>
                            <img alt="Product Photo"
                                src={this.props.item?.data.photo.img?  this.props.item?.data.photo.img: "images/sem_foto.jpg"}
                                onError={(e) => e.target.src='images/sem_foto.jpg'}
                                style={{
                                    width:'50vw',
                                    maxWidth:"250px",
                                    borderRadius:"10px",
                                    marginRight:"20px"
                                }}
                            />
                        </div>
                        {/* <p>{this.props.item?.data.name}</p> */}
                        <div className="p-fluid grid formgrid">
                            <div className="field sm:col-12 md:col-6 lg:col-3">
                                <label>Quantidade</label>
                                <InputNumber
                                    // mode="decimal"
                                    // minFractionDigits={2}
                                    showButtons buttonLayout="horizontal"
                                    decrementButtonClassName="p-button-danger p-button-outlined"
                                    incrementButtonClassName="p-button-success p-button-outlined"
                                    incrementButtonIcon="pi pi-plus"
                                    decrementButtonIcon="pi pi-minus"
                                    min={1}
                                    value={this.props.item?.quantity}
                                    onChange={(event)=>{
                                        var _item = this.state.item
                                        _item.quantity = event.value
                                        this.setState({item:_item})
                                        // console.log(event.value)
                                    }}
                                />
                            </div>

                            <div className="field sm:col-12 md:col-6 lg:col-3">
                                <label>Desconto</label> {this.state.item?.discount>0 && <i style={{color:"var(--error)", cursor:"pointer"}} className="pi pi-times mr-2" onClick={(event)=>{ var _item = this.state.item; _item.discount = 0; this.setState({item:_item})}}/>}
                                <InputNumber
                                    
                                    value={this.state.item?.discount}
                                    suffix="%"
                                    min={0}
                                    max={100}
                                    onChange={(event)=>{
                                        var discount = event.value
                                        if(discount >= 100){
                                            discount = 100
                                        }
                                        var _item = this.state.item
                                        _item.discount = discount
                                        this.setState({item:_item})
                                        // console.log(event)
                                    }}
                                />
                            </div>
                            
                            <div className="field sm:col-12 md:col-6 lg:col-3">
                                <label>Preço</label>
                                <InputNumber
                                    prefix="R$ "
                                    value={Math.round((this.state.item?.sale_price-(this.state.item?.sale_price*(this.state.item?.discount/100)))*100)/100}
                                    min={0}
                                    max={this.state.item?.sale_price}
                                    onChange={(event)=>{
                                        var setPrice = event.value
                                        var _item = this.state.item
                                        if(this.state.interval) clearInterval(this.state.interval)
                                        this.setState({
                                            interval: setInterval(()=>{
                                                if(setPrice > _item.data.price) setPrice = _item.data.price
                                                _item.discount = 100 - ((setPrice*100)/this.state.item?.data.price)
                                                clearInterval(this.state.interval)
                                                this.setState({item: _item, interval:null},()=>{
                                                    if(this.state.canClose == true){
                                                        this.setItem(this.state.item)
                                                    }
                                                })
                                            },500)
                                        })
                                    }}
                                />
                            </div>
                            
                            <div className="field sm:col-12 md:col-6 lg:col-3">
                                <label>Total</label>
                                <InputText value={moneyMask((this.state.item?.sale_price-(this.state.item?.sale_price*(this.state.item?.discount/100))) * this.state.item?.quantity)} disabled/>
                            </div>
                            
                            <div className="col-12">
                                <label>Comentário</label>
                                <InputTextarea/>
                            </div>

                        </div>
                    </div>

                    
                </Dialog>
        )
    }
}