import React from 'react';
import { Chart } from 'primereact/chart';
import { deepEqual, months } from '../utils/util';
import { SelectButton } from "primereact/selectbutton";
import { Button } from 'primereact/button';

export default class BarChart extends React.Component{
    constructor(props){
        super(props)

        this.bar_color_mode = ["#764d9d","#A749DE","#A749DE","#259dff","#CCAAFF","#77EFff"]

        this.state={
            orders:null,
            selected_order:null,
            selected_item:null,
            item_in_orders:[],
            selected_month:null,
            chart:"Tudo",
            barChartData:{
                labels: [],
                ids:[],
                datasets: [
                    {
                        borderWidth:1,
                        barPercentage:1.3,
                        // barThickness: 1.0,
                        maxBarThickness: 50,
                        label: 'Valor',
                        // backgroundColor: this.bar_color_mode[0],
                        data: [],
                        backgroundColor: Array.from({length: 12}, () => this.bar_color_mode[0])
                    }
                ]
            }
        }
        this.draw_chart = this.draw_chart.bind(this)
        this.selected_index = null
        this.selected_month = ""
        this.barChartOptions = {
            maintainAspectRatio: false,
            // aspectRatio: 1.0,
            // barPercentage:1.0,
            responsive:true,
            animations:false,
            onClick: (event,[element]) => {
                if(element){
                    if(this.state.selected_month == null && this.state.chart == "Mês"){
                        const month = months.find(month => month.name == this.state.barChartData.labels[element.index])
                        this.setState(()=>({selected_month:month, chart:month.label}),this.draw_chart)
                    }else{
                        const order = this.state.orders.find(order => order.id == this.state.barChartData.ids[element.index])
                        // console.log(order)
                        this.props.onSelect(order,this.draw_chart)
                    }
                }
                
            },
            plugins: {
                legend: {
                    display:false,
                    labels: {
                        display:false,
                        color: '#495057'
                    }
                }
            },
            transitions:{
                active:{
                    animation:{
                        duration:0
                    }
                }
            },
            scales: {
                x: {
                    // display:false,
                    ticks: {
                        color: '#AAAAAA'
                    },
                    grid: {
                        color: '#495057'
                    }
                },
                y: {
                    ticks: {
                        color: '#AAAAAA'
                    },
                    grid: {
                        color: '#495057'
                    }
                }
            }
            
        };
    }
    // show_selected_month(element){
    //     const order = this.state.orders.find(order => order.id == this.state.barChartData.ids[element[0].index])
    //     if(this.props.selected_order.id != order.id){
    //         var _barChartData = { ...this.state.barChartData }
    //         if(this.selected_index) _barChartData.datasets[0].backgroundColor[this.state.barChartData.ids.indexOf(this.selected_index)] = this.bar_color_mode[1];
    //         _barChartData.datasets[0].backgroundColor[element[0].index] = this.bar_color_mode[4];
    //         this.selected_index = order.id

    //         this.setState({barChartData:_barChartData})
    //         this.props.onSelect(order)
    //     }
    // }
    componentDidMount(){
        console.log("Bar Chart Mount")
        this.draw_chart()
    }

