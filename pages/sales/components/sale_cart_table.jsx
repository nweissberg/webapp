import React from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import QuantityInput from "./quantity_input";
import { capitalize, moneyMask, shorten, time_ago } from "../../utils/util";
import { InputText } from "primereact/inputtext";
import JsBarcode from "jsbarcode";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import localForage from "localforage";
import { InputNumber } from "primereact/inputnumber";
// import ProductSidebar from "./product_sidebar";
import Swal from "sweetalert2";
import { set_data } from "../../api/firebase";
import { Timeline } from "primereact/timeline";
import { Card } from 'primereact/card';
import { Sidebar } from "primereact/sidebar";
import OrderTimeline from "../../order/components/order_timeline";

const photos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'fotografias'
});

export default class SalesCartTable extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            loaded_photos:{},
            selected_products:[],
            loaded_barcodes:{},
            editingRows:[],
            show_timeline:false
        }
        this.clearFilter1 = this.clearFilter1.bind(this);
        this.onGlobalFilterChange1 = this.onGlobalFilterChange1.bind(this);
    }
    
    makeBarcode(barcode){
        
        try{
            return(JsBarcode("#barcode", barcode,{ format: "EAN13",width:3,height:100 }));
        }
        catch(e){
            console.error(e)
        }
    
    }

    componentDidMount() {
        this.initFilters1();
        // console.log(this)
        this.props.onLoad?.(this)
    }

    clearFilter1() {
        this.initFilters1();
    }

    initFilters1() {
        this.setState({
            filters1: {
                'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
                'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
                'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
                'representative': { value: null, matchMode: FilterMatchMode.IN },
                'date': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
                'balance': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
                'status': { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
                'activity': { value: null, matchMode: FilterMatchMode.BETWEEN },
                'verified': { value: null, matchMode: FilterMatchMode.EQUALS }
            },
            globalFilterValue1: ''
        });
    }

    onGlobalFilterChange1(e) {
        const value = e.target.value;
        let filters1 = { ...this.state.filters1 };
        filters1['global'].value = value;

        this.setState({ filters1, globalFilterValue1: value });
    }

    setActiveRowIndex(index) {
        let editingRows = { ...this.state.editingRows, ...{ [`${this.props.sale_cart?.items[index].id}`]: true } };
        this.setState({ editingRows });
    }

    
    productNameEditor = (options) => {
        // console.log(options)
        return (
            <div className="flex align-items-center">{shorten(options.value)}</div>
        );
    }
    
    productQuantityEditor = (options) => {
        console.log(options)
        return (
            <div className="flex-grow-1" style={{
                maxWidth:"100px"
            }}>
                <InputText
                style={{
                    maxWidth:"100px"
                }}
                    // showButtons buttonLayout="horizontal"
                    // decrementButtonClassName="p-button-danger p-button-outlined"
                    // incrementButtonClassName="p-button-success p-button-outlined"
                    // incrementButtonIcon="pi pi-plus"
                    // decrementButtonIcon="pi pi-minus"
                    min={0}
                    max={14000}
                    value={options.value}
                    onChange={(e) => options.editorCallback(e.value)}
                />
            </div>
        );
    }

    fullPriceEditor = (options) => {
        console.log(options)

        return (
            <div className="flex-grow-1">
                <InputNumber
                    value={options.value}
                    onChange={(e) => options.editorCallback(e.value)}
                />
            </div>
        );
    }
    productPhotoEditor = (options) => {
        console.log(options)

        return (<div style={{maxWidth:'0px'}}></div>);
    }
    
    onProductEditComplete = (event) => {
        // console.log(event)
        // set_selected_parents([])
        let _items = [...this.props.sale_cart.items];
        let { newData, index } = event;
        // index = _items.findIndex((user)=>user.email == newData.email)
        // console.log(index)
        // writeRealtimeData("users/"+newData.uid+"/",newData)

        _items[index] = newData;
        // console.log(_items)
        // set_items(_items);
        var _sales_cart = {...this.props.sale_cart}
        _sales_cart.items = _items
        this.props.onUpdateProduct(_sales_cart)
    }
    get_action(){
        var action = {
            name: "Rejeitar",
            value: "rejeitado",
            icon:"pi pi-times"
        }
        if(this.state.selected_products.length == this.props.sale_cart.items.length){
            action = {
                name: "Aprovar",
                value: "aprovado",
                icon: "pi pi-check"
            }
        }else if(this.state.selected_products.length != 0 ){
            action = {
                name:"Dervolver " + (this.props.sale_cart.items.length - this.state.selected_products.length) + " itens",
                value:"devolvido",
                icon:"pi pi-history"
            }
        }
        return(action)
    }
    
    toogle_timeline(){
        this.setState({show_timeline:!this.state.show_timeline})
    }
    
    render(){
        
        const last_action = this.props.sale_cart.history? this.props.sale_cart.history.slice(-1)[0]:null
        return(
            <div style={{
                backdropFilter:"blur(10px)",
                width:'100%',
                height:"100vh",
                top:this.props?.editable != false?"50px":"0px",
                paddingTop:this.props?.editable != false?"50px":"0px",
                paddingBottom:"30px",
                overflowX:"hidden",
                height:window.innerWidth>960?"calc(100vh - 110px)":"100vh",
            }}>
                <Sidebar
                position="right"
                visible={this.state.show_timeline}
                style={{
                    // maxWidth:"auto",
                    width:"max-content",
                    backgroundColor:"var(--glass-c)",
                    backdropFilter:"blur(10px)"
                }}
                onHide={()=>{
                    this.setState({show_timeline:false})
                }}>
                    <OrderTimeline
                        history={this.props.sale_cart.history}
                    />
                </Sidebar>
                <div className={"flex p-2" + (this.props.can_approve?" justify-content-between":" justify-content-center")}
                style={{
                    top:"0px",
                    position:"sticky",
                    backgroundColor:"var(--bg-c)",
                    // backdropFilter:"blur(10px)",
                    border:"1px solid var(--border)",
                    width:"100%",
                    height:"60px",
                    zIndex:2
                }}>
                    {this.props.can_approve?last_action != null && last_action.action != 'enviado'?<icon style={{color:"white"}} className="pi pi-check flex align-items-center ml-1"></icon>:<span
                        className="flex align-items-center"
                        disabled={ this.state.selected_products.length <= 0 }
                        style={{color:"var(--text-c)"}}
                    >{ this.state.selected_products.length == this.props.sale_cart.items.length? "Todos":this.state.selected_products.length == 0 ? "Selecionar":this.state.selected_products.length != this.props.sale_cart.items.lenght? this.state.selected_products.length + " Aprovados" :"Todos"}</span>:<></>}
                    <div className="flex gap-2">
                        <Button
                            label={window.innerWidth > 500 ? "Limpar":""}
                            disabled={this.state.globalFilterValue1 == ''}
                            className="p-button-outlined"
                            icon="pi pi-filter-slash"
                            onClick={(event)=>{
                                this.clearFilter1()
                            }}
                        />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                style={{width:"33vw"}}
                                value={this.state.globalFilterValue1} onChange={this.onGlobalFilterChange1} placeholder="Buscar..." />
                        </span>
                    </div>

                    {/* {this.props?.editable != false && <Button
                        className="p-button-outlined p-button-success"
                        icon="pi pi-pencil"
                        label={window.innerWidth > 500 ? "Editar":""}
                        disabled={ this.state.selected_products.length <= 0 }
                        onClick={(event)=>{
                            this.setActiveRowIndex(1)
                        }}
                    />} */}
                    {last_action != null && last_action.action != 'enviado'?<h5 className="flex align-items-center" style={{color:"var(--text)"}}>{capitalize(last_action.action)}</h5>:
                    this.props?.editable == false && this.props.can_approve && <Button
                        className={"p-button-outlined "+ (this.state.selected_products.length==0? "p-button-danger":this.state.selected_products.length == this.props.sale_cart.items.length?"p-button-success":"p-button-warning")}
                        icon={this.state.selected_products.length==0?"pi pi-times": this.state.selected_products.length == this.props.sale_cart.items.length?"pi pi-check":"pi pi-history"}
                        label={window.innerWidth < 500? "":this.get_action().name}
                        // disabled={ this.state.selected_products.length <= 0 }
                        onClick={(event)=>{
                            // console.log(event)
                            // this.setActiveRowIndex(1)
                            var _sale_cart = {
                                ...this.props.sale_cart,
                                name:this.props.sale_cart.name,
                                items:this.props.sale_cart.items.map(item=>{
                                    var _item = {...item}
                                    delete _item.data
                                    return _item
                                }),
                                client:this.props.sale_cart.client?.id?this.props.sale_cart.client.id:this.props.sale_cart.client
                            }
                            Swal.fire({
                                title: this.get_action().name,
                                input: 'textarea',
                                html: 'Deixe um comentário:',
                                inputAttributes: {
                                  autocapitalize: 'off'
                                },
                                showCancelButton: true,
                                confirmButtonText: 'Confirmar',
                                cancelButtonText: 'Cancelar',
                                showLoaderOnConfirm: true,
                                preConfirm: (comment) => {
                                    if( comment == "" && this.get_action().name != "Aprovar"){
                                        Swal.showValidationMessage(
                                        `Campo obrigatório ao ${this.get_action().name.toLocaleLowerCase()}`
                                        )
                                    }else{
                                        _sale_cart.history.push({
                                            action:this.get_action().value,
                                            date:Date.now(),
                                            comment:comment,
                                            user:this.props.user.uid
                                        })
                                        console.log(_sale_cart)
                                        set_data("orders",this.props.sale_cart.uid,_sale_cart)
                                    }
                                },
                                allowOutsideClick: () => !Swal.isLoading()
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Sucesso!',
                                        text: 'Orçamento encaminhado para a próxima etapa.',
                                        // footer: '<a href="">Why do I have this issue?</a>'
                                    })
                                }
                            })
                        }}
                    />}
                    
                </div>
            
                <DataTable
                    globalFilterFields={[
                        'data.PRODUTO_NOME'
                    ]}
                    filters={this.state.filters1}
                    // header={header1}
                    responsiveLayout="scroll"
                    // breakpoint="500px"
                    // scrollable
                    // stripedRows
                    size="small"
                    value={this.props.sale_cart?.items}
                    selectionMode="row"
                    selection={this.state.selected_products}
                    onSelectionChange={e => {
                        // console.log(e.value)
                        this.setState({selected_products:e.value,selected_item:e.value[0]})
                        
                        // this.props.sidebar?.(e.value[0])
                    }}
                    dataKey="data.PRODUTO_ID"
                    // scrollHeight="calc(100vh -100px)"
                    // scrollable
                    // editMode="row"
                    // editingRows={this.state.editingRows}
                    // onRowEditComplete={this.onProductEditComplete}
                    
                >
                    {last_action != null && last_action.action == 'enviado' && this.props.can_approve && <Column selectionMode="multiple"></Column>}
                    <Column className={this.props?.editable != false?"hide_on_mobile":""} key="photo" field="data.photo" body={(row_data)=>{
                        if(this.state.loaded_photos[row_data.data.photo_uid] == undefined){
                            
                            if(row_data.data.photo_uid) photos_db.getItem(row_data.data.photo_uid).then((photo_data)=>{
                                // console.log(photo_data)
                                if(photo_data){
                                    var _loaded_photos = {...this.state.loaded_photos}
                                    const _photo ="data:image/png;base64," + new Buffer.from(photo_data.img_buffer).toString("base64")
                                    _loaded_photos[row_data.data.photo_uid] = _photo
                                    this.setState({loaded_photos:_loaded_photos})
                                }
                            })
                        }
                        return(<div className="flex justify-content-center align-items-center p-0 ">
                            {/* {((this.state.selected_item && this.state.selected_item.id == row_data.id) || (this.state.selected_products.map((item)=> item.id).indexOf(row_data.id) != -1)) &&
                            <Button className="p-button-rounded p-button-outlined p-button-lg"
                                icon={this.props?.editable != false?"pi pi-pencil":"pi pi-info-circle"}
                                style={{
                                    color:"white",
                                    backdropFilter:"blur(10px)",
                                    background:"var(--glass)",
                                    position:"absolute",
                                    width:"60px",
                                    height:"60px",
                                    fontSize:"4rem"
                                }}
                                onClick={(event)=>{
                                    this.props.onShowInfo?.(this.state.selected_item)
                                }}
                            />} */}
                            <img src={this.state.loaded_photos[row_data.data.photo_uid]? this.state.loaded_photos[row_data.data.photo_uid] : `images/grupos/${row_data.data.ID_CATEGORIA}_foto.jpg`}
                            onError={(e) => e.target.src='images/sem_foto.jpg'}
                            style={{
                                width:'110px',
                                // maxWidth:"250px",
                                borderRadius:"50%",
                                // marginBottom:"10px"
                            }}
                            onClick={(event)=>{
                                event.preventDefault()
                                event.stopPropagation()
                                this.props.onShowInfo?.(row_data)
                            }}></img>
                        </div>)
                    }}
                    // editor={(options) => this.productPhotoEditor(options)}
                    />
                    {this.props?.editable != false && <Column
                        // className="hide_on_mobile"
                        sortable
                        key="quantity"
                        field="quantity"
                        body={(row_data)=>{
                            return(<QuantityInput
                                value={row_data.quantity}
                                onAdd={(event)=>{
                                    this.props.onAddProduct?.(row_data.data)
                                    // console.log(event)
                                }}
                                onSub={(event)=>{
                                    this.props.onSubProduct?.(row_data.data)
                                    // console.log(event)
                                }}
                            />)
                        }} 
                        // editor={(options) => this.productQuantityEditor(options)}
                    ></Column>}

                    {/* <Column sortable key="discount" field="discount"></Column> */}
                    <Column className="show_on_mobile h-8rem" style={{ textAlign:"left"}} alignHeader="center" sortable header="Item" field="data.PRODUTO_NOME" body={(item)=>{
                        return(
                            <>
                            <div className="flex p-0 justifi-content-start">
                            <img className={this.props?.editable == false? "hide_on_mobile": ""} src={this.state.loaded_photos[item.data.photo_uid]? this.state.loaded_photos[item.data.photo_uid] : `images/grupos/${item.data.ID_CATEGORIA}_foto.jpg`}
                            onError={(e) => e.target.src='images/sem_foto.jpg'}
                            style={{
                                width:'60px',
                                // maxWidth:"250px",
                                borderRadius:"50%",
                                // marginBottom:"10px"
                            }}
                            onClick={(event)=>{
                                event.preventDefault()
                                event.stopPropagation()
                                this.props.onShowInfo?.(item)
                            }}></img>
                        </div>
                            <div className="flex align-items-center">{shorten(item.data.PRODUTO_NOME)}</div>
                            </>)
                    }} 
                    // editor={(options) => this.productNameEditor(options)}
                    ></Column>
                    <Column alignHeader="right" sortable header="Preço" field="sale_price" body={(row_data)=>{
                        return(<div style={{ textAlign:"right", width:"100%" }}>
                            {(row_data.discount > 0 || row_data.quantity > 1) && <>
                                {row_data.discount > 0 && <><div style={{whiteSpace:"nowrap", color:"var(--text-b)"}}>
                                    {moneyMask(row_data.sale_price)}
                                </div>
                                <div style={{color:"var(--warn)"}}>
                                    -{Math.round(row_data.discount)}%
                                </div></>}
                                {row_data.quantity > 1 && <>
                                    <div style={{color:"var(--text-c)"}}>
                                        {moneyMask((row_data.sale_price-(row_data.sale_price*(row_data.discount/100))))}
                                    </div>
                                    <div style={{color:"var(--success)"}}>
                                        x{row_data.quantity +" "+ (row_data.data?.ABREVIATURA)?.toLowerCase()}
                                    </div>
                                </>}
                            </>}
                            <div style={{whiteSpace:"nowrap", fontWeight:"bold"}}>
                                {moneyMask((row_data.sale_price-(row_data.sale_price*(row_data.discount/100)))*row_data.quantity)}
                            </div>
                        </div>)
                        
                    }}
                    // editor={(options) => this.fullPriceEditor(options)}
                    ></Column>
                    <Column className="hide_on_mobile" style={{ textAlign:"center"}} alignHeader="center" sortable header="Uso e Consumo" field="internal_use" body={(item)=>{
                        return(item.internal_use?
                            <i className="pi pi-verified" style={{'fontSize': '1.5em',color:"var(--success)"}}/>
                            :
                            <i className="pi pi-times-circle" style={{'fontSize': '1.5em',color:"var(--text-c)"}}/>
                        )
                    }}></Column>
                    <Column className="hide_on_mobile" style={{ textAlign:"right"}} alignHeader="center" sortable header="Nome" field="data.PRODUTO_NOME" body={(item)=>{
                        return(<span>{item.data.PRODUTO_NOME}</span>)
                    }}></Column>
                    <Column className="hide_on_mobile" style={{ textAlign:"center"}} sortable header="Comprimento" field="data.COMPRIMENTO" body={(item)=>{
                        if(item.data.COMPRIMENTO == 0) return("")
                        return(<h5>{item.data.COMPRIMENTO + " cm"}</h5>)
                    }}></Column>
                    <Column className="hide_on_mobile" style={{ textAlign:"center"}} sortable header="Largura" field="data.LARGURA" body={(item)=>{
                        if(item.data.LARGURA == 0) return("")
                        return(<h5>{item.data.LARGURA + " cm"}</h5>)
                    }}></Column>
                    <Column className="hide_on_mobile" style={{ textAlign:"center"}} sortable header="Gramatura" field="data.GRAMATURA" body={(item)=>{
                        if(item.data.GRAMATURA == 0) return("")
                        return(<h5>{item.data.GRAMATURA + " g/m²"}</h5> )
                    }}></Column>
                    <Column className="hide_on_mobile" alignHeader="right" style={{ textAlign:"right"}} sortable header="Código" field="data.COD_BARRA" body={(item)=>{
                        if(item.data.COD_BARRA == "SEM GTIN") return("")
                        var _loaded_barcodes = {...this.state.loaded_barcodes}
                        
                        if(!_loaded_barcodes[item.id]){
                            const _barcode = this.makeBarcode(item.data.COD_BARRA)
                            _loaded_barcodes[item.id] = _barcode
                            this.setState({loaded_barcodes:_loaded_barcodes})
                        }
                        
                        return(
                            <div style={{textAlign:"center", paddingTop:"10px"}}>
                                <img style={{borderRadius:"5px", width:"220px"}} id="barcode"/>
                                <h6 className="mt-2 mb-2">{item.data.COD_BARRA }</h6>
                            </div>
                        )
                    }}></Column>
                    
                    {/* {this.props?.editable != false && <Column
                        // className="hide_on_mobile"
                        rowEditor
                        headerStyle={{
                            width: '10%',
                            minWidth: '8rem'
                        }}
                        bodyStyle={{
                            textAlign: 'center'
                        }}>    
                    </Column>} */}
                </DataTable>
                {/* <OrderCard products={[this.props.sale_cart]}/> */}
                {/* <ProductsTable columns={[   
                    "PRECO_KG_OU_UNITARIO",
                    "PRODUTO_NOME",
                    "GRAMATURA",
                    "LARGURA",
                    "COMPRIMENTO",
                    "MARCA",
                    // "N_FOLHAS",
                    "photo_uid"
                ]} products={this.props.sale_cart?.items.map((item)=>item.data)}/> */}
                {this.props?.editable != false && <>
                    <div className="show_on_mobile" style={{paddingBottom:"68px"}}></div>
                    <div className="hide_on_mobile" style={{paddingBottom:"55px"}}></div>
                </>}
            </div>
        )
    }
}