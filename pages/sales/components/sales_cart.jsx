import { Button } from "primereact/button";
import { Toast } from 'primereact/toast';
import React from "react";
import { moneyMask, similarText, normalize } from "../../utils/util";
import ProductCard from "./product_card";
import QuantityInput from "./quantity_input";
import Swal from 'sweetalert2';
import ProductInfo from "./product_info";
import ProductSidebar from "./product_sidebar";
import { loadItemPhoto } from '../service/sales_service';
import localForage from "localforage";
import SalesHeader from "./sales_header";

const pedidos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

export default class SalesCart extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            show_cart:false,
            sale_cart: null,
            show_item_info:false,
            item_info:null,
            item_selected:null,
            search:"",
            search_result:props.items,
            scroll_position:0,
            mobile_info:false
        }
    
        this.showSuccess = this.showSuccess.bind(this);
    }
    componentDidMount(){
        pedidos_db.getItem(this.props.user.uid).then((data)=>{
            if(data != null){
                console.log(data, this.state.sale_cart)
                this.setState({sale_cart:data},()=>{
                    this.props.updateProducts(data)
                    this.setState({search_result:data.items.map((i)=>i.data)})
                })
            }
        })
        this.props.onLoad?.(this);
    }
    // componentDidMount() {
    //     window.addEventListener('scroll', this.listenToScroll)
    // }
    
    // componentWillUnmount() {
    //     window.removeEventListener('scroll', this.listenToScroll)
    // }
    
    // listenToScroll = () => {
    //     const winScroll =
    //         document.body.scrollTop || document.documentElement.scrollTop
      
    //     const height =
    //         document.documentElement.scrollHeight -
    //         document.documentElement.clientHeight
      
    //     const scrolled = winScroll / height
      
    //     this.setState({
    //         scroll_position: scrolled,
    //     })
    //     console.log(scrolled)
    // }

    showSuccess(item) {
        this.toast.show({
            severity:'success',
            summary: 'Produto removido',
            detail:item.data.name,
            life: 1500
        });
    }

    updateProducts(sale_cart){
        this.setState({sale_cart:sale_cart})
    }
    updateCart(item,key){
        if(!item) return
        var _sale_cart = {...this.props.sale_cart}
        _sale_cart.items = _sale_cart.items.map((i,index)=>{
            if(i.id == item.id){
                i[key] = item[key]
            }
            return(i)
        })
        // console.log(_sale_cart)
        this.setState({sale_cart:_sale_cart})
        this.props.updateProducts(_sale_cart)
    }
    removeItem(item,index){
        var _sale_cart =  {...this.state.sale_cart}
        var removeIndex = null
        _sale_cart.items = _sale_cart.items.map((i,index)=>{
            if(i.id == item.id){
                i = item
                removeIndex = index
            }
            return(i)
        })
        if(removeIndex !== null){
            Swal.fire({
                title: 'Aviso',
                text: `Remover o item "${item.data.name}" do carrinho?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--teal-700)',
                cancelButtonColor: 'var(--orange-700)',
                confirmButtonText: 'Sim, remover!'
            }).then((result) => {
                // console.log(this)
                if (result.isConfirmed) {
                    this.showSuccess(item)
                    _sale_cart.items.splice(removeIndex,1)
                    this.setState({sale_cart:_sale_cart})
                    this.props.select_item?.(null)
                }
                this.props.updateProducts(_sale_cart)
            })
        }
    }
    get_search(){
        var _search_result = {}
        if(!this.props.items)return

        var search_array = this.state.search.replace(/^\s+|\s+$|\s+(?=\s)/g, "").split(" ")
        search_array.map((term, index)=>{
            this.props.items.map((item)=>{
                var name_index = item.name && normalize(item.name).toLowerCase().indexOf(normalize(term).toLowerCase())
                if (name_index != -1) {
                    if(_search_result[item.pid]){
                        _search_result[item.pid].score += 1
                    }else{
                        _search_result[item.pid] = {data:item, score: search_array.length - index}
                    }
                }
            })
        })
        
        var keysSorted = Object.entries(_search_result)
        keysSorted.sort(function(a,b) {
            return b[1].score - a[1].score;
        });
        if(!keysSorted[0]?.[1])return([])
        var maxScore = keysSorted[0][1].score
        const _search_array = keysSorted.map((key)=>{
            if(key[1].score<maxScore){
                return(null)
            }else{
                return(key[1].data)
            }
        })
        // console.log(_search_array)
        this.setState({search_result:_search_array.filter(i=>i)})
    }

    render(){
        return(
            <div>
                {this.state.mobile_info == true &&
                <div >
                    <ProductSidebar style={{
                        position:"absolute",
                        maxWidth:"500px",
                        width:"100vw",
                        height:"100vh",
                        zIndex:5,
                        backgroundColor:"var(--glass-b)",
                        backdropFilter:"blur(20px)",
                    }}
                    item={this.state.item_info}
                    onHide={(event)=>{this.setState({mobile_info:false})}}
                    />
                </div>
                }
                <Toast ref={(el) => this.toast = el} position='bottom-left'/>
                
                <SalesHeader />

                {!this.state.show_cart && <div className="flex justify-content-start flex-wrap row-gap-2 column-gap-2"
                    style={{
                        overflow:"scroll",
                        maxHeight:window.innerWidth>960?"calc(100vh - 110px)":"100vh",
                        // height:"maxcontent",
                        // padding:"10px",
                        // backgroundColor:"var(--glass)", 
                        width:"100%",
                        // backdropFilter: "blur(10px)",
                        left:"50%",
                        paddingTop:"60px",
                        paddingLeft:"9vw",
                        paddingBottom:(window.innerWidth < 500? "140px" :"90px")
                    }}
                    >
                    { this.state.search_result && this.state.search_result.slice(0,40).map((item,index)=>{
                        var quantity = 0
                        if(this.state.sale_cart !== null) this.state.sale_cart.items.map((i)=>{
                            if(i.data.pid == item.pid){
                                quantity = i.quantity
                            }
                        })
                        return(<ProductCard key={index}
                            item={item}
                            quantity={quantity}
                            onAddProduct={(event)=>{
                                this.updateProducts(this.props.onAddProduct(event))
                            }}
                            onSubProduct={(event)=>{
                                this.updateProducts(this.props.onSubProduct(event))
                            }}
                            onClick={(_item)=>{
                                // console.log(_item)
                                // this.props.select_item?.(_item)
                            }}
                            show_mobile_info={(_item)=>{
                                console.log(_item)

                                this.setState({
                                    item_info:_item
                                },(()=>{
                                    this.setState({mobile_info:true})
                                }))

                                // this.props.select_item?.(_item)
                                // this.setState({item_info:{_item}},()=>{this.setState({mobile_info:true})})
                            }}
                            onLoad={(obj)=>{
                                console.log(obj)
                            }}
                            // onLeaveViewport={() => console.log('leave ' + item.name)}
                            onEnterViewport={() => {
                                // console.log('enter ' + item.photo)
                                if(!item.photo){
                                    loadItemPhoto(item,(item_data)=>{
                                        console.log(item_data)
                                        var _search_result = [...this.state.search_result]
                                        this.setState({search_result:_search_result.map((item_old)=>{
                                            if(item_old.pid == item_data.pid){
                                                return(item_data)
                                            }else{
                                                return(item_old)
                                            }
                                        })})
                                        this.props.updateItem(item_data)
                                    })
                                }
                            }}
                            loadPhoto={(obj)=>{
                                // console.log(obj.state.photo)
                                loadItemPhoto(item,((item_data)=>{
                                    console.log(item_data)
                                    var _search_result = [...this.state.search_result]
                                    this.setState({search_result:_search_result.map((item_old)=>{
                                        if(item_old.pid == item_data.pid){
                                            return(item_data)
                                        }else{
                                            return(item_old)
                                        }
                                    })})
                                    this.props.updateItem(item_data)
                                }))
                            }}
                        />)  
                    })}
                    
                </div>}

                <div>
                {this.state.show_cart && 
                    <div style={{
                        width:'100%',
                        top:"50px",
                        paddingTop:"55px",
                        paddingBottom:"85px",
                        overflowX:"hidden",
                        height:window.innerWidth>960?"calc(100vh - 110px)":"100vh",
                    }}>
                        {this.state.sale_cart?.items.map((item,index)=>{
                            return(
                            <div key={index} className="flex flex-row product_line"
                                style={{
                                    // outline: "5px solid red",
                                    outlineOffset: "-2px",
                                    outline:this.props.selected?.pid === item.data.pid?"2px solid var(--primary-c)":"none"
                                }}
                                onClick={(event)=>{
                                    // console.log("SELECT ITEM: ",item.data.name)
                                    if(this.state.item_selected == null || this.state.item_selected.id != item.id){
                                        this.setState({
                                            item_info:item.data,
                                            item_selected:item
                                        })
                                        this.props.select_item?.(item.data)
                                    }
                                }}
                                // onTouchStart={(event)=>{
                                //     for (let i = 0; i < event.targetTouches.length; i++) {
                                //         this.setState({
                                //             item_info:item.data,
                                //             item_selected:item
                                //         })
                                //         console.log(`targetTouches[${i}].force = ${event.targetTouches[i].force}`);
                                //     }
                                // }}
                            >
                                <div style={{
                                    textAlign:"center",
                                    marginTop:"auto",
                                    marginBottom:"auto"
                                }}>
                                    <QuantityInput
                                        item={item}
                                        value={item.quantity}
                                        onAdd={()=>{
                                            var _sale_cart = {...this.state.sale_cart}
                                            _sale_cart.items[index].quantity += 1 
                                            this.props.updateProducts(_sale_cart)
                                        }}
                                        onSub={()=>{
                                            if(item.quantity > 1){
                                                var _sale_cart = {...this.state.sale_cart}
                                                _sale_cart.items[index].quantity -= 1
                                                this.props.updateProducts(_sale_cart)
                                            }else{
                                                // console.log(item)
                                                this.removeItem(item,index)
                                            }
                                        }}
                                    />
                                </div>

                                <div style={{
                                    // whiteSpace:"nowrap",
                                    // overflow:"scroll",
                                    width:"100%",
                                    minWidth:"100px",
                                    justifyContent:"center",
                                    marginTop:"auto",
                                    marginBottom:"auto",
                                    marginLeft:"10px"
                                }}>
                                    {item.data.name}
                                </div>
                                {item.discount > 0 && <>
                                <div className="hide_on_mobile" style={{
                                    color:"var(--text-c)",
                                    whiteSpace:"nowrap",
                                    textAlign:"center",
                                    marginTop:"auto",
                                    marginBottom:"auto",
                                    fontSize:"15px",
                                    marginRight:"10px"
                                    }}>
                                    {moneyMask(item.sale_price * item.quantity)}
                                </div>
                                 <div className="hide_on_mobile"
                                style={{
                                    textAlign:"center",
                                    marginTop:"auto",
                                    marginBottom:"auto",
                                    fontSize:"15px",
                                    color:"var(--alert)"
                                }}>-{Math.round(item.discount)}%</div>
                                </>}
                                <div style={{
                                    fontSize:"20px",
                                    whiteSpace:"nowrap",
                                    justifyContent:"center",
                                    textAlign:"center",
                                    marginTop:"auto",
                                    marginBottom:"auto",
                                    marginInline:"10px",
                                }}>
                                    {item.discount > 0 && <div
                                        className="show_on_mobile"
                                        style={{
                                            textAlign:"right",
                                            fontSize:"15px",
                                            color:"var(--text-c)"
                                        }}>
                                        {moneyMask(item.sale_price* item.quantity)}
                                    <div className="show_on_mobile"
                                        style={{
                                            textAlign:"right",
                                            marginTop:"auto",
                                            marginBottom:"auto",
                                            fontSize:"15px",
                                            color:"var(--alert)"
                                        }}>
                                            -{Math.round(item.discount)}%
                                    </div>
                                    </div>}
                                    {moneyMask((item.sale_price-(item.sale_price*(item.discount/100))) * item.quantity)}
                                </div>
                                <div className="hide_on_phone" 
                                    style={{
                                        textAlign:"center",
                                        marginTop:"auto",
                                        marginBottom:"auto",
                                        width:"30px"
                                    }}>
                                    <Button
                                        icon="pi pi-pencil"
                                        className="p-button-text p-button-secondary p-button-rounded"
                                        onClick={(event)=>{
                                            // console.log(item)
                                            this.setState({
                                                item_info:item
                                                
                                            },(()=>{
                                                this.setState({show_item_info:true})
                                                // console.log(this.state.item_info)
                                            }))
                                        }}
                                    />
                                </div>

                                {this.state.show_cart && window.innerWidth < 500  && this.state.item_selected?.id == item.id &&
                                    <div style={{
                                        top:"0px",
                                        left:"0px",
                                        position:"absolute",
                                        height:"100%",
                                        width:"100%",
                                        backgroundColor:"var(--glass-b)",
                                        // backdropFilter: "blur(5px)",
                                    }}>
                                        <Button className="flex align-items-center justify-content-center flex-wrap gap-4"
                                            style={{
                                                width:"100%",
                                                height:"100%",
                                                backgroundColor:"#0000",
                                                border:"2px solid var(--primary-c)"
                                            }}
                                            onClick={(event)=>{
                                                // console.log(event)
                                                this.setState({item_selected:null})
                                            }}
                                        >
                                            <Button
                                                style={{
                                                    backgroundColor:"var(--primary-c)",
                                                    border:"1px solid white"
                                                }}
                                                // disabled={this.state.item_info==null?true:false}
                                                className="p-button-rounded p-button-secondary"
                                                label="Editar"
                                                icon="pi pi-pencil"
                                                onClick={(event)=>{
                                                    // console.log(item)
                                                    event.stopPropagation()
                                                    this.props.select_item?.(item)
                                                    this.setState({show_item_info:true})
                                                }}
                                            />
                                            <Button
                                                style={{
                                                    backgroundColor:"var(--primary-c)",
                                                    border:"1px solid white"
                                                }}
                                                // disabled={this.state.item_info==null?true:false}
                                                className="p-button-rounded p-button-secondary"
                                                label="Detalhes"
                                                icon="pi pi-eye"
                                                iconPos="right"
                                                onClick={(event)=>{
                                                    event.stopPropagation()
                                                    this.setState({mobile_info:true})
                                                }}
                                            />
                                        </Button>
                                        
                                    </div>
                                    }
                            </div>)
                        })}
                        <div className="show_on_mobile" style={{paddingBottom:"65px"}}></div>
                    </div>
                    }
                </div>
                {this.state.mobile_info == false && this.state.show_item_info && <ProductInfo
                    show={this.state.show_item_info}
                    item={this.state.item_selected}
                    removeItem={(item)=>{
                        this.removeItem(item)
                        this.setState({show_item_info:false})
                    }}
                    onHide={(item)=>{
                        // console.log(item)
                        this.updateCart(item,"discount")
                        this.setState({show_item_info:false})
                    }}
                    updateProduct={(item)=>{
                        var _sale_cart = {...this.state.sale_cart}
                        _sale_cart.items = _sale_cart.items.map((i,index)=>{
                            if(i.id == item.id){
                                i = item
                            }
                            return(i)
                        })
                        this.props.updateProducts(_sale_cart)

                        console.log("update",item, item.quantity)
                    }}
                />}
                
            </div>
        )
    }
}