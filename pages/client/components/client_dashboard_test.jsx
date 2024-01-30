import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Chart } from 'primereact/chart';
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { api_call, api_get } from "../../api/connect";
import { moneyMask } from "../../utils/util";
import { Sidebar } from "primereact/sidebar";
import { Splitter, SplitterPanel } from 'primereact/splitter';
// import GoogleMap from "../../components/maps";
import PieChart from "../../components/chart_pie";
import BarChart from "../../components/chart_bar";
import CallDialog from "./call_dialog";
import ProductIcon from "./product_photo";
import { ProgressSpinner } from "primereact/progressspinner";
import ClientSearch from "../../client/components/client_search";
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import ReorderDatatable from "../../components/reorder_datatable";
import SplitterDemo from "./splitter_test";

export default class ClientDashboard extends React.Component{
    constructor(props){
        super(props)
        this.default={
            client:null,
            show_dashboard:false,
            client_credit:null,
            client_orders:[],
            client_products:[],
            client_address:null,
            selected_product: null,
            selected_order:null,
            loading:false
        }
        this.state={ ...this.default}

        this.widgets = {
            clientName:()=>{
                return(<div className="flex flex-wrap w-auto align-items-center mb-4">
                    <h4 className="-normal">{this.state.client.fantasia}</h4>
                    <h5 className="white-space-normal" style={{color:"var(--text-c)"}}>{this.state.client.razao_social}</h5>
                </div>)
            },
            creditInfo:()=>{
                return(<div className="flex-grow-1 justify-items-between field">
                    {this.credit_info()}
                    {this.state.client_orders != null && this.order_info()}
                </div>)
            },
            callDialog:()=>{
                return(<div className="flex w-full h-auto">
                    <CallDialog
                        fullScreen
                        client={this.state.client}
                        user={this.props.user}
                        all_users={this.props.all_users}
                    />
                </div>)
            },
            barChart:()=>{
                return(<div className="flex w-auto h-auto">
                    <BarChart
                        ref={(el)=> this.chart_bar = el}
                        orders={this.state.client_orders}
                        selected_order={this.state.selected_order}
                        selected_item={this.state.selected_product}
                        onSelect={(_selected_order,callback)=>{
                            this.setState(prevState=>({selected_order:_selected_order}),()=>{callback?.();this.update()})
                        }}
                        onItemSelect={(item)=>{
                            console.log(item)
                            this.setState(()=>({selected_order:item}),()=>{this.update()})
                        }}
                    />
                </div>)
            },
            pieChart:()=>{
                return(<div className="flex w-full h-auto">
                    <PieChart order={this.state.selected_order}/>
                </div>)
            },
            clientProducts:()=>{
                return(<div className="grid gap-1 max-h-20rem overflow-scroll justify-content-end ">
                {this.state.client_products.map((i,key)=>{
                    return(<div key={i.PRODUTO_ID+key}className={"flex flex-wrap w-min h-auto mb-2 p-1 border-round-md align-items-start "+ (this.state.selected_product?.id == i.PRODUTO_ID?"bg-black-alpha-20" : "bg-white-alpha-10")}>
                        <Button className="p-0 bg-transparent border-0"
                            onClick={()=>{
                                // console.log(i)
                                var item = {...i, id:i.PRODUTO_ID}
                                this.chart_bar.onItemSelect(item)
                                this.setState({selected_product:item},()=>{
                                    this.update()
                                })
                                // this.chart_bar.draw_chart()
                            }}
                        >
                            <ProductIcon size={7} item={i.PRODUTO_ID}/>
                        </Button>
                        {/* <label className={"white-space-normal text-sm mt-2 " + (this.state.selected_product?.id == i.PRODUTO_ID?"text-primary-500" : "text-white")}>{i.PRODUTO_NOME}</label> */}
                    </div>)
                })}
            </div>)
            },
            clientOrder:()=>{
                return(this.state.selected_order && <DataTable
                    scrollable
                    scrollHeight="20rem"
                    responsiveLayout="scroll"
                    value={this.state.selected_order.cart}
                    selectionMode="single"
                    selection={this.state.selected_product}
                    onSelectionChange={e => {
                        // console.log(e.value)
                        this.chart_bar.onItemSelect?.(e.value)
                        this.setState({ selected_product: e.value },()=>{
                            this.update()
                        })
                    }}
                    dataKey="id"
                    header={<>
                        <div className="flex w-full justify-content-between">
                            <Button
                                icon="pi pi-chevron-left"
                                className="p-button-text"
                                disabled={this.state.selected_order.index == 0}
                                label="Anterior"
                                onClick={(e)=>{
                                    this.setState({selected_order:this.state.all_orders[this.state.selected_order.index-1]},()=>{
                                        this.update()
                                    })
                                }}
                            />
                            <h5 className="flex justify-content-center align-items-center white-space-nowrap w-full">
                                {this.state.selected_order.index + 1} de {this.state.all_orders.length}</h5>
                            <Button
                                icon="pi pi-chevron-right"
                                iconPos="right" 
                                className="p-button-text"
                                disabled={this.state.selected_order.index >= this.state.all_orders.length - 1}
                                label="Próximo"
                                onClick={(e)=>{
                                    this.setState({selected_order:this.state.all_orders[this.state.selected_order.index+1]},()=>{
                                        this.update()
                                    })
                                }}
                            />
                        </div>
                    </>}
                    
                    footer={(row_data)=>{
                        return(<div className="flex justify-content-end">
                            <h4 className="flex gap-2"><h6 className="text-secondary">Total:</h6>{moneyMask(this.state.selected_order.total)}</h4>
                        </div>
                        )
                    }}
                >
                    
                    <Column key="item"
                        headerClassName="flex justify-content-center"
                        header={<h6 style={{textAlign:"center"}}>{this.state.selected_order.date.toLocaleDateString("pt-br", {
                            hour12: false,
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}</h6>}
                        body={(row_data)=>{
                            return(
                                <div className="flex flex-wrap w-full justify-items-end ">
                                    <h6 className="white-space-normal">{row_data.nome}</h6>
                                    <div className="flex w-full justify-content-between align-items-center" >

                                        <ProductIcon item={row_data.id}/>

                                        <div className="flex flex-wrap gap-1 align-items-between w-1rem">
                                            <div style={{transform:"TranslateX(-100%)"}}>
                                                <div className="text-500">
                                                    <div className="flex justify-content-end white-space-nowrap w-full">
                                                        <h5>{moneyMask(row_data.value)}</h5>
                                                    </div>
                                                    <div className="flex justify-content-between align-content-end vertical-align-bottom white-space-nowrap w-full">
                                                        <h5>x</h5>
                                                        <h5>{row_data.quantidade} un</h5>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4>{moneyMask(row_data.value * row_data.quantidade)}</h4>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }}
                    />
                </DataTable>)
            }
        }
    }
    // componentDidMount(){
    //     if(this.props?.fullScreen){
    //         this.load_client()
    //     }
    // }
    
    // componentDidUpdate(){
    //     console.log("Component Update",this.state.client)
    //     // if(!this.props.client || this.state.show_dashboard == false || this.state.loading) return
    //     // if(this.props.client?.id != this.state.client?.id){
    //     //     this.load_client(this.props.client)
    //     // }
    // }

    load_client(client){
        // console.log(this.props.client)
        // const client = this.props.client
        this.setState({client, loading:true},()=>{
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
            // console.log(pedidos_cliente)
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
        this.reTable?.draw()
        this.reTable2?.draw()
        this.chart_bar?.draw_chart()
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
                <h5>{moneyMask(this.state.client_credit)}</h5>
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

    
    render_dashboard(){
        if(!this.state.client) return(<></>)
        return(
            <div className="w-full p-1">
                <SplitterDemo matrix={[[this.widgets.callDialog,[this.widgets.clientName,this.widgets.creditInfo]]]}/>
            </div>
        )
    }

    nextClient(){
        if(!this.state.client)return(null)
        return(this.props.clients[this.props.clients.findIndex(c => c.id == this.state.client.id)+1])
    }

    lastClient(){
        if(!this.state.client)return(null)
        return(this.props.clients[this.props.clients.findIndex(c => c.id == this.state.client.id)-1])
    }
    
    render(){
        if(!this.props.client){
            return(<div className="flex w-full h-screen align-items-center absolute top-0 bg-blur-1">
                <ProgressSpinner/>
            </div>)
        }

        if(this.props?.fullScreen){
            return(this.render_dashboard())
        }
        
        return(<div>
            <Sidebar
                className="lg:w-8 md:w-full w-full"
                blockScroll={true}
                visible={this.state.show_dashboard}
                fullScreen
                // dismissable={false}
                position="right"
                onHide={() => this.setState(this.default)}
                icons={<div className="flex w-full justify-content-between">
                    <Button
                        disabled={this.lastClient() == null}
                        tooltip={this.lastClient()?.fantasia}
                        className='p-button-text p-button-lg bg-1 z-1'
                        icon="pi pi-chevron-left"
                        // label="Anterior"
                        onClick={(e)=>{
                            this.load_client(this.lastClient())
                        }}
                    />
                    <div >
                        <Inplace closable>
                            <InplaceDisplay className="inline-flex align-content-center">
                                <Button className="p-button-lg p-button-rounded p-button-secondary p-button-outlined"
                                    icon="pi pi-search"
                                    label="Pesquisar..."
                                />
                            </InplaceDisplay>
                            <InplaceContent className="inline-flex align-items-center">
                                <ClientSearch
                                    dropdown={false}
                                    name={false}
                                    user={this.props.user}
                                    onSelect={(client)=>{
                                        // this.props.setClient?.(client)
                                        this.setState({ ...this.default, show_dashboard:true, loading:true, client:client},()=>{
                                            this.load_client(client)
                                        })
                                        
                                        // console.log(client)
                                    }}
                                />
                            </InplaceContent>
                        </Inplace>
                    </div>
                    <Button
                        disabled={this.nextClient() == null}
                        tooltip={this.nextClient()?.fantasia}
                        tooltipOptions={{position:"left"}}
                        className='p-button-text p-button-lg bg-1 z-1'
                        icon="pi pi-chevron-right"
                        iconPos="right" 
                        // label="Próximo"
                        onClick={(e)=>{
                            this.load_client(this.nextClient())
                        }}
                    />
                </div>}
            >   
            <div className="flex w-full justify-content-center">
                {this.render_dashboard()}
            </div>
            </Sidebar>
            <Button
                icon="pi pi-eye"
                className="p-button-outlined p-button-rounded p-button-success"
                label='Abrir'
                onClick={(e) => {
                    this.load_client(this.props.client)
                    this.setState({show_dashboard:true})
                }}
            />
        </div>)
    }
}