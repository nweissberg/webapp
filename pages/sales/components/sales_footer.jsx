import React from "react";
import { Button } from 'primereact/button';
import { deepEqual, moneyMask, scrollToBottom, scrollToTop } from "../../utils/util";
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
// import AnimatedNumbers from "react-animated-numbers";
import { InputText } from "primereact/inputtext";
import localForage from "localforage";
import BarcodeScanner from "./barcode_scanner";
import { api_get } from "../../api/connect";
import { AutoComplete } from 'primereact/autocomplete';
import { Menu } from 'primereact/menu';
import { SlideMenu } from 'primereact/slidemenu';
import { Dialog } from 'primereact/dialog';
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { add_data, writeNewOrder } from "../../api/firebase";
import Swal from 'sweetalert2';

const pedidos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

const vendedores_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'vendedores'
});

const clientes_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'clientes'
});

export default class SalesFooter extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            num:0,
            isSaved:true,
            save_name:"",
            clients: [],
            filteredCountries: null,
            searchClient: null,
            selectedClient: null,
            loadingClients:false
        }

        this.items = [
            {
                label: 'Ações do Cliente',
                items: [
                    {
                        label: 'Status Financeiro',
                        icon: 'pi pi-dollar',
                        command:(e) => {
                            
                        }
                    },
                    {
                        label: 'Limite de Crédito',
                        icon: 'pi pi-credit-card',
                        command:(e) => {
                            if(this.state.selectedClient.credit){
                                Swal.fire(
                                    this.state.selectedClient.fantasia + '</br><strong> possui </strong>crédito!',
                                    'Limite de <strong>'+moneyMask(this.state.selectedClient.credit)+"</strong>",
                                    'success'
                                )
                                return
                            }
                            this.setState({loadingClients:true})
                            console.log("Consultar "+ this.state.selectedClient.fantasia)
                            api_get({
                                credentials:"0pRmGDOkuIbZpFoLnRXB",
                                keys:[{
                                    key: "ID_EMPRESA",
                                    value: this.state.selectedClient.id.toString(),
                                    type: "STRING"
                                }],
                                query:"hMM7WFHClaxYEjAxayms"
                            }).then(async(data)=>{
                                console.log(data)
                                this.setState({loadingClients:false})
                                if(data.length > 0){
                                    Swal.fire(
                                        this.state.selectedClient.fantasia + '</br><strong> possui </strong>crédito!',
                                        'Limite de <strong>'+moneyMask(data[0].valor_limite_atual1)+"</strong>",
                                        'success'
                                    ).then(()=>{
                                        var _selectedClient = {...this.state.selectedClient}
                                        _selectedClient.credit = data[0].valor_limite_atual1
                                        this.setState({selectedClient:_selectedClient})
                                    })
                                }else{
                                    Swal.fire({
                                        title: this.state.selectedClient.fantasia + '</br><strong> não possui </strong>crédito',
                                        icon: 'info',
                                        html:
                                          'Uma linha de <b>crédito</b> pode ser solicitada',
                                        showCloseButton: true,
                                        showCancelButton: false,
                                        focusConfirm: false,
                                        confirmButtonText:
                                          '<i class="pi pi-thumbs-up"></i> Okay!',
                                        confirmButtonAriaLabel: 'Thumbs up, great!',
                                        cancelButtonText:
                                          '<i class="pi pi-thumbs-down"></i>',
                                        cancelButtonAriaLabel: 'Thumbs down'
                                      })
                                }
                            })
                        }
                    },
                    {
                        label: 'Remover Cliente',
                        icon: 'pi pi-user-minus',
                        command:(e) => {
                            this.setState({
                                selectedClient:null,
                                searchClient:null
                            })
                        }
                    }
                ]
            },
            {
                label: 'Ações do Pedido',
                items: [
                    {
                        label: 'Importar Planilha',
                        icon: 'pi pi-file-import',
                        command:(e) => {
                            
                        }
                    },
                    {
                        label: 'Exportar Planilha',
                        icon: 'pi pi-file-export',
                        command:(e) => {
                            
                        }
                    },
                    {
                        label: 'Imprimir Carrinho',
                        icon: 'pi pi-print',
                        command:(e) => {
                            
                        }
                    },
                    {
                        label: 'Enviar Orçamento',
                        icon: 'pi pi-send',
                        command:(e) => {
                            
                            var _order = {
                                name:this.props.sale_cart.name,
                                items:this.props.sale_cart.items.map(item=>{
                                    var _item = {...item}
                                    delete _item.data
                                    return _item
                                }),
                                client:this.state.selectedClient.id,
                                history:[ {action:"enviado", date: Date.now(), user: this.props.user.uid} ]
                            }
                            add_data("orders",_order)
                            // writeNewOrder(this.props.user,_order)
                            .then((data)=>{
                                // console.log(data)
                                _order.uid = data
                                console.log(_order)
                                pedidos_db.getItem(this.props.user.uid).then((data)=>{
                                    // data.drafts = data.drafts.filter(cart=>cart.name==name)
                                    
                                    data.drafts.sort(function(x,y){ return x.name == _order.name ? -1 : y.name == _order.name ? 1 : 0; });
                                    data.drafts = data.drafts.slice(1)
                                    pedidos_db.setItem(this.props.user.uid,data).then(()=>{
                                        // showSuccess(name)
                                        console.warn(this.props.send_order?.("order_sent",_order))
                                        Swal.fire(
                                            'Pedido '+ _order.name,
                                            'Enviado como orçamento, para aprovação',
                                            'success'
                                        )
                                    })
                                    // set_drafts(data.drafts)
                                })
                            })
                            console.log(_order)
                        }
                    }
                ]
            }
        ];
        
        this.accept = this.accept.bind(this);
        // this.reject = this.reject.bind(this);
        this.confirmSave = this.confirmSave.bind(this);
        this.searchCountry = this.searchCountry.bind(this);
    }

    searchCountry(event) {
        setTimeout(() => {
            let filteredCountries;
            if (!event.query.trim().length) {
                filteredCountries = [...this.state.clients];
            }
            else {
                filteredCountries = this.state.clients.filter((country) => {
                    return country.fantasia.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
            
            this.setState({ filteredCountries });
        }, 250);
    }

    itemTemplate(item) {
        return (
            <div className="country-item">
                {/* <img alt={item.name} src={`images/flag/flag_placeholder.png`} onError={(e) => e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} className={`flag flag-${item.code.toLowerCase()}`} /> */}
                <div>{item.fantasia}</div>
            </div>
        );
    }

    accept(event) {
        console.log(this.state.save_name)
        // this.setState({save_visible:false})
        var _sale_cart = {...this.props.sale_cart}
        _sale_cart.name = this.state.save_name

        // console.log(_sale_cart.items)
        pedidos_db.getItem(this.props.user.uid).then((data)=>{
            var _drafts = []
            if(data){
                _drafts = data.drafts.map((cart)=>{
                    if(cart.name == _sale_cart.name || cart.name == ''){
                        cart.name = _sale_cart.name
                        cart = _sale_cart //Atualiza o rascunho no indexed DB com o mesmo nome
                    }
                    return(cart)
                })
            }
            
            if(_drafts.find((item)=>item.name == _sale_cart.name) == undefined){
                console.log("New Cart")
                _drafts.unshift(_sale_cart)
            }
            // return(true)
            pedidos_db.setItem( this.props.user.uid, {drafts:_drafts} ).then(()=>{
                this.setState({isSaved:true})
                this.toast.show({
                    severity: 'info',
                    summary: 'Sucesso',
                    detail: `Pedido ${this.state.save_name} salvo!`,
                    sticky: this.props.sale_cart.name!=""?false:true
                });
                // console.log("Pedido Salvo")
                // this.props.save_cart?.(_sale_cart.items)
            })
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
                    // value={this.state.save_name}
                    placeholder={this.state.save_name?this.state.save_name:"Digite aqui..."}
                    type="text"
                    onChange={(event)=>{
                        // console.log(event.target.value)
                        this.setState({save_name:event.target.value})
                    }}
                />
                <Button
                    // disabled={this.state.save_name==""?true:false}
                    className="p-button-outlined"
                    icon="pi pi-check"
                    onClick={()=>{
                        // console.log(this.state.save_name)
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
        var _clientes = {}
        clientes_db.iterate(function(value, key) {
            _clientes[key] = value
        }).then(()=>{
            var _all_clients = Object.values(_clientes)
            this.setState({all_clients:_all_clients})
        })
    }
    // componentWillUnmount(){
    //     console.log("Will unmount")
    // }
    componentDidUpdate(){
        // console.log("Did update", this.props.sale_cart.name)

        if(this.state.save_name != this.props.sale_cart.name && this.props.sale_cart.name != ""){
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
        var sale_total = this.props.sale_cart.items.length > 0 ? this.props.sale_cart.items.map((item)=>{return((item.data?.PRECO-(item.data?.PRECO*(item.discount/100)))*item.quantity)}).reduce((sum,i)=> sum + i) : 0
        return(
            <>
                <Menu style={{width:"max-content"}} model={this.items} popup ref={el => this.menu = el} id="popup_menu" />
                {/* <div style={{position:"absolute"}}> */}
                <ConfirmPopup
                    style={{position:"absolute"}}
                    // visible={this.state.save_visible}
                    onHide={(event) => {
                        // this.setState({save_visible:false})
                    }}
                />
                <Toast ref={(el) => this.toast = el} position="bottom-left"/>
                
                <div className="flex flex-grow-1 justify-content-between flex-wrap gap-3"
                    style={{
                        height:"auto",
                        width:"100%",
                        position:"fixed",
                        color:"var(--text)",
                        bottom:"0px",
                        backgroundColor:"var(--glass-b)",
                        backdropFilter: "blur(10px)",
                        padding:"10px",
                        zIndex:3
                    }}
                >   
                        

                    {/* </div> */}
                    <div className="flex flex-wrap flex-grow-1 justify-content-between col-8 h-full p-0">
                        <div className="flex p-0 align-items-center">
                            <Button
                                disabled={this.state.loadingClients}
                                className="p-button-small p-button-outlined"
                                style={{color:"var(--text)"}}
                                icon={
                                    this.state.loadingClients?
                                        "pi pi-spin pi-hourglass":
                                        this.state.selectedClient?
                                            "pi pi-info-circle":
                                            this.state.clients?.length!=0?
                                                "pi pi-times" :
                                                "pi pi-user-plus"
                                    }
                                label={this.state.loadingClients?"Carregando...":this.state.selectedClient?this.state.selectedClient.fantasia : window.innerWidth<500 || this.state.clients?.length!=0?"":"Adicionar Cliente"}
                                onClick={(event)=>{
                                    
                                    if(this.state.clients.length != 0){
                                        this.setState({clients:[]})
                                        // this.menu.toggle(event)
                                    }else{
                                        if(this.state.selectedClient == null ){
                                            this.setState({loadingClients:true})
                                            console.log("GET CLIENTS from", this.props.user.name)
                                            vendedores_db.getItem(this.props.user.email).then((vendedor)=>{
                                                if(vendedor && this.state.all_clients){
                                                    // console.log(vendedor.VENDEDOR)
                                                    var user_clients = this.state.all_clients.filter((client)=>client.vendedor_id == vendedor.id)//vendedor.id
                                                    // console.log(user_clients)

                                                    if(user_clients[0] != undefined){
                                                        var filters = {}
                                                        Object.keys(user_clients?.[0]).map((col,i) => {
                                                            filters[col] = {value:'',matchMode: FilterMatchMode.STARTS_WITH}
                                                        })
                                                        // console.log(filters)
                                                        this.setState({client_filters:filters})
                                                    }

                                                    if( this.props.check_rule(this.props.user,"VER_TODOS_CLIENTES") ){
                                                        this.setState({clients:this.state.all_clients, loadingClients:false})
                                                    }else{
                                                        // console.log("user_clients")
                                                        this.setState({clients:user_clients, loadingClients:false})
                                                    }
                                                    
                                                }else{
                                                    if(this.props.check_rule(this.props.user,"VER_TODOS_CLIENTES")){
                                                        this.setState({clients:this.state.all_clients, loadingClients:false})
                                                    }else{
                                                        this.setState({clients:[], loadingClients:false})
                                                    }
                                                }
                                            })
                                        }else{
                                            this.menu.toggle(event)
                                            // console.log(this.state.selectedClient)
                                        }
                                    }
                                }}
                            />
                            
                            
                            <Dialog
                                blockScroll={true}
                                onShow={()=>{scrollToTop()}}
                                header={
                                    <div className="flex justify-content-between align-items-center p-2">
                                        <h3>
                                            Clientes
                                        </h3>
                                        <AutoComplete
                                            value={this.state.searchClient}
                                            suggestions={this.state.filteredCountries}
                                            completeMethod={this.searchCountry}
                                            field="fantasia"
                                            dropdown
                                            forceSelection
                                            itemTemplate={this.itemTemplate}
                                            onChange={(e) => {
                                                // console.log(e.value)
                                                this.setState({ searchClient: e.value })
                                            }}
                                            onSelect={(event)=>{
                                                // console.log(event.value)
                                                this.setState({ selectedClient: event.value, loadingClients:false })
                                                
                                            }}
                                        />
                                    </div>
                                }
                                footer={
                                    <div className="flex pt-3">
                                        <Button 
                                            className="p-button-success p-button-outlined"
                                            disabled={this.state.searchClient==null}
                                            label={this.state.searchClient? "Adicionar " +this.state.searchClient.fantasia + " ao pedido":"Selecione um Cliente"} 
                                            onClick={(event)=>{
                                                this.setState({selectedClient:this.state.searchClient})
                                            }}
                                        />
                                    </div>
                                }
                                visible={this.state.clients?.length!=0 && this.state.selectedClient == null}
                                onHide={() => this.setState({clients:[]})}
                                style={{
                                    height:"auto",
                                    maxWidth:"100vw"
                                }}
                            >

                                {/* <AutoComplete
                                    value={this.state.searchClient}
                                    suggestions={this.state.filteredCountries}
                                    completeMethod={this.searchCountry}
                                    field="fantasia"
                                    dropdown
                                    forceSelection
                                    itemTemplate={this.itemTemplate}
                                    onChange={(e) => {
                                        // console.log(e.value)
                                        this.setState({ searchClient: e.value })
                                    }}
                                    onSelect={(event)=>{
                                        // console.log(event.value)
                                        this.setState({ selectedClient: event.value, loadingClients:false })
                                        
                                    }}
                                /> */}
                                <DataTable
                                    responsiveLayout="stack"
                                    breakpoint="600px"
                                    selectionMode="single"
                                    selection={this.state.searchClient}
                                    onSelectionChange={e => this.setState({searchClient: e.value,loadingClients:false })}
                                    dataKey="id"
                                    stripedRows
                                    resizableColumns
                                    columnResizeMode="fit"
                                    showGridlines
                                    filters={this.state.client_filters}
                                    filterDisplay="row"
                                    size="small"
                                    value={this.state.clients}
                                    paginator={this.state.clients?.length > 10?true:false}
                                    paginatorTemplate={this.state.clients?.length > 10?"CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown":null}
                                    currentPageReportTemplate={this.state.clients?.length > 10?"Exibindo {first} à {last} de {totalRecords} registros":null}
                                    rows={this.state.clients?.length > 10?10:0}
                                    rowsPerPageOptions={this.state.clients?.length > 10?[10,20,50,100]:null}
                                    
                                >
                                {this.state.clients && this.state.clients[0] && Object.keys(this.state.clients?.[0]).map((col,i) => {
                                    return <Column
                                    showFilterMenu={false}
                                    filter
                                    sortable
                                    key={col}
                                    field={col}
                                    header={col}
                                    />;
                                })}
                                </DataTable>
                            </Dialog>
                            
                        </div>
                        <div className="flex flex-grow-1 flex-column text-right">
                            <div>
                                <span style={{
                                    fontSize:window.innerWidth > 500?"40px":"calc((75vw - 4rem) / 8)",
                                }}> { moneyMask(sale_total) }</span>
                            </div>
                            {this.props.sale_cart.items.length > 0 && <div>
                                <Button
                                    label={this.props.sale_cart.items.length + (this.props.sale_cart.items.length > 1?" Materiais": " Material")}
                                    className="p-button-sm p-button-text p-button-secondary p-0"
                                    tooltip="Carrinho"
                                    tooltipOptions={{
                                        position: 'left'
                                    }}
                                    icon="pi pi-shopping-cart"
                                    style={{
                                        // height:"20px",
                                        // backgroundColor:"var(--glass-c)",
                                        color:"var(--info)"
                                    }}
                                    onClick={()=>{
                                        // this.
                                        this.props.updateProducts()
                                        scrollToBottom()
                                    }}
                                />
                            </div>}
                        
                        </div>
                    </div>

                    
                    <div className="flex flex-column flex-grow-1 col-2 gap-2 p-0">
                        
                        <Button
                            disabled={this.props.sale_cart.items.length == 0 || this.state.isSaved}
                            iconPos="right"
                            icon={this.state.isSaved?"pi pi-check":"pi pi-save"}
                            label={this.state.isSaved?"Salvo":(window.innerWidth>500?"Salvar Rascunho":"Salvar")}
                            className="p-button-sm p-button-secondary h-full"
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
                            label={window.innerWidth>500?"Taxar Impostos":"Taxar"}
                            className="p-button-sm p-button-secondary h-full"
                            style={{
                                background:"var(--glass-c)",
                                border:"0px",
                                color:"var(--text)"
                            }}
                        />
                    </div>
                </div>
            </>
        )
    }
}