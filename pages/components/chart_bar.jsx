import React from 'react';
import { Chart } from 'primereact/chart';
// import { deepEqual, isDeepEqual, months, sum_array } from '../utils/util';
// import { SelectButton } from "primereact/selectbutton";
// import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import WheelWrapper from './on_wheel_wrapper';

export default class BarChart extends React.Component{
    constructor(props){
        super(props)

        this.bar_color_mode = ["#A4D","#83C","#84D","#259dff","#CCAAFF","#77EFff"]

        this.state={
            zoom:0,
            zoom_drag:0,
            orders:null,
            selected_order:null,
            selected_item:null,
            item_in_orders:[],
            selected_month:null,
            chart:"Tudo",
            barChartData:{
                labels: [],
                ids:{},
                datasets: []
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
                // console.log(element)
                if(element){
                    // console.log(this.state.barChartData.datasets[element.datasetIndex][element.index])
                    
                    const order = this.state.orders.find(order => order.id == this.state.barChartData.ids[element.datasetIndex+"_"+element.index])
                    // console.log(order)
                    this.props.onSelect(order)
                    
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
                    stacked: true,
                    ticks: {
                        color: '#AAAAAA'
                    },
                    grid: {
                        color: '#495057'
                    }
                },
                y: {
                    stacked: true,
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

    componentDidUpdate(){
        if(this.props.selected_item?.id != this.state.selected_item?.id || this.props.selected_order?.id != this.state.selected_order?.id){
            this.draw_chart()
        }
    }

    componentDidMount(){
        console.log("Bar Chart Mount")
        this.draw_chart()
    }

    draw_chart(){
        const item = this.props.selected_item
        const orders = this.props.orders
        // console.log(item, orders)
        if(!orders) return
        var _barChartData = { ...this.state.barChartData }
        var _client_orders = [...orders]
        
        var _item_in_orders = []
        if(item) _item_in_orders = this.props.orders.filter(order=>{
            return(order.cart.map(item=>item.id).indexOf(item.id) != -1)
        }).map(o=>o.id)

        const new_set = {
            borderWidth:1,
            barPercentage:1.3,
            maxBarThickness: 50,
            label: 'Valor',
            data: [],
            backgroundColor:[]
        }
        
        if(this.state.chart == "Tudo" || this.state.selected_month){
            var prev_date
            var index = 0
            _barChartData.labels = []
            _barChartData.datasets = [{...new_set}]

            _client_orders.map((order)=>{
                var new_date = order.date.toLocaleDateString('pt-BR', { day: "2-digit", month: '2-digit', year: "2-digit"})
                
                if(prev_date == new_date) {
                    index += 1
                }else{
                    index = 0
                    _barChartData.labels.push(new_date)
                }
                
                if(!_barChartData.datasets[index]){
                    _barChartData.datasets.push({
                        ...new_set,
                        data: Array.from({length: _barChartData.labels.length-1}, () => 0),
                        backgroundColor: []
                    })
                }
                
                _barChartData.datasets = _barChartData.datasets.map(ds => {
                    if(ds.data.length < _barChartData.labels.length-1) ds.data.push(0)
                    return(ds)
                })

                _barChartData.ids[index+"_"+_barChartData.datasets[index].data.length] = order.id
                _barChartData.datasets[index].data.push(order.total)

                prev_date = new_date
            })

            _barChartData.datasets.map((ds,i)=>{
                _barChartData.datasets[i].backgroundColor = Array.from({length: _barChartData.labels.length}, () => this.bar_color_mode[i%3])
            })

            if(this.props.selected_order){
                const order_index = Object.keys(_barChartData.ids).filter(s=>_barChartData.ids[s] == this.props.selected_order.id)[0]?.split('_').map(i=>parseInt(i))
                if(order_index) _barChartData.datasets[order_index[0]].backgroundColor[order_index[1]] = this.bar_color_mode[4];
            }

            Object.keys(_barChartData.ids).map(s=>[_barChartData.ids[s],s]).filter(i=>_item_in_orders.indexOf(i[0]) != -1).map(o=>{
                let index = o[1].split('_')
                if(index) _barChartData.datasets[parseInt(index[0])].backgroundColor[parseInt(index[1])] = this.bar_color_mode[o[0] == this.props.selected_order?.id?5:3]
            })

            if(_barChartData.labels.length != this.state.barChartData.labels.length){
                // _barChartData.datasets[1].data = _client_orders.map((order)=>this.sum_array(order.cart.map(item=>item.quantidade)))
                
                this.setState({
                    selected_item:item,
                    all_orders:orders,
                    orders:_client_orders,
                    barChartData:_barChartData,
                    selected_order:this.props.selected_order,
                })
            }else{
                this.setState({
                    selected_order:this.props.selected_order,
                    selected_item:item,
                    barChartData:_barChartData,
                })
            }
        }
        
    }
    
    render(){
        // console.log(this.props.selected_product)
        if(!this.state.orders) return(<></>)
        let items = this.state.barChartData.labels.length
        let _scale = ((this.state.zoom-40)*4)+200
        return(<div className='flex w-full m-0 p-2 flex-wrap overflow-hidden'>
            <div className='flex absolute top-0 left-0 bg w-full h-full border-round-md' style={{zIndex:-1}}/>
            <div  className="flex w-full justify-content-start mt-4 ml-3 " style={{
                minWidth: `max(100%, calc(${items*13}px + 13rem))`,
                width: `calc(${items*16}px + ${((this.state.zoom-40)*0.5)+13}rem)`
            }}>
                <Chart
                    style={{width:`max(${_scale}dvw, ${_scale}dvh)`, height:"100%", minHeight:"400px"}}
                    ref={(el)=> this.myChart = el}
                    type="bar"
                    data={this.state.barChartData}
                    options={this.barChartOptions}
                />
                
            </div>
            <div className='flex absolute w-max'>
                <h5 className='sticky left-0 pl-5 text-white'>Valor dos Pedidos por Dia </h5>
                <div className='absolute flex-wrap flex h-20rem'>
                    <WheelWrapper onScroll={(e)=>{
                        let _zoom = Math.min(Math.max(this.state.zoom+(e*0.05), 0),100)
                        this.setState({ zoom: _zoom, zoom_drag: _zoom  })
                    }}>
                    <Slider
                        className='h-full p-2 ml-1 border-round-md'
                        value={this.state.zoom}
                        onChange={(e) => this.setState({ zoom: e.value })}
                        // onSlideEnd={(e) => this.setState({ zoom: e.value })}
                        orientation="vertical"
                    />
                    </WheelWrapper>
                    <h6 style={{position:"fixed", bottom:"-60px", left:"-10px"}} className="-rotate-90 text-gray-300">zoom</h6>
                </div>
            </div>
        </div>)
    }
}