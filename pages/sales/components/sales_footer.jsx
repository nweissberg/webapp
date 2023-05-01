import React from "react";
import { Button } from 'primereact/button';
import { deepEqual, format_mask, moneyMask, scrollToBottom, scrollToTop } from "../../utils/util";
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
// import AnimatedNumbers from "react-animated-numbers";
import { InputText } from "primereact/inputtext";
import localForage from "localforage";
import { api_get } from "../../api/connect";
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';

import { add_data, readRealtimeData, writeNewOrder } from "../../api/firebase";
import Swal from 'sweetalert2';
import { Badge } from "primereact/badge";
import { OverlayPanel } from 'primereact/overlaypanel';
import ClientSearchTable from "./client_search_table";
import ClientSearch from "../../client/components/client_search";

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
            clients:[],
            isSaved:true,
            save_name:"",
            filtered:[],
            warnings:[],
            warn_alerts:{},
            show_search:false
        }
        this.footer,
        this.onWarningSelect = this.onWarningSelect.bind(this);
        // this.clear = this.clear.bind(this);
        this.warn_msg = {
            item_discount:{
                title:"Item do Pedido",
                add:"Desconto maior que o permitido para os itens: ",
                del:"Desconto dentro do permitido."
            },
            min_value:{
                title:"Valor do Pedido",
                add:"Pedido muito barato, mínimo é R$1.000,00",
                del:"Valor total válido."
            },
            new:{
                add:"",
                del:""
            }
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
                                        // console.warn(this.props.test_context?.("order_sent",_order))    
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
    }
    onWarningSelect(e) {
        this.setState({ selectedWarning: e.value }, () => {
            this.op.hide();
            // this.toast.show({severity:'info', summary: 'Warning Selected', detail: this.state.selectedProduct.name, life: 3000});
        });
    }

    // clear() {
    //     this.toast.clear();
    // }

    

    itemTemplate(item) {
        return (
            <div className="Clients-item">
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
            
            this.setState({all_clients:_all_clients,clients:_all_clients})
        })
    }
    // componentWillUnmount(){
    //     console.log("Will unmount")
    // }
    alert_warning(warning, options){
        var _warn_alerts = {...this.state.warn_alerts}
        _warn_alerts[warning] = {
            title:this.warn_msg[warning].title,
            info:this.warn_msg[warning][options.type] + options.msg,
            icon:options.type=='add'?'pi pi-exclamation-circle':'pi pi-check-circle',
            type:options.type,
            data:options.data,
        }
        this.setState({warn_alerts:_warn_alerts})

        // this.toast.show({
        //     severity: options.type=='add'?'warn':'info',
        //     summary: this.warn_msg[warning].title,
        //     detail: this.warn_msg[warning][options.type] + options.msg,
        //     life: 3000,
        //     sticky:options.sticky || false
        // });
    }

    add_warning(warning, msg="",data=[]){
        // console.log(data)
        if( !this.state.warnings.includes(warning)){
            var _warnings = [...this.state.warnings];
            _warnings.push(warning)
            this.setState({warnings:_warnings},(()=>{
                this.alert_warning(warning,{msg,type:"add", data:data});
            }))
        }else{
            var msg_add = this.warn_msg[warning]["add"] + msg
            if(this.state.warn_alerts[warning]?.info != msg_add){
                var _warn_alerts = {...this.state.warn_alerts}
                _warn_alerts[warning] = {
                    title:this.warn_msg[warning].title,
                    info:msg_add,
                    icon:'pi pi-exclamation-circle',
                    type:'add',
                    data:data
                }
                this.setState({warn_alerts:_warn_alerts})
            }
        }
    }
    del_warning(warning, msg=""){
        if( this.state.warnings.includes(warning)){
            var _warnings = [...this.state.warnings].filter((warn)=>warn!=warning);
            this.setState({warnings:_warnings},(()=>{
                this.alert_warning(warning,{msg,type:"del"});
            }))
            // console.log(_warnings)
        }
    }
    componentDidUpdate(){
        // console.log("Did update", this.props.sale_cart.name)
        var sale_total = this.props.sale_cart.items.length > 0 ? this.props.sale_cart.items.map((item)=>{return((item.data?.PRECO-(item.data?.PRECO*(item.discount/100)))*item.quantity)}).reduce((sum,i)=> sum + i) : 0
        // console.log(sale_total)
        // readRealtimeData("users/"+this.props.user.uid).then((user_data)=>{
        //     console.log(user_data)
        // })
        // console.log(this.props.user)
        this.props.setClient?.(this.state.selectedClient)
        var warning = ""
        var items = []
        const test_items = this.props.sale_cart.items.filter((item)=>{
            warning = "item_discount"
            if(this.props.user.discount){
                if(item.discount > this.props.user.discount){
                    items.push(item)
                    return(true)
                }
                return(false)
            }
        })
        if(test_items.length > 0){
            this.add_warning(warning,'',items)
        }else{
            this.del_warning(warning)
        }

        // if(this.state.selectedClient){
            this.props.test_context?.("check_order",{
                Valor:sale_total,
                Desconto:0,
                Minimo:1000
            }).then((ret_data)=>{
                warning = "min_value"
                // console.log(ret_data)
                if(ret_data == false){
                    this.add_warning(warning)
                }else{
                    this.del_warning(warning)
                }
            })
        // }

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
                <Toast ref={(el) => this.toast = el}
                    position="bottom-right"
                />
                
                <div ref={(el) => this.footer = el} 
                    className="flex flex-grow-1 justify-content-between flex-wrap gap-3"
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
                    <div className="flex flex-wrap flex-grow-1 flex-shrink-1 justify-content-between col-8 h-full p-0">
                        <div className="flex  p-0 align-items-center gap-1 flex-grow-1 flex-shrink-1 w-full max-w-min">
                            <Button
                                disabled={this.state.loadingClients}
                                className="p-button-lg flex overflow-hidden p-button-rounded px-3 py-2 sm:icon-only p-button-glass-light border-2 border-white "
                                
                                icon={
                                    this.state.loadingClients?
                                        "pi pi-spin pi-hourglass":
                                        this.state.selectedClient?
                                            "pi pi-info-circle":
                                            this.state.clients?.length!=0?
                                                "pi pi-times" :
                                                "pi pi-user-plus"
                                    }
                                label={this.state.loadingClients?"Carregando...":this.state.selectedClient?this.state.selectedClient.fantasia : this.state.clients?.length!=0?"":"Adicionar Cliente"}
                                onClick={(event)=>{
                                    
                                    if(this.state.clients.length != 0){
                                        this.setState({clients:[]})
                                        // this.menu.toggle(event)
                                    }else{
                                        this.setState({show_search:!this.state.show_search})
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

                            <i aria-haspopup
                                aria-controls="overlay_panel"
                                onClick={(e) => this.op.toggle(e)}
                                className={"pi "+(this.state.warnings.length == 0? "pi-check":"pi-question")+" p-2 m-2 p-overlay-badge"}
                                style={{
                                    fontSize: '22px',
                                    cursor:"pointer",
                                    color:this.state.warnings.length == 0?"var(--success)":"var(--warn)",
                                    borderRadius:"50%",
                                    outline:"2px solid "+ (this.state.warnings.length == 0?"var(--success)":"var(--warn)")
                                }}
                            >
                                {this.state.warnings.length > 0 && <Badge severity="warning" value={this.state.warnings.length} />}
                            </i>
                             
                            <OverlayPanel
                                appendTo={this.footer?.parentElement}
                                ref={(el) => this.op = el}
                                showCloseIcon
                                id="overlay_panel"
                                style={{
                                    position:"absolute",
                                    top:"0px",
                                    left:"0px",
                                    padding:"10px",
                                    paddingRight:"20px",
                                    minWidth: '200px',
                                    maxWidth:'90vw',
                                    minHeight: '200px',
                                    zIndex:'auto'
                                }}
                            >
                                {Object.entries(this.state.warn_alerts).map(([key,warning])=>{
                                    const color = warning.type!="add"?"var(--success)":"var(--warn)"
                                    
                                    return(<div key={key}>
                                        <div className="flex align-items-center">
                                            <i className={warning.icon+" p-2"} style={{color:color}}/>
                                            <h5 className="pt-2" style={{color:color}}>{warning.title}</h5>
                                        </div>
                                        <p className="ml-3" style={{whiteSpace:"pre-wrap"}}>{
                                            warning.info
                                        }
                                        {warning.data && warning.data?.map((i,j)=>{
                                            return(<p key={'alert_'+j} onClick={(e)=>{
                                                scrollToTop()
                                                this.props.featureProducts([i,...warning.data.filter(j=>j.id!=i.id)])
                                                this.op.toggle(e)
                                            }} className=" text-gray-100 hover:text-purple-300 cursor-pointer m-0 p-0 ">
                                                {"\t° "+i.data?.PRODUTO_NOME}
                                            </p>)
                                        })}
                                        </p>
                                    </div>)
                                })}
                            </OverlayPanel>
                            <Dialog
                                blockScroll={true}
                                onShow={()=>{scrollToTop()}}
                                header={<div className="flex w-full h-auto fadein animation-iteration-1 animation-duration-400">
                                    <ClientSearch
                                        clients={this.state.clients}
                                        auto_complete={false}
                                        dropdown={false}
                                        user={this.props.user}
                                        onChange={(event)=>{
                                            // console.log(event)
                                            if(event == null) this.setState({filtered:[]})
                                        }}
                                        onSelect={(e)=>{
                                            console.log(e)
                                        }}
                                        set_filtered_clients={(_filtered)=>{
                                            console.log(_filtered)
                                            this.setState({filtered:_filtered})
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
                                visible={this.state.clients?.length!=0 && this.state.selectedClient == null && this.state.show_search}

                                onHide={() => this.setState({clients:[], show_search:false})}
                                className='flex w-full'
                            >
                                <ClientSearchTable
                                    clients={this.state.clients}
                                    user={this.props.user}
                                    check_rule={this.props.check_rule}
                                    filtered={this.state.filtered}
                                    router={this.props.router}
                                    show_search={this.state.clients?.length!=0}
                                    onSelect={(e)=>{
                                        this.setState({searchClient:e})
                                    }}
                                    selectionMode="single"
                                />
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
                            label={this.state.isSaved?"Salvo":"Salvar Rascunho"}
                            className="p-button sm:icon-only p-button-glass-light border-none justify-content-center h-full w-full"
                            onClick={this.props.sale_cart.name==""?this.confirmSave:this.accept}
                        />
                        {/* <Button
                            disabled={this.props.sale_cart.items.length == 0}
                            iconPos="right"
                            icon="pi pi-percentage"
                            label="Taxar Impostos"
                            className="p-button sm:icon-only p-button-glass-light border-none justify-content-center h-full w-full"
                        /> */}
                    </div>
                    
                </div>
            </>
        )
    }
}