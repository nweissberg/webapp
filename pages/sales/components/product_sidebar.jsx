import React from "react";
import { Button } from 'primereact/button';
import { average_array, deepEqual, moneyMask, sum_array } from "../../utils/util";
import localForage from "localforage";
import { api_get } from "../../api/connect";
import { InputNumber } from "primereact/inputnumber";
import Barcode from "./make_barcode";
import ProductIcon from "../../profile/components/product_photo";
import LineChart from "../../components/chart_line";
import { SelectButton } from "primereact/selectbutton";
import { Skeleton } from "primereact/skeleton";

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
            inventory:[],
            documentos:[],
            history:[],
            chart_mode:"Mês"
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
            // "SALDO":{
            //     label:"Estoque",
            //     return:( text => this.getInventory(text) )
            // }
        }
    }

    getInventory(){
        if(this.state.inventory == null){
            return("Vazio")
        }
        
        if(this.state.inventory.length == 0){
            return(<div>
                <label className="flex justify-content-end text-right text-gray-300">Estoque</label>
                <Skeleton className="w-10rem"/>
            </div>)
        }
        return(<div className="text-right">
            <label className="text-gray-300">Estoque</label>
            {this.state.inventory.map((company,k)=>{
            return(<div key={k}>
                <label>
                    {company.name}
                </label>
                
                    {(company.saldo == 0?<h5 className="text-orange-500">Vazio</h5>:<h5 className="text-green-500">{company.saldo}</h5>)}
                
            </div>)
        })}
        </div>)
    }
    
    getGroup(group_id){
        if(this.props.groups == undefined) return
        var _group = this.props.groups.find((item)=>item.id.toString()==group_id)
        return(_group?.nome)
    }

    analize(data,mode="Mês"){
        // console.log(data)
        if(!data)return(null)
        let merged_data = {}
        if(data.length == 0) return "NO_DATA"
        
        data?.map?.(i => {
            i.date = new Date(i.data_emissao)
            const index = mode=="Dia"?i.date.getTime():i.date.getYear()+"_"+i.date.getMonth()
            // console.log(index)
            merged_data[index] ||= {
                quantidades: [],
                valores:[],

            }
            merged_data[index].quantidades.push(i.quantidade)
            merged_data[index].valores.push(i.valor_unitario)
            merged_data[index].date = i.date
            // return(i)
        })
        
        return Object.values(merged_data)
        .map(point => {
            return({
                quantidade:sum_array(point.quantidades),
                valor:average_array(point.valores),
                date:new Date(point.date)
            })
        })
    }

    getHistory(_item){
        if(!this.props.item) return
        this.setState({history:[]})
        api_get({
            credentials:"0pRmGDOkuIbZpFoLnRXB",
            keys:[{
                key: "produto_id",
                type:"STRING",
                value: this.props.item?.PRODUTO_ID
            }],
            query:"qIPuh9aoAKK3QePT7Rsa"
        }).then(async(data)=>{
            // console.log("TESTE ",data)
            if(data?.length <= 2){
                this.setState({history:"NO_DATA"})
            }else{
                this.setState({
                    documentos:data,
                    history:this.analize(data)
                })
            }
        })
    }

    componentDidMount(){
        this.getHistory()
    }

    render(){
        
        if(this.props.item && this.state.item?.PRODUTO_ID != this.props.item?.PRODUTO_ID ){
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
            this.setState({item:this.props.item})
        }
        const panel_style = {
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
        }
        if(!this.props.item)return(<div style={panel_style}></div>)
        return(
            <div className={"flex flex-wrap justify-content-center " + (this.props.anim!=false?"enter_right_anim":"")}
            style={panel_style}>
            {this.props.sidebar==true && this.props.close==false && <div style={{width:"100%", zIndex:1, position:"sticky", top:"0px"}}>
                <Button className="p-button-outlined p-button-rounded bg-glass-c border-3 text-white border-blue-400 hover:bg-bluegray-800"
                    style={{
                        top:this.props.close!=false?"0px":"-20px"
                    }}
                    label="Voltar"
                    icon="pi pi-chevron-left"
                    // iconPos="right"
                    onClick={(event)=>{
                        // this.setState({item:null})
                        this.props.onHide?.()
                    }}/>
            </div>}
            <div style={{width:"100%"}}>
                
                <div style={{textAlign:"center", paddingBottom:"80px"}}>
                
                    <div className="flex w-full h-full justify-content-between align-items-center text-right p-3">
                        <ProductIcon item={this.props.item.PRODUTO_ID}  size="5"/>
                        <div style={{marginBottom:"20px"}}>
                            <h5>{this.props.item.PRODUTO_NOME}</h5>
                        </div>
                    </div>
                    
                    
                    
                    {this.props.item?.sold && 
                    <div className="flex justify-content-center mt-4" style={{
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
                            className="p-button-lg p-button-rounded p-button-outlined border-2 mt-4"
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
                                        onContextMenu={(e)=>{
                                            e.stopPropagation()
                                            e.preventDefault()
                                        }}
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
                                    onContextMenu={(e)=>{
                                        e.stopPropagation()
                                        e.preventDefault()
                                    }}
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
                                    onContextMenu={(e)=>{
                                        e.stopPropagation()
                                        e.preventDefault()
                                    }}
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
                                    onContextMenu={(e)=>{
                                        e.stopPropagation()
                                        e.preventDefault()
                                    }}
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

                            

                            <div className="flex-grow-1 flex justify-content-end" style={{
                                whiteSpace:"nowrap",
                                textAlign:"right"
                                // overflowX:"scroll"
                                // position:"absolute",
                                // right:"10px"
                            }}>
                                <label>Total</label>
                                <h2>{moneyMask((this.props.item?.PRECO-(this.props.item?.PRECO*(this.props.item_selected.discount/100))) * this.props.item_selected.quantity)}</h2>
                            </div>

                        </div>}
                        <LineChart
                        className="flex w-full h-20rem mt-4 mb-2"
                        orders={this.state.history}
                        dateFormat={this.state.chart_mode == "Mês"?{
                            month: "short",
                            year: "2-digit"
                        }:{
                            day:"2-digit",
                            month: "short",
                            year: "2-digit"
                        }}
                    />
                    {this.state.documentos?.length >= 1 && <SelectButton
                        unselectable={false}
                        value={this.state.chart_mode}
                        options={["Mês","Dia"]}
                        onChange={(e) => {
                            let _history = this.analize(this.state.documentos,e.value)
                            this.setState({chart_mode:e.value, history:_history})
                        }}
                    />}
                    <div className="flex justify-content-between ">

                        <div className="flex-grow-1 col-6" style={{textAlign:"left"}}>

                            {Object.keys(this.info_keys).map((key)=>{
                                if(this.props.item[key] == "0") return(<div key={key}></div>)
                                if(key=="SALDO" && this.props.check_rule(this.props.user,"VER_SEM_ESTOQUE") == false ) return(<div key={key}></div>)
                                return(
                                <div key={key}>
                                    <label className="text-gray-300">{this.info_keys[key].label}</label>
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
                        {this.getInventory()}
                        
                    </div>
                        {this.props.item.COD_BARRA != "" && this.props.item.COD_BARRA != "SEM GTIN" && <div style={{textAlign:"center", paddingTop:"10px"}}>
                            <Barcode data={this.props.item.COD_BARRA} style={{width:"90%", maxWidth:"333px"}}/>
                        </div>}
                        <div style={{paddingBottom:"30px"}}></div>
                </div>
                
            </div>
            {this.props.item_selected &&
                <Button className="bg-blur-1 bg-black-alpha-50 z-1 hover:bg-bluegray-900 flex border-2 sticky bottom-0 p-button-success p-button-outlined p-button-rounded p-button-lg"
                    icon='pi pi-check'
                    label='Finalizar'
                    onClick={(event)=>{
                        this.props.onHide?.()
                    }}
                />
            }
        </div>
        )
    }
}