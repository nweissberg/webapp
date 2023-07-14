import { Button } from 'primereact/button';
import React, { Component, createRef } from 'react';
import ScrollWrapper from '../../components/scroll_wrapper';
import ClientOrderCard from './client_order';
import OrderCard from './order_card';
import InViewWrapper from '../../components/in_view_wrapper';

export default class OrderCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            order_id:0,
            card_width:12,
            max:20
        };
        this.carousel_ref = createRef()
    }
    componentDidMount(){
        this.draw();
    }
    draw(){
        if(this.carousel_ref.current){
            const carousel = this.carousel_ref.current.parentElement
            if(carousel.offsetWidth/2 < 400 || carousel.offsetWidth < 400){
                if(this.state.card_width != 12) this.setState({card_width : 12})
            }else if(carousel.offsetWidth/3 < 400){
                if(this.state.card_width != 6)  this.setState({card_width : 6})
            }else{
                if(this.state.card_width != 4)  this.setState({card_width : 4})
            }
        }
    }

    gotoOrder(order){
        // console.log(order)
        if(!order) return
        const divElement = document.getElementById("order_"+order.id)
        // console.log(divElement)
        if(!divElement) return
        divElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        // this.carousel_ref.current.scrollTo({top:0, left:divElement.offsetLeft + (/2) ,behavior:"auto"})
    }
    
    componentDidUpdate(){
        if(this.props.selected_order && this.state.order_id != this.props.selected_order.id){
            this.setState({order_id:this.props.selected_order.id})
            this.gotoOrder(this.props.selected_order)
        }
        this.draw()
    }
    getOrderFromID(id,plus=0){
        return this.props.orders[this.props.orders.findIndex(o => o.id == id)+plus]
    }
    cloneOrder(order){
        // console.log(order)
    }
    render() {
        if(!this.props.orders || this.props.orders?.length == 0){ // Draw Skeleton while loading
            return(<div className='flex w-full relative justify-content-center'>
                <div className=' flex w-full horizontal-scrollbar'>
                    {[0,1,2,3].map((i)=>{return(<div key={'skeleton_div_'+i}
                        className={'order-card flex flex-grow-1 bg h-screen relative'}
                        style={{maxHeight:"512px", minWidth:"320px", maxWidth:"500px", width:'50%', borderRadius:'10px'}}
                    />)})}
                </div>
            </div>)
        }
        return (
            <div className='flex w-full relative justify-content-center'>
                <div className='pointer-events-none flex absolute w-full h-7rem justify-content-between z-1 mt-1 top-0 p-4'>
                    <Button
                        // disabled={this.state.scroll < 300}
                        className='pointer-events-auto shadow-none p-button-text p-button-lg bg-1 hover:text-white hover:bg-bluegray-800'
                        icon="pi pi-chevron-left"
                        onClick={(e)=>{
                            this.setState({max:this.state.max+2},()=>{
                                let _select = this.getOrderFromID(this.state.order_id,-1)
                                // this.gotoOrder(_select)
                                this.props.selectOrder?.(_select)
                            })
                            
                        }}
                    />
                    <Button
                        // disabled={!this.carousel_ref.current || (this.carousel_ref.current.scrollWidth - window.innerWidth) - this.state.scroll < 300}
                        className='pointer-events-auto shadow-none p-button-text p-button-lg bg-1 hover:text-white hover:bg-bluegray-800'
                        icon="pi pi-chevron-right"
                        onClick={(e)=>{
                            let _select = this.getOrderFromID(this.state.order_id,1)
                            this.props.selectOrder?.(_select)
                        }}
                    />
                </div>
                    <div ref={this.carousel_ref} speed={300} className='overflow-scroll scroll-smooth flex w-full scrollbar-none justify-content-between '>
                        {/* {this.props.orders.length >= this.state.max && <InViewWrapper timer={0} key={'skeleton_load'} onExecute={(e)=>{this.setState({max:this.state.max+6})}}>
                            <div className={'order-card product-item flex flex-grow-1 bg h-screen relative'}
                                style={{maxHeight:"512px", minWidth:"320px", maxWidth:"500px", width:'50%', borderRadius:'10px'}}>
                            </div>
                        </InViewWrapper>} */}
                        {this.props.orders.map((sale_cart,index)=>{//.slice(this.props.orders.length-this.state.max)
                            if(!this.props.client) return(<OrderCard 
                                className={"w-"+this.state.card_width}
                                currentUser={this.props.currentUser}
                                key={sale_cart.uid}
                                sale_cart={sale_cart}
                                edit={this.props?.edit}
                                clone={this.props?.clone}
                                view={this.props?.view}
                                link={this.props?.link}
                                callback={this.props?.callback}
                                delete={this.props?.delete}
                            />)
                            return(
                                <ClientOrderCard
                                    id={"order_"+sale_cart.id}
                                    card_index={index}
                                    className={"scroll-smooth w-"+this.state.card_width}
                                    currentUser={this.props.currentUser}
                                    key={sale_cart.id}
                                    sale_cart={sale_cart}
                                    edit={this.props?.edit}
                                    clone={()=>{
                                        this.cloneOrder(sale_cart)
                                    }}
                                    view={this.props?.view}
                                    link={this.props?.link}
                                    callback={this.props?.callback}
                                    delete={this.props?.delete}
                                    onSelect={(data)=>{
                                        this.setState({order_id:sale_cart.id},()=>{
                                            this.props?.onSelect(data)
                                        })
                                    }}
                                    selected_product={this.props?.selected_product}
                                    selected_order={this.props.orders.find(o => o.id == this.state.order_id)}
                                    selectOrder={(data)=>{
                                        // console.log(data)
                                        this.gotoOrder(data)
                                        this.setState({order_id:sale_cart.id})
                                        this.props.selectOrder?.(data)
                                    }}
                                />
                            )
                        })}
                        
                </div>
            </div>
        );
    }
}