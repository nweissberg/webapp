
import React from 'react';
import { Chart } from 'primereact/chart';
import { ProgressSpinner } from 'primereact/progressspinner';
import { average_array, moneyMask, sum_array } from '../utils/util';

export default class LineChart extends React.Component{

    constructor(props) {
        super(props);

        this.state={
            zoom:0,
            orders:null,
            multiAxisData:{
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
                datasets: [{
                    type: 'line',
                    label: 'Preço',
                    fill: false,
                    // borderDash: [5, 5],
                    borderColor: '#764d9d',
                    yAxisID: 'y',
                    tension: .1,
                    data: [65, 59, 80, 81, 56, 55, 10]
                }, {
                    type: 'line',
                    label: 'Quantidade',
                    fill: false,
                    borderColor: '#77EFff',
                    yAxisID: 'y1',
                    tension: .4,
                    data: [28, 48, 40, 19, 86, 27, 90]
                },
                // {
                //     type: 'line',
                //     fill: true,
                //     label: 'Total',
                //     maxBarThickness:10,
                //     borderColor: '#56c458',
                //     borderWidth:1,
                //     tension: .3,
                //     backgroundColor: '#56c45855',
                //     yAxisID: 'y3',
                //     data: [28, 48, 40, 19, 86, 27, 90]
                // }
            ]},
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        }

        this.lineChartOptions = {
            maintainAspectRatio: false,
            // aspectRatio: 1.0,
            // barPercentage:1.0,
            responsive:true,
            animations:false,
            onClick: (event,[element]) => {
                if(element){
                    console.log(element)
                    
                    // const order = this.state.orders.find(order => order.id == this.state.barChartData.ids[element.index])
                    // this.props.onSelect(order)
                
                }
            },
            plugins: {
                legend: {
                    display:false,
                    labels: {
                        display:false,
                        color: '#AAA'
                    }
                },
                // tooltip:{
                //     // titleAlign:"center",
                //     // bodyAlign :"center",
                //     // footerAlign :"center",
                //     callbacks:{
                //         label:(data)=>{
                //             if(!data)return('')
                //             const item = this.state.orders[data.dataIndex]
                //             if(!item)return('')
                //             // console.log(item)
                //             return(`${moneyMask(item?.valor)} x ${item.quantidade} un = ${moneyMask(item.quantidade*item.valor)}`)
                //         },
                //         title:([data])=>{
                //             const item = this.state.orders[data.dataIndex]
                //             console.log(item)
                //             // return(item.nome)
                //             // return(shorten(item.nome))
                //         },
                //         // footer:([data])=>{
                //         //     // console.log(data)
                //         //     const item = this.state.orders[data.dataIndex]
                //         //     const total = data.dataset.labels.reduce((a,b)=>a+b)
                //         //     return(`${Math.round((item.quantidade/total)*100)}% de ${moneyMask(this.state.orders.total)}`)
                //         // }
                //     }
                // }
            },
            elements:{
                point:{
                    pointRadius:8,
                    pointHitRadius:20,
                    pointHoverRadius:10,
                    pointBackgroundColor:"#FFF2",
                    pointHoverBackgroundColor:"#FFFA"
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
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: '#AAAAAA'
                    },
                    grid: {
                        color: '#495057'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: '#AAAAAA'
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: '#495057'
                    }
                }
            }
            
        };
    }

    componentDidMount(){
        this.draw()
    }

    componentDidUpdate(){
        if(!this.props.orders) return
        if((this.state.orders?.length == 0 || this.state.orders == null) && this.props.orders.length != 0 || this.state.orders.length != this.props.orders.length){
            this.draw(true)
        }
    }
    
    draw(update=false){
        var orders = this.props?.orders//this.analize(this.props?.orders)
        // console.log(orders)
        if(orders=="NO_DATA") return null

        if(orders && ((update && orders.length != 0) || this.state.orders == null)){
            // console.log(orders)
            var _multiAxisData = {...this.state.multiAxisData}
            _multiAxisData.labels = Object.values({...orders}).map(d=>new Date(d.date).toLocaleDateString("pt-br", this.props?.dateFormat?this.props.dateFormat:{
                month: "short",
                year: "2-digit",
            }).split(' de ').join(' ').split('/').join(' . '))
            
            _multiAxisData.datasets[0].data = Object.values({...orders}).map(v=>parseFloat(v.valor))
            _multiAxisData.datasets[1].data = Object.values({...orders}).map(v=>v.quantidade)
            // _multiAxisData.datasets[2].data = Object.values({...orders}).map(v=>v.quantidade*v.valor)

            const all_values = _multiAxisData.datasets[0].data
            const min = Math.floor(Math.min(...all_values))
            const max = Math.ceil(Math.max(...all_values))
            const delta = Math.max(Math.abs(max-min)*0.5, 1.0)
            _multiAxisData.datasets[0].data.push(min-delta)
            _multiAxisData.datasets[0].data.push(max+delta)
            this.setState({
                orders:orders,
                multiAxisData:_multiAxisData
            })
        }
    }

    render() {
        if(this.state.orders == "NO_DATA" || this.state.orders?.length == 0) return(<></>)
        return (
            <div>
                {this.props.orders?.length == 0 &&
                <div className='flex bg z-1 absolute w-full h-20rem justify-content-center align-items-center'>
                    <ProgressSpinner />
                </div>}
                <div className={this.props?.className? this.props.className: "flex h-10rem w-17rem"} >
                    <Chart
                        style={{width:"100%"}}
                        type="line"
                        data={this.state.multiAxisData}
                        options={this.lineChartOptions}
                    />
                </div>

            </div>
        )
    }
}
                 