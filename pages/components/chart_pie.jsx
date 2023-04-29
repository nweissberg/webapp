import React from 'react';
import { Chart } from 'primereact/chart';
import { moneyMask, shorten } from '../utils/util';

export default class PieChart extends React.Component{
    constructor(props){
        super(props)
        this.colors = [
            "#055b8e",
            "#00324f",
            "#259dff",
            "#64b5f6",
            "#764d9d",
            "#690ac1",
            "#4f0098",
            "#27004b",
            "#471186",
        ]
        this.state={
            selected_index:null,
            selected_item:this.props.selection,
            selected_order:null,
            pieChartData:{
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor: [...this.colors]
                    }
                ]
            }
        }

        this.pieChartOptions = {
            maintainAspectRatio: false,
            // aspectRatio: 1.0,
            animations:false,
            responsive:true,
            elements:{
                arc:{
                    borderColor:"#FFF2"
                }
            },
            layout:{
                padding:0
            },
            plugins: {
                legend: {
                    // position:"left",
                    display:true,
                    labels: {
                        color: '#AAAAAA'
                    }
                },
                tooltip:{
                    // titleAlign:"center",
                    // bodyAlign :"center",
                    // footerAlign :"center",
                    callbacks:{
                        label:(data)=>{
                            const item = this.state.selected_order.cart[data.dataIndex]
                            // console.log(item)
                            return(`${moneyMask(item.value)} x ${item.quantidade} un = ${moneyMask(item.quantidade*item.value)}`)
                        },
                        title:([data])=>{
                            // console.log(item)
                            const item = this.state.selected_order.cart[data.dataIndex]
                            // return(item.nome)
                            return(shorten(item.nome))
                        },
                        footer:([data])=>{
                            // console.log(data)
                            const item = this.state.selected_order.cart[data.dataIndex]
                            const total = data.dataset.labels.reduce((a,b)=>a+b)
                            return(`${Math.round((item.quantidade/total)*100)}% de ${moneyMask(this.state.selected_order.total)}`)
                        }
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
            onClick: (event,[element]) => {
                // console.log(event)
                if(element){
                    // console.log(element)
                    const item = this.state.selected_order.cart[element.index]
                    // const order = this.state.orders.find(order => order.id == this.state.barChartData.ids[element.index])
                    // console.log(item)
                    this.props.onSelect?.(item)
                    this.setState({selected_index:element.index, selected_item:item},()=>{
                        this.draw(true)
                    })
                
                }
            }
        };
        
        
    }
    draw(update=false){
        var order = this.props.order
        // console.log(this.props.order,order)
        
        if(order && (update || this.state.selected_order == null || this.state.selected_order.id != order.id)){
            var _pieChartData = {...this.state.pieChartData}
            _pieChartData.datasets[0].labels = {...order}.cart.map(item => item.quantidade)
            _pieChartData.datasets[0].data = {...order}.cart.map(item => item.quantidade*item.value)
            
            var _index = order.cart.findIndex(_item => _item.id == this.props.selection?.id)
            if(_index == -1) _index = null

            _pieChartData.datasets[0].backgroundColor = {...order}.cart.map((item,i) =>{
                if(i==_index){
                    return("#77EFff")
                }else{
                    return(this.colors[i%this.colors.length])
                }
            })
            
            // console.log(order.cart.findIndex(_item=> _item.id == this.props.selection.id))
            

            this.setState({
                selected_order:order,
                pieChartData:_pieChartData,
                selected_item: this.props.selection,
                selected_index: _index
            })
        }
    }
    componentDidUpdate(){
        this.draw(this.state.selected_item?.id !== this.props.selection?.id)
    }

    componentDidMount(){
        this.draw()
    }

    render(){
        return(
            <div  className="flex w-full justify-content-center">
                <div style={{width: "calc(100% - 50px)"}}>
                <Chart
                    className='cursor-pointer'
                    // ref={(el)=>this.pie_chart = el}
                    type="doughnut"
                    data={this.state.pieChartData}
                    options={this.pieChartOptions}
                    width='100%'
                    style={{
                        // left:"28%",
                        
                        height:"256px"
                    }}
                />
            </div>
        </div>)
    }
}