import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Chart } from 'primereact/chart';
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { api_call, api_get } from "../../api/connect";
import { capitalize, moneyMask, scrollToBottom, scrollToTop, shorten, var_get, var_set } from "../../utils/util";
import { Sidebar } from "primereact/sidebar";
import GoogleMap from "../../components/maps";
import PieChart from "../../components/chart_pie";
import BarChart from "../../components/chart_bar";
import CallDialog from "./call_dialog";
import ProductIcon from "./product_photo";
import { ProgressSpinner } from "primereact/progressspinner";
import ClientSearch from "../../client/components/client_search";
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import ReorderDatatable from "../../components/reorder_datatable";
import { withRouter } from "next/router";
import Clients_datatable from "./clients_datatable";
import { ProgressBar } from "primereact/progressbar";
import LineChart from "../../components/chart_line";
// import { TabView, TabPanel } from 'primereact/tabview';
import ProductSidebar from "../../sales/components/product_sidebar";
import OrderCarousel from "./orders_carousel";
import GroupIcons from "../../components/groups_icons";
import ProductsViewer from "../../components/products_viewer";
import ScrollWrapper from "../../components/scroll_wrapper";
import DateRangePicker from "../../components/date_interval_filter";

export default withRouter(class ClientDashboard extends React.Component{
    constructor(props){
        super(props)
        this.models={
            financeiro:{
                icon:"pi pi-dollar",
                matrix:[
                    ["clientName","vendedor"],
                    ["creditInfo","clientLocation"],
                ]
            },
            chamado:{
                icon:"pi pi-comments",
                matrix:[
                    ["clientName"],
                    ["callDialog"],
                ]
            },
            pedidos:{
                icon:"pi pi-shopping-cart",
                matrix:[
                    ["clientOrders"],
                    ["salesGroups"],
                    ["productsView"],
                ]
            },
            dashboard:{
                icon:"pi pi-chart-line",
                matrix:[
                    ["clientProducts","pieChart"],
                    ["clientOrders","barChart"],
                ]
            }
        }
        let _matrix = this.props.matrix?this.props.matrix.toLowerCase():"financeiro"
        // console.log(_matrix)
        this.default={
            client:null,
            clients:[],
            show_dashboard:false,
            client_credit:null,
            client_orders:[],
            client_products:[],
            client_address:null,
            selected_product: null,
            selected_item:null,
            item_index:-1,
            selected_order:null,
            loading:false,
            selected_group:null,
            selected_view: _matrix,
            matrix:this.models[_matrix].matrix,
            search_result:[]
        }
        this.state={ ...this.default}
        this.header = this.header.bind(this)
        this.reloadMatrix = this.reloadMatrix.bind(this)
        this.matrix_button = this.matrix_button.bind(this)
        this.render_dashboard = this.render_dashboard.bind(this)
        
        this.widgets = (component='empty')=>{
            switch (component) {
                case 'empty':
                    return(<></>)
                    break;
                case 'clientName':
                    return(<div className="flex flex-grow-1 text-center flex-wrap w-full h-auto justify-content-center gap-2 align-items-center">
                        <h5 className=" text-overflow-ellipsis overflow-hidden hide_on_phone" style={{color:"var(--text-c)"}}>{this.state.client?.razao_social}</h5>
                        <h4 className="white-space-normal text-white">{this.state.client?.fantasia}</h4>
                    </div>)
                    break;
                case 'vendedor':
                    return(<div className="flex w-full h-max justify-content-between align-items-between">
                        <label style={{color:"var(--text-c)"}}>Responsável:</label>
                        <h6 className="white-space-normal text-right text-bluegray-300">{this.state.client?.vendedor_nome}</h6>
                    </div>)
                    break;
                case 'creditInfo':
                    return(<div className="flex-grow-1 justify-items-between field">
                        {this.credit_info()}
                        {this.state.client_orders != null && this.order_info()}
                    </div>)
                    break;
                case 'callDialog':
                    return(<div className="flex w-full h-auto px-4 py-2">
                        <CallDialog
                            fullScreen
                            client={this.state.client}
                            user={this.props.user}
                            all_users={this.props.all_users}
                        />
                    </div>)
                    break;
                case 'barChart':
                    return(<div className=" flex w-max h-auto" >
                        <BarChart
                            ref={(el)=> this.chart_bar = el}
                            orders={this.state.client_orders}
                            selected_order={this.state.selected_order}
                            selected_item={this.state.selected_product}
                            onSelect={(_selected_order)=>{
                                this.setState(()=>({selected_order:_selected_order}))
                            }}
                        />
                    </div>)
                    break;
                case 'pieChart':
                    return(<div className="flex w-auto h-auto">
                        <PieChart
                            order={this.state.selected_order}
                            selection={this.state.selected_product}
                            onSelect={(_item)=>{
                                // this.chart_bar?.onItemSelect(_item)
                                this.setState({selected_product:_item})
                            }}
                        />
                    </div>)
                    break;

                case 'clientProducts':
                    return(<div className=" flex gap-1 w-auto justify-content-end ">
                        {this.state.client_products.map((i,key)=>{
                            if(!i.PRODUTO_ID)return(<></>)
                            let isSelected = (this.state.selected_product?.id == i.PRODUTO_ID)
                            return(<div id={"product_"+i.PRODUTO_ID}
                                
                                onClick={()=>{
                                    // console.log(i)
                                    var item = {...i, id:i.PRODUTO_ID}
                                    if(isSelected){
                                        this.setState({selected_item:item})
                                    }
                                    // this.chart_bar?.onItemSelect(item)
                                    this.setState({selected_product:item})
                                }}
                                
                                key={i.PRODUTO_ID+key}
                                className={"cursor-pointer flex mb-2 p-1 border-round-md align-content-between "+ (isSelected?"h-auto hover:bg-black-alpha-60 bg-black-alpha-20 border-2 border-blue-400 w-18rem p-2 gap-2" : " flex-wrap h-auto w-min hover:bg-white-alpha-20 bg-white-alpha-10")}>
                                <div className="flex flex-wrap w-full">
                                    <div className={"flex gap-2 mb-2 " + (isSelected?"":"flex-wrap")}>
                                        <ProductIcon size={isSelected?4:7} item={i.PRODUTO_ID}/>
                                        <label className={"cursor-pointer flex white-space-normal text-sm mt-2 top-0 " + (isSelected?" text-blue-100 " : " text-white ")}>{isSelected?i.PRODUTO_NOME:shorten(i.PRODUTO_NOME)}</label>
                                    </div>
        
                                    {isSelected && <LineChart orders={i.ESTADOS} />}
                                </div>
                            </div>)
                        })}
                    </div>)
                    break;

                case 'clientLocation':
                    if(!this.state.client_address)return(<></>)
                    return(<div className="flex flex-grow-1 flex-wrap w-full h-full">
                        <div className="w-full h-max">
                            <GoogleMap
                                location={this.state.client_address.location}
                                title="TESTE GMAPS"
                                updateLocation={(newLocation)=>{
                                    console.log(newLocation)
                                }}
                            />
                        </div>
                        <div className={`
                            grid mt-4
                            flex flex-grow-1
                            w-full h-min
                            justify-content-between
                            align-items-center
                        `}>
                            
                            <Button label='Abrir no Maps'
                                icon='pi pi-map text-2xl'
                                className={`
                                    col-2 md:icon-only
                                    flex
                                    p-button-outlined
                                    w-auto h-min p-2
                                    md:border-round-md
                                    border-3 border-red-900
                                    border-circle
                                    text-white font-bold
                                    white-space-nowrap
                                    bg-red-500
                                `}
                            />
                            <h6 className={`
                                white-space-normal
                                w-10rem h-min
                                flex-grow-1
                                text-white
                                p-2 col-8
                            `}>
                                {this.state.client_address.address}
                            </h6>

                            <Button label='Copiar'
                                icon='pi pi-copy text-2xl text-green-400'
                                iconPos="right"
                                className={`
                                    col-2 lg:icon-only
                                    flex shadow-none
                                    p-button-rounded
                                    w-auto h-min
                                    lg:pl-3 md:p-2
                                    border-3 border-green-800
                                    text-white font-bold
                                    white-space-nowrap
                                    bg-glass-c
                                `}
                            />
                        </div>
                    </div>)
                    break;
                    
                case 'clientOrders':
                    return(<OrderCarousel
                        client={true}
                        currentUser={false}
                        selected_product={this.state.selected_product}
                        selected_order={this.state.selected_order}
                        orders={this.state.all_orders}
                        view={(order)=>{
                        }}
                        link={(data)=>{
                        }}
                        callback={(order)=>{
                            console.log("Devolver " + order)    
                        }}
                        onSelect={data => {
                            // console.log(data)
                            // this.chart_bar?.onItemSelect?.(data)
                            this.setState({ selected_product: data },()=>{
                                this.update()
                                
                            })
                        }}
                        selectOrder={(_selected_order)=>{
                            this.setState(()=>({selected_order:_selected_order}) )
                        }}
                        delete={(name)=>{
                            console.log("Delete", name)
    
                        }}
                    />)
                    break; 
                    
                case 'productsView':
                    if(this.state.search_result.length == 0) return(<></>)
                    return(
                    <div className="">
                        <ProductsViewer
                            products={this.state.search_result}
                            scroll={30}
                            cart={null}
                            onSelect={(data)=>{
                                var item = {...data, id:data.PRODUTO_ID}
                                this.setState({ selected_product: item,selected_item:item },()=>{
                                    this.update()    
                                })
                            }}
                            updateProducts={(e)=>{console.log(e)}}
                            onAddProduct={(e)=>{console.log(e)}}
                            onSubProduct={(e)=>{console.log(e)}}
                        />
                    </div>
                )
                    break;

                case 'salesGroups':
                    return(<div>
                        <div id="" className="scrollbar-none z-0 p-0 m-0 relative left-0 overflow-scroll top-0 pt-4 w-screen min-h-30rem" >
                            <GroupIcons
                                className=''
                                groups={this.props.groups}
                                selected={this.state.selected_group}
                                client={this.props.client}
                                load={this.props.load_products_group}
                                load_client={this.props.load_products_client}
                                searchGroup={(data,group)=>{
                                    console.log(data,group)
                                    // scrollToBottom()
                                    this.setState({
                                        selected_group:group,
                                        search_result:data,
                                        scroll_position:0
                                    })
                                }}
                            />
                        </div>
                            
                    </div>)
                    break;
                case 'salesFooter':
                    if(this.state.selected_group == null) return(<></>)
                    return(
                        <div className="fixed w-screen bottom-0 left-0 z-1">
                            <div className="flex w-full h-10rem bg-gradient-bottom absolute bottom-0 left-0 z-0"/>
                            <div className="fadeindown animation-duration-300 animation-ease-out animation-iteration-1 z-1 flex w-full h-5rem bg-glass-c bg-blur-3">    
                                <div className="fadein animation-duration-500 animation-iteration-1 animation-ease-in justify-content-center w-full flex z-1 relative">
                                    <img className="absolute bottom-0 h-4rem sm:h-4 rem md:h-5rem lg:h-6rem w-auto border-circle mb-4 border-3 border-white shadow-3 z-2" 
                                        src={`images/grupos/${this.state.selected_group.id?this.state.selected_group.id:this.state.selected_group}_foto.jpg`}>
                                    </img>
                                </div>
                            </div>
                        </div>
                    )
                default:
                    break;
            }
        }
        this.widgets = this.widgets.bind(this)
    }
    componentDidMount(){
        if(this.props?.fullScreen){
            this.load_client()
        }
    }
    
    componentDidUpdate(){
        // this.chart_bar?.draw_chart()
        let item_index = this.state.client_products.findIndex(i=>i.PRODUTO_ID==this.state.selected_product?.id)
        if(this.state.selected_product && this.state.item_index != item_index){
            // console.log("index", item_index, "last",this.state.item_index)
            const divElement = document.getElementById("product_"+this.state.selected_product.id)
            // console.log(this.state.selected_product)
            if(!divElement) return
            const parentElement = divElement.parentElement.parentElement;
            // console.log(parentElement.scrollLeft)
            if(this.state.item_index < item_index && this.state.item_index != -1){
                parentElement.scrollTo(divElement.offsetLeft - 200 ,0)
            }else{
                parentElement.scrollTo(divElement.offsetLeft - 30 ,0)
            }
            this.setState({item_index:item_index})
        }   

        // if(this.props.matrix && this.props.matrix != this.state.selected_view){
        //     let _model = this.props.matrix
        //     this.setState({selected_view:_model, matrix:this.models[_model].matrix})
        //     this.update()
        // }else{
        //     this.update()
        // }
        // console.log("Component Update",this.state.client)
        // this.props.onLoad?.(this.state.loading)
        // if(!this.props.client || this.state.show_dashboard == false || this.state.loading) return
        if(this.props.client?.id != this.state.client?.id){
            this.load_client(this.props.client)
        }
    }

    load_client(_client){
        // console.log(this.props.client)
        // if(!this.props.matrix) var_get("user_matrix_client").then(data=>{
        //     if(data){
        //         var _matrix = JSON.parse(data)
        //         // console.log(_matrix)
        //         this.setState({matrix:_matrix})
        //     }
        // })
        var client = _client? _client:this.props.client
        this.setState({...this.default, client:client, loading:true},()=>{
            const ID = client.id.toString()
            this.get_products(client).then((data)=>{
                if(data) this.setState({client_products:data})
                this.get_credit(ID).then(
                    this.get_orders(ID,1000).then(
                        api_call("api/location",[`${client.rua}, ${client.numero} - ${client.bairro}, ${client.cidade}, ${client.cep}`]).then(
                            ([address])=>{
                                // console.log(address)
                                
                                this.setState({client_address:address,loading:false})
                            }
                        )
                    )
                )
            })
        })
    }

    get_credit(ID){
        return(api_get({
            credentials:"0pRmGDOkuIbZpFoLnRXB",
            query:"hMM7WFHClaxYEjAxayms",
            keys:[{
                key: "ID_EMPRESA",
                value: ID,
                type: "STRING"
            }]
        }).then((client_limit)=>{
            if(client_limit != null && client_limit.length > 0){
                this.setState({client_credit: client_limit[0].valor_limite_atual1})
            }else{
                this.setState({client_credit:0})
            }
        }))
    }

    get_orders(ID,max=3){
        return(api_get({
            credentials:"0pRmGDOkuIbZpFoLnRXB",
            query:"xqVL0s5dN84T6fgfUjep",
            keys:[{
                key: "CLIENTE_ID",
                value: ID,
                type: "STRING"
            },{
                key:"EMPRESA_ID",
                value: "1",
                type: "STRING"
            }]
        }).then(async(pedidos_cliente)=>{
            if(!pedidos_cliente) return
            var _client_orders = []
            pedidos_cliente = pedidos_cliente.slice(0,max).map((order)=>{
                return(api_get({
                    credentials:"0pRmGDOkuIbZpFoLnRXB",
                    query:"0tPRw4nOqYil3P9lm38T",
                    keys:[{
                        key: "EMPRESA_ID",
                        value: 1,
                        type: "STRING"
                    },
                    {
                        key: "CLIENTE_ID",
                        value: ID,
                        type: "STRING"
                    },
                    {
                        key: "NFE",
                        value: order.documento,
                        type: "STRING"
                    }]
                }).then((order_data)=>{
                    // console.log(order_data)
                    if(order_data){
                        const cart = order_data.map((item)=>{
                            return({
                                nome:item.nome_produto,
                                id:item.produto_id,
                                quantidade:item.quantidade,
                                value:item.valor_unitario
                            })
                        })
                        const total = this.sum_array(cart.map((product)=>{
                            return(product.value * product.quantidade)
                        }))
                        _client_orders.push({
                            id:order.documento,
                            cart:cart,
                            total:total,
                            date:new Date(order_data[0].data_emissao)
                        })
                    }
                }))
            })
            await Promise.all(pedidos_cliente).then(()=>{
                // console.log(_client_orders)
                if(_client_orders.length == 0){
                    this.setState({client_orders:null})
                }else{
                    const sort_orders = _client_orders.sort((a,b)=>a.id-b.id)
                    const all_orders = sort_orders.map((o,i)=>{
                        // console.log(o)
                        o.index = i
                        return o
                    })
                    const last_order = [...all_orders].pop()

                    // var _pieChartData = {...this.state.pieChartData}
                    // _pieChartData.datasets[0].data = last_order.cart.map(item => item.quantidade)
                    // console.log(_pieChartData)
                    this.setState({
                        all_orders:all_orders,
                        selected_order:last_order,
                        client_orders:all_orders
                        // pieChartData:_pieChartData
                    },()=>{
                        this.update()
                        this.chart_bar?.draw_chart(all_orders)
                    })
                }
            })
        }))
    }
    
    update(){
        
        // this.reTable?.draw(true)
    }
    credit_info(){
        if(this.state.client_credit == null){
            return(
                <Skeleton height="24px" className="mb-2"/>
            )
        }else{
            if(this.state.client_credit == 0){
                return(<div className="flex align-items-start justify-content-between gap-2">
                    <h5 style={{color:"var(--text-c)"}}>Não pussuí: </h5>
                    <Button label="Solicitar"
                        className="p-button-outlined p-button-secondary p-button-rounded pt-0 pb-0"
                    />
                </div>)
            }
            return(<div className="flex align-items-start justify-content-between gap-2">
                <h5 style={{color:"var(--text-c)"}}>Limite de Crédito: </h5>
                <h5 className="text-bluegray-300" >{moneyMask(this.state.client_credit)}</h5>
            </div>)
        }
    }

    sum_array(array){
        return(array.reduce(function (x, y) {
            return x + y;
        }, 0))
    }
    data_line(label,data,color="var(--text)"){
        return(<div className="flex align-items-start justify-content-between gap-2">
            <h5 style={{color:"var(--text-c)", whiteSpace:"nowrap"}}>{label}</h5>
            <h5 style={{color:color}}>{data}</h5>
        </div>)
    }
    order_info(){
        if(this.state.client_orders == null){
            return(<></>)
        }
        const total_orders = this.state.client_orders.length
        if(total_orders != 0){
            var order_sum = this.state.client_orders.map((order)=>{
                return this.sum_array(order.cart.map((product)=>{
                    return(product.value * product.quantidade)
                }))
            })
            
            var orders_total = this.sum_array(order_sum)

            return(<div>
                {this.data_line(`${total_orders} pedidos:`,moneyMask(orders_total))}
                {total_orders > 2 && this.data_line("Maior:",moneyMask(order_sum.sort((a,b)=>b-a)[0]),"var(--success)")}
                {total_orders > 2 && this.data_line("Menor:",moneyMask(order_sum.sort((a,b)=>a-b)[0]),"var(--warn)")}
                {total_orders > 1 && this.data_line("Média:",moneyMask(orders_total/total_orders))}
            </div>)
        }else{
            return(<div>
                <Skeleton height="24px" className="mb-2"/>
                <Skeleton height="24px" className="mb-2"/>
                <Skeleton height="24px" className="mb-2"/>
                <Skeleton height="24px" className="mb-2"/>
            </div>)
        }
    }
    get_order_index(order){
        var item_index = -1
        this.state.all_orders.find((i,index)=>{if(i.id==order.id)item_index=index})
        return(item_index)
    }

    get_products(client){
        return this.props.load_products_client(client.id)
    }

    reloadMatrix(_matrix,callback=()=>{}){
        this.setState({loading:true},()=>{
            this.setState({matrix:_matrix},()=>{
                this.setState({loading:false},()=>{callback()})
            })
        })
    }
    render_dashboard(){
        switch (this.state.selected_view?.toLowerCase()) {
            case 'chamado':
                return(<div className="w-full bg m-0 p-0">
                    {this.widgets('callDialog')}
                </div>)
            break;
            case 'financeiro':
                return(<div className="grid justify-content-between w-auto h-view bg m-0 p-3">
                    <div className="flex flex-wrap flex-grow-1 md:max-w-25rem sm:col-12 md:col-4 lg:col-3">
                        {/* {this.widgets('clientName')} */}
                        {this.widgets('creditInfo')}
                        {this.widgets('vendedor')}
                    </div>
                    <div className="flex justify-content-center flex-wrap flex-grow-1 sm:col-12 md:col-6 lg:col-6">
                        {this.widgets('clientLocation')}
                    </div>
                </div>)
            break;

            case 'pedidos':
                return(<div className="w-full h-auto m-0 p-0">
                    {this.widgets('clientOrders')}
                    {this.widgets('salesGroups')}
                    {this.state.selected_group == 0 && <ScrollWrapper speed={100}
                        className="bg flex h-20rem overflow-scroll horizontal-scrollbar col-12 flex-grow-1">
                        {this.widgets('clientProducts')}
                    </ScrollWrapper>}
                    {this.widgets('productsView')}
                    {this.widgets('salesFooter')}
                </div>)
            break;
            
            case 'dashboard':
                return(<div className="grid w-full m-0 p-0 align-items-center">
                    
                    <ScrollWrapper speed={100}
                        className="md:flex-order-0 sm:flex-order-3 flex h-20rem overflow-scroll horizontal-scrollbar sm:col-12 md:col-6 lg:col-6 xl:col-4 flex-grow-1">
                        {this.widgets('clientProducts')}
                    </ScrollWrapper>
                    <div className="md:flex-order-1 sm:flex-order-2 h-auto sm:col-12 md:col-6 lg:col-6 xl:col-4 w-20rem flex-grow-1">
                        {this.widgets('pieChart')}
                    </div>
                    <ScrollWrapper speed={50}
                        className="md:flex-order-2 sm:flex-order-0 flex h-auto overflow-scroll horizontal-scrollbar sm:col-12 md:col-6 lg:col-6 xl:col-4 flex-grow-1">
                        {this.widgets('barChart')}
                    </ScrollWrapper>
                    <div className="md:flex-order-3 sm:flex-order-1 h-auto sm:col-12 md:col-6 lg:col-6 xl:col-12 max-w-full flex-grow-1">
                        {this.widgets('clientOrders')}
                    </div>
                </div>)
            break;

            default:
                break;
        }
    }

    nextClient(){
        if(this.props.clients.length == 0 || !this.state.client)return(null)
        var index = 1
        var _client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)+index]
        if(!_client) return(null)
        while (_client.id == this.state.client.id) {
            index += 1
            _client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)+index]
        }
        return(_client)
    }

    lastClient(){
        if(this.props.clients.length == 0 || !this.state.client)return(null)
        var index = 1
        var _client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)-index]
        if(!_client) return(null)
        while (_client.id == this.state.client.id) {
            index += 1
            _client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)-index]
        }
        return(_client)
    }

    matrix_button(k,i){
        return(<Button 
            key={i}
            label={k}//{this.props.isMobile?capitalize(k):""}
            icon={this.models[k].icon + " text-2xl"}
            // className={(k!=this.state.selected_view?"p-button-text text-gray-600 pt-0 hover:text-white ":"p-button-outlined bg-surface text-indigo-300 ")}
            className={(k!=this.state.selected_view?" text-white bg-black-alpha-30 ":" bg-primary-600 text-blue-900")+" w-auto min-w-max max-w-20rem p-button-rounded capitalize text-2xl md:icon-only p-2 lg:m-2 shadow-none border-2 border-blue-500"}
            onClick={(e)=>{
                this.setState({selected_view:k})
                // if(this.state.selected_view != this.props.matrix) return
                // this.setState({selected_view:k},()=>{
                //     this.reloadMatrix(this.models[k].matrix, ()=>{
                //         try {
                //             this.props.router.push('client#'+this.state.client.id+"="+k)
                //         } catch (error) {
                //             console.error(error.message)
                //         }
                //     })
                // })
            }}
        />)
    }
    header(){
        return(<div style={{top:"-90px"}} className="sticky z-2 flex bg-4 w-full h-full justify-content-between align-items-center">
            <Button
                disabled={this.lastClient() == null}
                tooltip={this.lastClient()?.fantasia}
                className='p-button-text p-button-lg bg-1 z-1 sticky'
                style={{top:'5px'}}
                icon="pi pi-chevron-left"
                // label="Anterior"
                onClick={(e)=>{
                    var _client = this.lastClient()
                    this.load_client(_client)
                    try {
                        this.props.router.push('client#'+_client.id)
                    } catch (error) {
                        console.log(error.message)
                    }
                }}
            />
            
            
            <div className="grid ">
                <div className="col-12 sm:col-12 md:col-5 lg:col-4 flex-grow-1 flex flex-wrap h-full min-w-30rem align-items-center justify-content-center ">
                    <div className="horizontal-scrollbar flex h-full align-items-center gap-2 overflow-x-scroll mt-3 ">
                        {Object.keys(this.models).map(this.matrix_button)}
                    </div>
                </div>
                <div className="col-12 flex flex-grow-1 text-center justify-content-center h-auto w-full align-content-center m-0 p-0">
                    <h4 className="white-space-normal text-white show_on_mobile ">{this.state.client?.fantasia}</h4>

                </div>
                <div className=" md:col-6 lg:col-5 flex flex-grow-1 text-center justify-content-between gap-2 h-min align-content-center m-0 p-0">
                    <h4 className="white-space-normal text-white hide_on_mobile">{this.state.client?.fantasia}</h4>
                    <h4 className=" text-overflow-ellipsis overflow-hidden hide_on_mobile " style={{color:"var(--text-c)"}}>{this.state.client?.razao_social}</h4>
                    {/* <DateRangePicker /> */}
                </div>
            </div>
            <Button
                disabled={this.nextClient() == null}
                tooltip={this.nextClient()?.fantasia}
                tooltipOptions={{position:"left"}}
                className='p-button-text p-button-lg bg-1 z-1 sticky'
                style={{top:'5px'}}
                icon="pi pi-chevron-right"
                iconPos="right" 
                // label="Próximo"
                onClick={(e)=>{
                    var _client = this.nextClient()
                    this.load_client(_client)
                
                    this.props.router.push('client#'+_client.id)
                    
                }}
            />
        </div>)
    }
    render(){
        if(!this.props.client){
            return(<div className="flex w-full h-screen align-items-center absolute top-0 bg-blur-1">
                <ProgressSpinner/>
            </div>)
        }

        if(this.props?.fullScreen == true){
            // console.log(this.props.isMobile)
            return(<div className=" m-0 p-0">
                {(!this.props.client || this.state.loading) && <ProgressBar mode='indeterminate' className="mt-0"/>}
                {this.header()}
                
                {this.render_dashboard()}
                
                <Sidebar
                    blockScroll
                    style={{
                        width:"100%",
                        maxWidth:"500px",
                        background:"#0000"
                    }}
                    position="right"
                    showCloseIcon={false}
                    visible={this.state.selected_item}
                    onHide={(event)=>{this.setState({selected_item:null})}}
                >
                <ProductSidebar
                    style={{
                        paddingTop:"30px",
                        top:"0px",
                        width:"100%",
                        backgroundColor:"var(--glass-b)",
                        backdropFilter:"blur(20px)",
                    }}
                    sidebar={true}
                    anim={false}
                    close={false}
                    user={this.props.user}
                    check_rule={this.props.check_rule}
                    groups={this.props.groups}
                    item={this.state.selected_item}
                    editable={false}
                    onHide={(event)=>{this.setState({selected_item:null})}}
                />

                </Sidebar>
                {/* <div className='pointer-events-none sticky bottom-0 right-0 z-4 ' style={{paddingTop:'100px', height:"100px"}}>
                    <div className='overflow-scroll flex z-3 w-screen justify-content-end gap-3 align-items-end' >
                        <div className='pointer-events-auto hover:bg-bluegray-800 bg flex px-3 py-3 mr-2 border-circle align-items-center gap-2 cursor-pointer'
                        onClick={(e)=>{
                            scrollToTop()
                        }}>
                        <i className='pi pi-chevron-up text-2xl text-cyan-500 p-0 m-0'/>
                        </div>
                    </div>
                </div> */}

            </div>)
        }
        
    }
})