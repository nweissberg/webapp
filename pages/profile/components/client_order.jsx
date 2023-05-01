import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { capitalize, dateMask, moneyMask, shorten, time_ago } from '../../utils/util';
import OrderTimeline from '../../order/components/order_timeline';
import ProductIcon from './product_photo';
import { Skeleton } from 'primereact/skeleton';
import InViewWrapper from '../../components/in_view_wrapper';

export default class ClientOrderCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show_timeline:false,
            loaded:0,
            in_view:false,
            selected_product:null,
            // selected_order:null
        };
        this.order_card_ref = null
        this.tooltip_options={
            position:'bottom',
            // mouseTrack:true,
            // mouseTrackTop:10,
            className:'custom-tooltip fadeinup animation-duration-150 animation-iteration-1'
        }
        this._width = 300
        this.product_list = this.product_list.bind(this)
    }
    
    componentDidUpdate(){
        this._width = this.order_card_ref?.width
        if(!this.state.in_view && this.props.sale_cart.id == this.props.selected_order?.id){
            this.setState({in_view:true})
        }
        // if(this.props.selected_product?.id != this.state.selected_product?.id){
        //     // console.log(_card.scrollLeft, _card.parentElement.scrollWidth, _card.scrollWidth - _card.parentElement.scrollWidth)
            
        //     // this.render()
        // }
        
    }

    gotoItem(item){
        // console.log(item)
        if(!item) return
        const divElement = document.getElementById('Item_'+item.id+'_'+this.props.sale_cart.id)
        // console.log(divElement)
        if(!divElement) return
        divElement.scrollIntoView(this.state.in_view?{ behavior: "smooth", block: "center",inline:'nearest' }:false);
        // this.carousel_ref.current.scrollTo({top:0, left:divElement.offsetLeft + (/2) ,behavior:"auto"})
    }

    onRowSelect = (event) => {
        
        this.props.onSelect(event)
        this.setState({selected_product:event})
        // console.log(event.data)
        // toast.current.show({ severity: 'info', summary: 'Product Selected', detail: `Name: ${event.data.name}`, life: 3000 });
    }

    onRowUnselect = (event) => {
        // console.log(event.data)
        // toast.current.show({ severity: 'warn', summary: 'Product Unselected', detail: `Name: ${event.data.name}`, life: 3000 });
    }

    componentDidMount(){
        // this.get_view()
        // console.log(this.props.sale_cart)
    }

    get_last_action(product){
        return(product.history?.slice(-1)[0])
    }
    
    product_list(product){
        
        return(product.cart.map((item,p_index)=>{
            let row_class = 'col-12 flex flex-grow-1 w-full h-6rem align-self-stretch '
            let isSelected = item.id == this.props.selected_product?.id
            if(!this.state.in_view || !this.state.loaded){
                return(
                    <div key={p_index+'_'+item.id+'_ghost'}
                        className={(isSelected?'bg-bluegray-900 ':'')+row_class+' overflow-hidden my-2 p-0'}>
                        <Skeleton height='100%' width='100%' className={(isSelected?'border-blue-600 border-2':'') + ' mx-2 p-2  border-round-md'}/>
                    </div>
                )
            }else{   
                return(
                    <div key={'Item_'+item.id+'_'+this.props.sale_cart.id}
                        id={'Item_'+item.id+'_'+this.props.sale_cart.id}
                        className={`cursor-pointer m-2 bg-glass-c border-round-md ${isSelected?"bg-bluegray-900 border-2 border-blue-600":""} flex m-0 p-2 flex-grow-1 w-full justify-content-between align-items-center gap-2`}
                        onClick={(e)=>{
                            this.onRowSelect(item)
                            this.props?.selectOrder(product)
                        }}>
                        <ProductIcon size={4} item={item.id} onClick={(e)=>{
                            // console.log(e)
                            this.onRowSelect(item)
                            this.props?.selectOrder(product)
                        }} />
                        <div className={`flex text-left flex-grow-1 white-space-normal w-12 ${isSelected?"text-blue-100":"text-white"}`}>
                            {/* {isSelected? item.nome :shorten(item.nome)} */}
                            {item.nome}
                        </div>
                        <div style={{ textAlign:"right" }}>
                        {(item.discount > 0 || item.quantidade > 1) && <>
                            {item.discount > 0 && <><div style={{whiteSpace:"nowrap", color:"var(--text-b)"}}>
                                {moneyMask(item.value)}
                            </div>
                            <div style={{color:"var(--warn)"}}>
                                -{Math.round(item.discount)}%
                            </div></>}
                            {item.quantidade > 1 && <>
                                <div style={{color:"var(--text-c)"}}>
                                    {moneyMask(item.value)}
                                </div>
                                <div style={{color:"var(--success)"}}>
                                    x{item.quantidade} un
                                </div>
                            </>}
                        </>}
                        <label>
                            {moneyMask(item.value*item.quantidade)}
                        </label>
                    </div>
                </div>
                )
            }
            
        }))
    }

    productTemplate(product) {
        // console.log(product)
        let is_selected = this.props.sale_cart?.id == this.props.selected_order?.id
        let last_action = this.get_last_action(product)
        return (
            <div id={this.props.id}  ref={(el)=>this.order_card_ref = el} key={product.name}
                className={(is_selected?'border-purple-400 border-2 ':'border-blue-900 border-2 ')+"order-card product-item flex w-full md:max-w-50 flex-grow-1 " + this.props?.className}
            >
                <InViewWrapper
                    className='p-0 m-0 relative w-full h-full'
                    timer={0}
                    progress={!this.state.loaded}
                    onExecute={(element)=>{
                        this.setState({loaded:true,in_view:true})
                        // element.stopObserver()
                    }}
                    inView={()=>{
                        this.setState({in_view:true})
                    }}
                    outView={()=>{
                        this.setState({in_view:false})
                    }}
                >
                    
                    <div className=' flex flex-grow-1 w-full flex-wrap h-full align-items-between justify-content-center'>
                        <div style={{width:"100%"}}>
                            {/* <label className='text-gray-500'>{`Card ${this.props.card_index+1}`}</label> */}
                            <h4 className="mb-1 mt-1" style={{color:"var(--text)"}}>Pedido: {product.id}</h4>
                            <h5 style={{color:"var(--text-c)"}}>{dateMask(product.date)}</h5>
                            
                            {/* <span className={`product-badge status-${product.inventoryStatus.toLowerCase()}`}>{product.inventoryStatus}</span> */}
                            
                            <div className="card-buttons mt-3 mb-3">
                                <Button
                                    icon="pi pi-copy text-2xl "
                                    tooltip='Clonar'
                                    tooltipOptions={this.tooltip_options}
                                    className="p-button-success bg-glass-c hover:bg-bluegray-900 hover:text-white text-green-300 p-button-rounded m-2 p-4 border-2"
                                    onClick={(event)=>{
                                        // console.log("Clone ")
                                        this.props.clone?.(product)
                                    }}
                                />

                                <Button
                                    icon="pi pi-chart-bar text-2xl "
                                    tooltip='Informações'
                                    tooltipOptions={this.tooltip_options}
                                    className="p-button-help bg-glass-c hover:bg-bluegray-900 hover:text-white text-purple-300 p-button-rounded m-2 p-4 border-2"
                                    onClick={(event)=>{
                                        // console.log("Edit Draft")
                                        // this.props.view?.(product)
                                        
                                    }}
                                />

                                <Button
                                    icon="pi pi-link text-2xl "
                                    tooltip='Gerar Link'
                                    tooltipOptions={this.tooltip_options}
                                    className="p-button-info bg-glass-c hover:bg-bluegray-900 hover:text-white text-blue-300 p-button-rounded m-2 p-4 border-2"
                                    onClick={(event)=>{
                                        // console.log("Get Link")
                                        this.props.link?.(product)
                                    }}
                                />
                            </div>


                            {product.history && <Button
                                style={{pointerEvents:"all"}}
                                className='shadow-none p-button-success p-button-text p-button-sm p-button-rounded pt-0 pb-0 mb-2 pl-2 pr-2'
                                label={capitalize(last_action.action) + ' ' + time_ago(last_action.date).toLocaleLowerCase()}
                                // tooltip={new Date(product.history[0]).toLocaleString()}
                                onClick={()=>{
                                    this.setState({show_timeline:!this.state.show_timeline})
                                }}
                            />}

                            <div className='flex flex-wrap w-full flex-grow-1 scrollbar-none overflow-x-hidden overflow-y-scroll'
                                style={{
                                    width:"100%",
                                    // overflow:"hidden",
                                    // borderRadius:"10px",
                                    maxHeight:"30rem",
                                    // pointerEvents:"all"
                                }}
                            >
                                <div className='flex grid w-full flex-grow-1'>
                                    {this.product_list(product)}
                                </div>
                                
                                <div className='flex-grow-1 w-full mt-8' />
                            </div>
                        </div>
                        <div div className={'bg-gradient-bottom pointer-events-none absolute flex w-full h-5rem bottom-0 bg-blur-1 z-0'}></div>
                        <div div className={(is_selected?'bg-gradient-bottom':'bg-white-gradient-bottom') +' pointer-events-none absolute flex flex-wrap w-full h-5rem justify-content-center bottom-0 z-0 blur-1'}>
                        <div div className={' absolute flex flex-wrap w-full h-5rem justify-content-center mt-3 bottom-0 bg-blur-1 z-0'} />
                        </div>
                        <div className='absolute flex flex-wrap w-full h-5rem align-items-center justify-content-center bottom-0 z-1' >
                            <div className='relative z-1 flex align-items-center gap-1 justify-content-between w-full p-3'>
                                <h5 className={is_selected?'text-green-300':'text-gray-100'}>Total :</h5>
                                <h3 className={is_selected?'text-white text-4xl':'text-white'}>{
                                    moneyMask(product.total)
                                }</h3>
                            </div>

                        </div>
                        <div className={(is_selected?"border-purple-800":"border-blue-800") + " border-8 opacity-60 flex w-full h-full absolute top-0 left-0 blur-4 z-0 pointer-events-none"} />
                    </div>
                </InViewWrapper>
            </div>
        );
    }
    render() {
        return (this.productTemplate(this.props.sale_cart));
    }

}