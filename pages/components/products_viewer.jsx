import React from 'react';
import ProductCard from '../sales/components/product_card';
import InViewWrapper from './in_view_wrapper';
import { scrollToTop } from '../utils/util';

export default class ProductsViewer extends React.Component{
    constructor(props){
        super(props)
        this.default={ scroll:20}
        this.state={...this.default}
    }

    render(){
        if(this.props.products?.length == 0) return(<></>)
        return(<div id="search_window"
            className={`flex sticky top-0 justify-content-center w-full h-max flex-wrap `}>
            <div className='grid grid-nogutter justify-content-center mb-8 pb-5 w-12 z-0 scrollbar-none '>
                { this.props.products?.slice(0,this.state.scroll).map((item,index)=>{
                    var quantity = 0
                    var discount = 0.0
                    if(this.props.cart !== null) this.props.cart.items.map((i)=>{
                        if(i.data?.PRODUTO_ID == item?.PRODUTO_ID){
                            quantity = i.quantity
                            discount = i.discount
                            // console.log(i)
                        }
                    })
                    if(item?.type == 'split'){
                        return(<div key={"prod_"+index} style={{top:'70px'}}
                            className=' text-center p-2  mb-3 z-3 mx-1 sticky bg-bluegray-900 bg-blur-1 w-full border-round-md text-white'>
                            <div className='flex w-full justify-content-center gap-3 align-items-center'>
                                <i className={(item.icon?item.icon:"pi pi-chevron-down text-cyan-400")+' text-2xl p-0 m-0'}/>
                                <h3>{item.PRODUTO_NOME}</h3>
                                <i className={(item.icon?item.icon:"pi pi-chevron-down text-cyan-400")+' text-2xl p-0 m-0'}/>
                            </div>
                        </div>)
                    }
                    return(<ProductCard key={index}
                        item={item}
                        discount={discount}
                        quantity={quantity}
                        onAddProduct={(event)=>{
                            this.props.updateProducts(this.props.onAddProduct(event))
                        }}
                        onSubProduct={(event)=>{
                            this.props.updateProducts(this.props.onSubProduct(event))
                        }}
                        show_mobile_info={(_item)=>{
                            this.props.onSelect(_item)
                        }}
                    />)  
                })}
                
                <InViewWrapper
                    inView={(e)=>{
                        this.setState({scroll:this.state.scroll+30})
                    }}
                    className='hover:bg-white-alpha-20 active:bg-white-alpha-10 cursor-pointer text-center p-2 mb-3 mx-1 relative bg-glass-c bg-blur-1 w-full h-auto border-round-md text-white'
                    
                >
                    <div onClick={(e)=>{
                        scrollToTop()
                    }} className='flex w-full h-3rem justify-content-center gap-3 align-items-center sticky'>
                        <i className='pi pi-chevron-up text-2xl text-cyan-500 p-0 m-0'/>
                        <h3>Para o topo</h3>
                        <i className='pi pi-chevron-up text-2xl text-cyan-500 p-0 m-0'/>
                    </div>
                    
                </InViewWrapper>
                
                
            </div>
        </div>)
    }
}

