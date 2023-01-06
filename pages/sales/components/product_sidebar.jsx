import React from "react";
import { Button } from 'primereact/button';
import { deepEqual, moneyMask } from "../../utils/util";
import JsBarcode from "jsbarcode";
import localForage from "localforage";
import { api_get } from "../../api/connect";
import { InputNumber } from "primereact/inputnumber";
import FlipCard from "../../components/flip_card";
import { ToggleButton } from "primereact/togglebutton";

const photos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'fotografias'
});

var companies_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'empresas'
});

const vendedores_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'vendedores'
});

export default class ProductSidebar extends React.Component{
    constructor(props){
        super(props)
        
        this.state = {
            item:null,
            inventory:[]
        }

        this.info_keys = {
            "PRODUTO_ID":{
                label:"ID Material"
            },
            "ID_CATEGORIA":{
                label:"Categoria",
                return:( text => this.getGroup(text) )
            },
            "PRECO":{
                label:"Preço Tabela",
                sufix:( item => item.ABREVIATURA?.toLowerCase() ),
                return:( text => moneyMask(text) )
            },
            "MARCA":{
                label:"Marca"
            },
            "GRAMATURA":{
                label:"Gramatura",
                sufix:"g/m²"
            },
            "LARGURA":{
                label:"Largura",
                sufix:"cm"
            },
            "COMPRIMENTO":{
                label:"Comprimento",
                sufix:"cm"
            },
            "NCM":{
                label:"Código Produto NCM"
            },
            "SALDO":{
                label:"Estoque",
                return:( text => this.getInventory(text) )
            }
        }
    }

    getInventory(){
        if(this.state.inventory == null){
            return("Vazio")
        }
        if(this.state.inventory.length == 0){
            return(<i className="pi pi-spin pi-spinner" style={{'fontSize': '1em'}}></i>)
        }
        return(this.state.inventory.map((company)=>{
            return(company.name+"\n "+(company.saldo == 0?"Vazio":company.saldo)+"\n")
        }).join("\n"))
    }

    getGroup(group_id){
        if(this.props.groups == undefined) return
        var _group = this.props.groups.find((item)=>item.id.toString()==group_id)
        return(_group.nome)
    }
    makeBarcode(){
        if(this.props.item != null && this.props.item.COD_BARRA != "" && this.props.item.COD_BARRA != "SEM GTIN"){
            try{
                JsBarcode("#barcode", this.props.item.COD_BARRA,{ format: "EAN13",width:3,height:100 });
            }
            catch(e){
                console.error(e)
            }
        }
    }
    componentDidMount(){
        this.makeBarcode()
    }
    
