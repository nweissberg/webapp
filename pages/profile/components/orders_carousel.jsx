import React, { Component } from 'react';
import OrderCard from './order_card';

export default class OrderCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    componentDidMount(){
        console.log(this.props.products)
        document.querySelector("#items").addEventListener("wheel",event=>{
            if(event.target.scrollLeft > 10 || event.target.scrollLeft == event.target.scrollWidth - window.innerWidth){
                event.preventDefault()
            }
            if(event.deltaY > 0){
                event.target.scrollBy(300,0)
            }else{   
                event.target.scrollBy(-300,0)
            }
        },{passive: false})
    }
    componentDidUpdate(){
        console.log(this.props.products)
    }

    
    render() {
        return (
            <div className='carousel_body'>
                <div className="salecart_carousel">
                    <div id="items" className='salecart_items'>
                        {this.props.products.map((sale_cart)=>{
                            return(
                                <OrderCard
                                    key={sale_cart.uid}
                                    sale_cart={sale_cart}
                                    edit={this.props?.edit}
                                    clone={this.props?.clone}
                                    view={this.props?.view}
                                    callback={this.props?.callback}
                                    delete={this.props?.delete}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

}