    draw_chart(all_orders){
        // console.log(this.props.selected_order.index)
        const item = this.props.selected_item
        const orders = all_orders?all_orders:this.props.orders
        // console.log(item, orders)
        if(!orders) return
        var _barChartData = { ...this.state.barChartData }
        var _client_orders = [...orders]
        if(this.state.chart == "Tudo" || this.state.selected_month){
            _barChartData.datasets[0].backgroundColor = Array.from({length: _client_orders.length}, () => this.bar_color_mode[1])
            
            _barChartData.datasets[0].backgroundColor[this.state.barChartData.labels.indexOf(this.selected_index)] = this.bar_color_mode[3];
            _barChartData.labels = _client_orders.map((order)=>{
                var return_val = order.date.toLocaleDateString('pt-BR', { day: "2-digit", month: 'short', year: "2-digit"})
                if(this.state.selected_month && this.state.selected_month.value != order.date.getMonth())return_val = ""
                return return_val
            }).filter((a)=>a!="")
            // console.log(_barChartData.labels)
            _barChartData.ids = _client_orders.map((order)=>{
                var return_val = order.id
                if(this.state.selected_month && this.state.selected_month.value != order.date.getMonth())return_val = ""
                return return_val
            }).filter((a)=>a!="")
            _barChartData.datasets[0].data = _client_orders.map((order)=>{
                var return_val = order.total
                if(this.state.selected_month && this.state.selected_month.value != order.date.getMonth())return_val = ""
                return return_val
            }).filter((a)=>a!="")
            if(this.props.selected_order) _barChartData.datasets[0].backgroundColor[this.props.selected_order.index] = this.bar_color_mode[4];
            this.state.item_in_orders.map((i)=>{
                if(i==this.props.selected_order.index){
                    _barChartData.datasets[0].backgroundColor[i] = this.bar_color_mode[5];
                }else{
                    _barChartData.datasets[0].backgroundColor[i] = this.bar_color_mode[3];
                }
            })


            // _barChartData.datasets[1].data = _client_orders.map((order)=>this.sum_array(order.cart.map(item=>item.quantidade)))
            this.setState({
                all_orders:orders,
                orders:_client_orders,
                barChartData:_barChartData,
                // chart:month != "all"?"Pedidos":"Tudo"
            })
        }else if(this.state.chart == "Mês"){
            var orders_by_month = {}
            
            _barChartData.datasets[0].backgroundColor = Array.from({length: orders.length}, () => this.bar_color_mode[0])
            _barChartData.labels = months.map(month=>month.name)
            _barChartData.ids = _client_orders.map((order)=>order.id)
            var selected_order_in_month = null
            var selected_order_index = null
            _client_orders.map((order,o_idx)=>{
                const month = months.find((month)=>{
                    if(month.value == order.date.getMonth()){
                        if(this.props.selected_order?.id == order.id){
                            // console.log(o_idx)
                            selected_order_index = o_idx
                            selected_order_in_month = month
                        }
                        return(month)
                    }
                }).name
                orders_by_month[month] ||= 0
                orders_by_month[month] += order.total
            })
            // console.log(selected_order_index,selected_order_in_month)
            // this.selected_month = ""

            _barChartData.labels = Object.keys(orders_by_month)
            _barChartData.datasets[0].data = Object.values(orders_by_month)
            // _barChartData.datasets[0].backgroundColor[this.state.barChartData.labels.indexOf(this.selected_index)] = this.bar_color_mode[4];
            _barChartData.datasets[0].backgroundColor[Object.keys(orders_by_month).indexOf(selected_order_in_month?.name)] = this.bar_color_mode[4];
            
            // this.state.item_in_orders.map((i)=>{
            //     console.log(i)
            //     _barChartData.datasets[0].backgroundColor[i] = this.bar_color_mode[3];
            // })
            
            this.setState({
                orders:_client_orders,
                barChartData:_barChartData,
                // chart:"Mês"
            })
        }
        this.props.onUpdate?.(_barChartData.labels.length)
    }
    
    onItemSelect(item){
        // console.log(this.state.barChartData.ids)
        var _item_in_orders =[]

        const visible_orders = this.props.orders?.filter((o)=>this.state.barChartData.ids.includes(o.id))
        
        visible_orders?.map((order,item_index)=>{
            if(item){
                order.cart.map((i)=>{
                    if(i.id==item.id || i.id==item.PRODUTO_ID){
                        // console.log(item_index)
                        _item_in_orders.push(item_index)
                    }
                })
            }
            // return(false)
        })
        // console.log(_item_in_orders)
        
        this.setState({
            selected_item:item,
            item_in_orders:_item_in_orders
        },()=>{
            this.draw_chart()
        })
    
        // this.set_chart("Tudo")
        // this.set_chart(this.state.chart)
        
    }
    render(){
        // console.log(this.props.selected_product)
        if(!this.state.orders) return(<></>)
        return(<div className='flex w-full flex-wrap'>
            
                <div className='p-inputgroup flex w-full justify-content-start h-3rem mt-4'>
                    <Button
                        label={this.state?.selected_month?.label}
                        disabled={this.state.selected_month == null}
                        icon="pi pi-calendar"
                        className='p-button-outlined p-button-help h-min'
                    />
                    <SelectButton
                        value={this.state.chart}
                        options={["Mês","Tudo"]}
                        onChange={(e) => {
                            // this.set_chart(e.value)
                            this.setState({chart:e.value, selected_month:null},()=>{
                                this.onItemSelect(this.state.selected_item)
                                // if(this.state.selected_item){
                                //     this.onItemSelect(this.state.selected_item)
                                // }else{
                                //     this.draw_chart()
                                // }
                            })
                        }}
                    />
                </div>
            
            <div  className="flex w-max justify-content-start " style={{
                // width: "100%",
                minWidth: "100%",
                maxWidth: `calc(${this.state.barChartData.labels.length*15}px + 13rem)`
            }}>
                <Chart
                    style={{width:"100%", height:"100%", minHeight:"400px"}}
                    ref={(el)=> this.myChart = el}
                    type="bar"
                    data={this.state.barChartData}
                    options={this.barChartOptions}
                />
            </div>
            
        </div>)
    }
}