    render(){
        if(this.props.item?.photo_uid && this.state.photo == null){
            photos_db.getItem(this.props.item.photo_uid).then((photo_data)=>{
                if(photo_data){
                    const _photo ="data:image/png;base64," + new Buffer.from(photo_data.img_buffer).toString("base64")
                    // console.log(photo_data)
                    this.setState({photo:_photo})
                }
            })
        }
        
        if(this.props.item?.PRODUTO_ID != this.props.item?.PRODUTO_ID ){
            this.setState({inventory:[]})
            api_get({
                credentials:"0pRmGDOkuIbZpFoLnRXB",
                keys:[{
                    key: "Produto_ID",
                    type:"STRING",
                    value: this.props.item.PRODUTO_ID
                }],
                query:"7q4Wx2SmYerjTirTQPK0"
            }).then(async(data)=>{
                if(data){
                    if(data.length == 0){
                        this.setState({inventory:null})
                        return(null)
                    }

                    console.log(data)
                    var inventory_data = []
                    var _invetory = data.map(async(company)=>{
                        await companies_db.getItem(company.empresa_id.toString()).then((company_info)=>{
                            // console.log(company_info)
                            // company.id = company_info.id
                            company.name = company_info.fantasia
                            inventory_data.push(company)
                        })
                    })
                    await Promise.all(_invetory)
                    
                    if(this.props.check_rule(this.props.user,"ESTOQUE_GLOBAL")){
                        // console.log(this.props.user)
                        this.setState({inventory:inventory_data})
                    }else{
                        vendedores_db.getItem(this.props.user.email).then((vendedor)=>{
                            if(vendedor){
                                // console.log(vendedor.EMPRESA)
                                inventory_data = inventory_data.filter((empresa)=>empresa.empresa_id.toString()==vendedor.EMPRESA)
                                // console.log(inventory_data)
                                this.setState({inventory:inventory_data})
                            }
                        })
                    }
                }
            })
            this.setState({photo:null,item:this.props.item})
        }
        if(!this.props.item)return(<></>)
        return(
            <div className={"flex flex-wrap justify-content-center " + (this.props.anim!=false?"enter_right_anim":"")}
            style={{
                position:"absolute",
                background:"var(--glass-c)",
                backdropFilter: "blur(10px)",
                color:"var(--text)",
                width:"30%",
                right:"0px",
                overflow:"scroll",
                height:"100vh",
                padding:"10px",
                paddingTop:"30px",
                ...this.props?.style
            }}>
            {this.props.sidebar==true && this.props.close==false && <div style={{width:"100%", position:"sticky", top:"0px"}}>
                <Button className="p-button-rounded"
                    style={{
                        top:this.props.close!=false?"0px":"-20px"
                    }}
                    // label="Fechar"
                    icon="pi pi-times"
                    // iconPos="right"
                    onClick={(event)=>{
                        // this.setState({item:null})
                        this.props.onHide?.()
                    }}/>
            </div>}
            <div style={{width:"100%"}}>
                
                <div style={{textAlign:"center", paddingBottom:"80px"}}>
                    <img alt="Product Card"
                        src={this.state.photo? this.state.photo : `images/grupos/${this.props.item.ID_CATEGORIA}_null.jpg`}
                        onError={(e) => e.target.src='images/sem_foto.jpg'}
                        style={{width:"250px", borderRadius:"10px", marginBottom:"10px"}}
                    >
                    
                    </img>
            
                    <div style={{marginBottom:"20px"}}>
                        <h4>{this.props.item.PRODUTO_NOME}</h4>
                    </div>
                    
                    {this.props.item?.sold && 
                    <div className="flex justify-content-center" style={{
                        // position:"sticky",
                        // backgroundColor:"red",
                        top:"-10px",
                        height:"auto",
                        width:"100%",
                        marginBottom:"20px"
                    }}>
                        <div>
                            <i className="pi pi-star-fill" style={{color:"gold",'fontSize': '4em'}}></i>
                            {this.props.item?.top >1? <div className="flex align-items-end gap-1">
                                <h3 style={{marginBottom:"10px"}}>N°</h3>
                                <h1>{this.props.item?.top}</h1>
                                {/* <h3 style={{marginBottom:"10px"}}>+vendido</h3> */}
                            </div>:<h3 style={{color:"gold"}}>Campeão</h3>}
                        </div>
                
                    </div>}
                    {!this.props.item_selected && this.props.editable != false && <div>
                        <Button
                            className="p-button-lg p-button-rounded p-button-outlined"
                            icon="pi pi-plus"
                            label="Vender"
                            onClick={(event)=>{
                                this.props.onAddProduct?.(this.props.item)
                            }}
                        />
                    </div>}
                    {this.props.item_selected && <div style={{
                            textAlign:"right",
                            height:"100%",
                            width:"100%"
                            // backgroundColor:"var(--glass-b)"
                            }}
                            className="flex col-6 p-fluid grid formgrid">
                            
                            <div className="flex-grow-1 field col-4">
                                <label>Preço</label>
                                    <InputNumber
                                        onClick={(e)=>e.stopPropagation()}
                                        prefix="R$ "
                                        value={Math.round((this.props.item?.PRECO-(this.props.item?.PRECO*(this.props.item_selected.discount/100)))*100)/100}
                                        min={0}
                                        max={this.props.item?.PRECO}
                                        onChange={(event)=>{
                                            var setPrice = event.value
                                            var _item = this.props.item_selected
                                            if(this.state.interval) clearInterval(this.state.interval)
                                            this.setState({
                                                interval: setInterval(()=>{
                                                    if(setPrice > this.props.item.PRECO) setPrice = this.props.item.PRECO
                                                    _item.discount = 100 - ((setPrice*100)/this.props.item?.PRECO)
                                                    clearInterval(this.state.interval)
                                                    this.setState({item: _item, interval:null},()=>{
                                                        this.props.updateProduct(_item)

                                                    })
                                                },500)
                                            })
                                        }}
                                    />
                                
                            </div>

                            <div className="flex-grow-1 field col-2">
                                <div style={{whiteSpace:"nowrap",marginBottom:"8px"}}>
                                    <label>Desconto</label>
                                    {this.props.item_selected?.discount>0 &&
                                    <Button style={{
                                        position:"absolute",
                                        color:"var(--error)",
                                        cursor:"pointer",
                                        pointerEvents:"all",
                                        transform:"TranslateY(-10px)"
                                    }}
                                    className="p-button-text p-button-rounded"
                                    icon="pi pi-times"
                                    onClick={(event)=>{
                                        event.stopPropagation();
                                        var _item = this.props.item_selected
                                        _item.discount = 0
                                        this.props.updateProduct(_item)
                                        }}
                                    />}
                                </div>
                                <InputNumber
                                    onClick={(e)=>e.stopPropagation()}
                                    style={{
                                        width:"content-max"
                                    }}
                                    value={this.props.item_selected.discount?this.props.item_selected.discount:0}
                                    suffix="%"
                                    min={0}
                                    max={100}
                                    onChange={(event)=>{
                                        var discount = event.value
                                        if(discount >= 100){
                                            discount = 100
                                        }
                                        var _item = this.props.item_selected
                                        _item.discount = discount
                                        this.props.updateProduct(_item)
                                        // console.log(event)
                                    }}
                                />
                            </div>

                            <div className="flex-grow-1 field col-5">
                                <label>Quantidade</label>
                                <InputNumber
                                    onClick={(e)=>e.stopPropagation()}
                                    // mode="decimal"
                                    // minFractionDigits={2}
                                    showButtons buttonLayout="horizontal"
                                    decrementButtonClassName="p-button-danger p-button-outlined"
                                    incrementButtonClassName="p-button-success p-button-outlined"
                                    incrementButtonIcon="pi pi-plus"
                                    decrementButtonIcon="pi pi-minus"
                                    min={0}
                                    max={14000}
                                    value={this.props.item_selected.quantity}
                                    onChange={(event)=>{
                                        var _item = this.props.item_selected
                                        if(event.value == 0){
                                            this.props.removeItem(_item)
                                        }
                                        _item.quantity = event.value// > 0? event.value : 1
                                        this.props.updateProduct(_item)
                                        // console.log(event.value)
                                    }}
                                />
                            </div>

                            <div className="flex-grow-1 field col-4">
                                <label>Uso e Consumo</label>
                                <Button 
                                className={"pl-0 pr-0 p-button-rounded "+( this.props.item_selected.internal_use? "" :"p-button-outlined")}
                                    value={this.props.item_selected.internal_use}
                                    onClick={(e) => {
                                        e.stopPropagation()

                                        const _internal_use = !this.props.item_selected.internal_use
                                        
                                        var _item = this.props.item_selected
                                        _item.internal_use = _internal_use

                                        this.setState({internal_use: _internal_use})
                                        this.props.updateProduct(_item)
                                    }}
                                    label={this.props.item_selected.internal_use?"Sim":"Não"}
                                    style={{marginLeft:'auto'}}
                                />
                            </div>

                            

                            <div className="flex-grow-1 field col-6" style={{
                                whiteSpace:"nowrap",
                                // overflowX:"scroll"
                                // position:"absolute",
                                // right:"10px"
                            }}>
                                <label>Total</label>
                                <h2>{moneyMask((this.props.item?.PRECO-(this.props.item?.PRECO*(this.props.item_selected.discount/100))) * this.props.item_selected.quantity)}</h2>
                            </div>

                        </div>}
                    <div className="">
                        <div className="flex-grow-1 col-6" style={{textAlign:"left"}}>

                            {Object.keys(this.info_keys).map((key)=>{
                                if(this.props.item[key] == "0") return(<></>)
                                if(key=="SALDO" && this.props.check_rule(this.props.user,"VER_SEM_ESTOQUE") == false ) return(<></>)
                                return(
                                <div key={key}>
                                    <label>{this.info_keys[key].label}</label>
                                    <div style={{whiteSpace:"pre-wrap", display:"flex"}}>
                                        <h5>
                                            {
                                                this.info_keys[key].return
                                                ?
                                                this.info_keys[key].return(this.props.item[key])
                                                :
                                                this.props.item[key]
                                            }
                                        </h5>
                                        {this.info_keys[key].sufix && <span>{" "+ (typeof(this.info_keys[key].sufix) == 'function'?this.info_keys[key].sufix(this.props.item):this.info_keys[key].sufix) }</span>}
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                    </div>
                        {this.props.item.COD_BARRA != "" && this.props.item.COD_BARRA != "SEM GTIN" && <div style={{textAlign:"center", paddingTop:"10px"}}>
                            <svg style={{borderRadius:"5px"}} id="barcode"/>
                        </div>}
                        <div style={{paddingBottom:"30px"}}></div>
                </div>
            </div>
        </div>
        )
    }
}