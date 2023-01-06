import { Component } from "react";
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from "primereact/button";
import { moneyMask } from "../../utils/util";
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import localForage from "localforage";

const photos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'fotografias'
});

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
        if(this.props.item.data?.photo_uid && this.state.photo == null){
            photos_db.getItem(this.props.item.data.photo_uid).then((photo_data)=>{
                if(photo_data){
                    const _photo ="data:image/png;base64," + new Buffer.from(photo_data.img_buffer).toString("base64")
                    // console.log(photo_data)
                    this.setState({photo:_photo})
                }
                // api_get({
                //     credentials:"0pRmGDOkuIbZpFoLnRXB",
                //     keys:[{
                //         key: "Produto_ID",
                //         type:"STRING",
                //         value: this.props.item.data.PRODUTO_ID
                //     }],
                //     query:"7q4Wx2SmYerjTirTQPK0"
                // }).then((data)=>{
                //     console.log(data)
                // })
            })
        }
        
        if(this.state.item.data?.PRODUTO_ID != this.props.item.data?.PRODUTO_ID ){
            this.setState({photo:null,item:this.props.item.data})
        }
        if(!this.props.item.data)return(<></>)
        return(
            <Dialog
                draggable={false}
                onKeyDown={(event)=>{
                    if(event.keyCode == 13){
                        this.setState({canClose:true})
                        if(this.state.interval == null){
                            this.setItem(this.state.item)
                        }
                    }
                }}
                header={
                    <div>
                        {this.state.item?.data.PRODUTO_NOME}
                    </div>
                }
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
                            icon="pi pi-check"
                            className="p-button-outlined p-button-sm"
                            label="Salvar Alteração"
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
                            src={this.state.photo? this.state.photo : `images/grupos/${this.props.item.data.ID_CATEGORIA}_null.jpg`}
                            onError={(e) => e.target.src='images/sem_foto.jpg'}
                            style={{
                                width:'50vw',
                                maxWidth:"250px",
                                borderRadius:"10px",
                                marginBottom:"10px"
                            }}
                        />
                        {/* <p>{this.props.item?.data.PRODUTO_NOME}</p> */}
                        
                    </div>
                    <div style={{display:"flex"}}>
                        <div className="hide_on_mobile"
                            style={{
                                justifyContent:"center",
                                marginTop:"auto",
                                marginBottom:"auto",
                            }}>
                            <img alt="Product Photo"
                                src={this.state.photo? this.state.photo : `images/grupos/${this.props.item.data.ID_CATEGORIA}_null.jpg`}
                                onError={(e) => e.target.src='images/sem_foto.jpg'}
                                style={{
                                    width:'50vw',
                                    maxWidth:"250px",
                                    borderRadius:"10px",
                                    marginRight:"20px"
                                }}
                            />
                        </div>
                        {/* <p>{this.props.item?.data.PRODUTO_NOME}</p> */}
                        <div className="flex p-fluid grid formgrid">

                            <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-3">
                                <label>Preço</label>
                                    <InputNumber
                                        prefix="R$ "
                                        value={Math.round((this.state.item?.data.PRECO-(this.state.item?.data.PRECO*(this.state.item?.discount/100)))*100)/100}
                                        min={0}
                                        max={this.state.item?.data.PRECO}
                                        onChange={(event)=>{
                                            var setPrice = event.value
                                            var _item = this.state.item
                                            if(this.state.interval) clearInterval(this.state.interval)
                                            this.setState({
                                                interval: setInterval(()=>{
                                                    if(setPrice > _item.data.PRECO) setPrice = _item.data.PRECO
                                                    _item.discount = 100 - ((setPrice*100)/this.state.item?.data.PRECO)
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

                            <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-3">
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

                            <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-3">
                                <label>Desconto</label> {this.state.item?.discount>0 && <i style={{color:"var(--error)", cursor:"pointer"}} className="pi pi-times mr-2" onClick={(event)=>{ var _item = this.state.item; _item.discount = 0; this.setState({item:_item})}}/>}
                                <InputNumber
                                    style={{
                                        width:"content-max"
                                    }}
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
                            
                            <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-3" style={{
                                whiteSpace:"nowrap",
                                overflowX:"scroll"
                            }}>
                                <label>Total</label>
                                <h3>{moneyMask((this.state.item?.data.PRECO-(this.state.item?.data.PRECO*(this.state.item?.discount/100))) * this.state.item?.quantity)}</h3>
                            </div>

                            <div className="field col-12">
                                <label>Comentário</label>
                                <InputTextarea/>
                            </div>

                        </div>
                    </div>

                    
                </Dialog>
        )
    }
}