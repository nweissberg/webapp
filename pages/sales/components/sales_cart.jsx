import React from "react";
import localForage from "localforage";
import { Toast } from 'primereact/toast';
import { normalize } from "../../utils/util";
import Swal from 'sweetalert2';
import ProductSidebar from "./product_sidebar";
import SalesHeader from "./sales_header";
import ProductCard from "./product_card";
// import { scrollToBottom, } from "../../utils/util";
import { Tooltip } from 'primereact/tooltip';
import { Sidebar } from "primereact/sidebar";
import { deepEqual } from "@firebase/util";
import FiltersPanel from "./filters_panel";
import SalesCartTable from "./sale_cart_table";
import GroupIcons from "../../components/groups_icons";
import ProductsViewer from "../../components/products_viewer";
import OrderCarousel from "../../profile/components/orders_carousel";

const pedidos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

export default class SalesCart extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            show_cart:false, // Alterna entre carrinho de compra em lista do pedido e busca de materiais
            sale_cart: null, 
            show_item_info:false,
            item_info:null,
            item_selected:null,
            search:"",
            barcode_item:null,
            barcode_search:"",
            search_focus:false,
            search_result:[],
            scroll_position:0,
            mobile_info:false,
            groups:[],
            selected_group:-1,
            group_filter:false,
            active_groups:[...this.props.groups.map((group)=>group.id)],
            selected_groups:[...this.props.groups],
            search_field:null,
        }
        this.scroll_listener = false
        this.load_on_scroll=30
        this.showSuccess = this.showSuccess.bind(this);
    }
    componentDidMount(){
        pedidos_db.getItem(this.props.user.uid).then(async(data)=>{
            // console.log(data)
            
            if(data != null){
                // this.setState({
                //     show_cart:true,
                // })
                var _last_cart = data.drafts.shift()
                if(!_last_cart) return
                // console.log(_last_cart, this.state.sale_cart)
                var promise_buffer =[]
                await Promise.all(
                    _last_cart.items.map((item)=>{
                        return(this.props.product_db
                            .getItem(item.id.toString())
                            .then((item_data)=>{
                                item.data = item_data
                                promise_buffer.push(item)
                            })
                        )
                    })
                )
                if(promise_buffer.length != 0){
                    this.setState({show_cart:true, search_result:[]})
                }
                _last_cart.items = promise_buffer
                // console.log(_last_cart)
                
                this.setState({sale_cart:_last_cart},()=>{
                    this.updateProducts(_last_cart)
                    // this.setState({search_result:_last_cart.items.map((i)=>i.data)})
                })
            }
        })
        this.setState({selected_groups:this.props.groups})
        this.updateObject()
    }
    componentWillUnmount() {
        // document.getElementById("search_window")?.removeEventListener('scroll', this.listenToScroll)
        // this.scroll_listener = false
    }

    onSelectItem(_item){
        var _selected_item = this.state.sale_cart?.items.find((i)=>i.data?.PRODUTO_ID == _item?.PRODUTO_ID)
        
        // this.props.set_select(_selected_item)
        
        this.setState({
            item_info:_item,
            item_selected:_selected_item
        },(()=>{
            this.setState({mobile_info:true})
        }))
    }

    componentDidUpdate(){
        if(this.props.select_item && (this.props.select_item?.id != this.state.item_selected?.id ) ){
            this.onSelectItem(this.props.select_item.data)
        }
        if(this.props.groups != undefined && deepEqual(this.props.groups,this.state.groups) == false){
            this.setState({
                groups:this.props.groups,
                active_groups:[...this.props.groups.map((group)=>group.id)],
                selected_groups:[...this.props.groups],
            })
        }
        this.updateObject()
    }
    updateObject(){
        // document.getElementById("search_window")?.addEventListener('scroll', this.listenToScroll)
        this.props.onLoad?.(this);
    }
    // listenToScroll = () => {
    //     const element_scroll = document.getElementById("search_window")
    //     const winScroll = element_scroll.scrollTop
      
    //     const height =
    //         element_scroll.scrollHeight -
    //         element_scroll.clientHeight
      
    //     const scrolled = winScroll / height
      
    //     this.setState({
    //         scroll_position: scrolled,
    //     })
    //     // console.log(scrolled, this.state.search_result.length,this.load_on_scroll)
    //     if(scrolled > 0.8 && this.state.search_result.length > this.load_on_scroll){
    //         this.load_on_scroll += 10
    //     }
    // }

    showSuccess(item) {
        this.toast.show({
            severity:'success',
            summary: 'Produto removido',
            detail:item.data.PRODUTO_NOME,
            life: 1500
        });
    }

    updateProducts(_sale_cart){
        this.setState({sale_cart:_sale_cart})
        this.props.updateProducts(_sale_cart)
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
                text: `Remover o item "${item.data.PRODUTO_NOME}" do carrinho?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--teal-700)',
                cancelButtonColor: 'var(--orange-700)',
                confirmButtonText: 'Sim, remover!'
            }).then((result) => {
                // console.log(this)
                if (result.isConfirmed) {
                    // this.showSuccess(item)
                    _sale_cart.items.splice(removeIndex,1)
                    this.setState({sale_cart:_sale_cart,item_selected:null})
                    // this.props.select_item?.(null)
                    
                }else{
                    var _item_selected = {...this.state.item_selected}
                    _item_selected.quantity = 1
                    this.setState({item_selected:_item_selected})
                }
                this.props.updateProducts(_sale_cart)
            })
        }
    }
    get_search(_search){
        var search = _search.replace(/^\s+|\s+$|\s+(?=\s)/g, "")
        var _search_result = {}
        if(!this.props.items)return
        // console.log(search)
        var search_array = search.split(" ")
        search_array.map((term, index)=>{
            this.props.all_products.map((item)=>{
                if(!item) return
                if(item.PRODUTO_ID == undefined) return
                if(item.COD_BARRA.toString().indexOf(term)==0){
                    // console.log(item)
                    _search_result[item.PRODUTO_ID] = {data:item, score: search_array.length}
                }
            })
            this.props.items.map((item)=>{
                if(!item) return
                if(item.PRODUTO_ID == undefined) return
                if(item.PRODUTO_ID.toString().indexOf(term)==0){
                    // console.log(item)
                    _search_result[item.PRODUTO_ID] = {data:item, score: search_array.length}
                    if(_search_result[item.PRODUTO_ID]){
                        _search_result[item.PRODUTO_ID].score += 1
                    }
                }
                
                // 7898174873154 7898174839145
                var name_index = item.PRODUTO_NOME && normalize(item.PRODUTO_NOME).toLowerCase().indexOf(normalize(term).toLowerCase())
                if (name_index != -1) {
                    _search_result[item.PRODUTO_ID] = {data:item, score: search_array.length - index}
                    if(normalize(item.PRODUTO_NOME).toLowerCase().indexOf(normalize(search).toLowerCase()) != -1){
                        _search_result[item.PRODUTO_ID].score += 1
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
                <Tooltip target=".scan_barcode"/>
                {/* {this.state.mobile_info == true && */}
                <Sidebar
                    blockScroll
                    style={{
                        width:"100%",
                        maxWidth:"500px",
                        background:"#0000"
                    }}
                    position="right"
                    showCloseIcon={false}
                    visible={this.state.mobile_info}
                    onHide={(event)=>{
                        this.props.set_select(null)
                        this.setState({
                            mobile_info:false,
                            // item_info:null
                        })
                    }}
                >
                    <div >
                        <ProductSidebar style={{
                            // position:"absolute",
                            paddingTop:"30px",
                            // maxWidth:"500px",
                            top:"0px",
                            width:"100%",
                            // height:"100vh",
                            // zIndex:5,
                            backgroundColor:"var(--glass-b)",
                            backdropFilter:"blur(20px)",
                        }}
                        user={this.props.user}
                        check_rule={this.props.check_rule}
                        // sidebar={window.innerWidth<500}
                        groups={this.props.groups}
                        anim={false}
                        close={false}
                        item={this.state.item_info}
                        item_selected={this.state.item_selected}
                        onHide={(event)=>{
                            this.props.set_select(null)
                            this.setState({
                                mobile_info:false,
                                item_selected:null
                                // item_info:null
                            })
                        }}
                        removeItem={(item)=>{
                            this.removeItem(item)
                            this.setState({show_item_info:false})
                        }}
                        updateProduct={(item)=>{
                            var _sale_cart = {...this.state.sale_cart}
                            if(!_sale_cart.items) return
                            _sale_cart.items = _sale_cart.items.map((i,index)=>{
                                if(i.id == item.id){
                                    i = item
                                }
                                return(i)
                            })
                            this.updateProducts(_sale_cart)
    
                            // console.log("update",item, item.quantity)
                        }}
                        onAddProduct={(event)=>{
                            const new_product = this.props.onAddProduct(event)
                            // console.log(new_product)
                            // this.updateProducts()
                            // this.updateProducts(new_product)
                            this.setState({item_selected:{
                                id:event.PRODUTO_ID,
                                data:event,
                                quantity:1,
                                discount:0.0,
                                internal_use:false,
                                sale_price:event.PRECO
                            }})
                        }}
                        />
                    </div>
                </Sidebar>
                
                <Toast ref={(el) => this.toast = el} position='bottom-left'/>
                
                <SalesHeader
                    user_uid={this.props.user.uid}
                    sale={this.props.sale}
                    sale_cart={this.props.sale_cart}
                    show_cart={this.state.show_cart}
                    show_filters={(event)=>{this.setState({group_filter:true})}}
                    items={this.props.items}
                    all_products={this.props.all_products}
                    search_result={this.state.search_result}
                    group={this.state.selected_group}
                    client={this.props.client}
                    onLoad={(obj)=>{
                        this.setState({search_field:obj})
                    }}
                    addItemToCart={(_item)=>{
                        if(!_item) _item = this.state.search_result[0]
                        
                        this.updateProducts(this.props.onAddProduct(_item))
                    }}
                    set_search={(value)=>{
                        
                        // console.log(value)
                        if(!value){
                            value = this.props.items
                            //Mostra os grupos se search_result == []
                        // scrollToBottom()
                        this.setState({search_result:value, show_cart:false})
                        }else{
                            // console.log("teste")
                            this.setState({
                                show_cart:false,
                                item_info: null,
                                search:"",
                                search_result:[],
                                selected_group:-1
                            })
                        }
                        
                    }}
                    get_search={(value)=>{
                        // scrollToBottom()
                        this.get_search(value)
                    }}
                    toggle_cart={(event)=>{
                        
                        // this.props.select_item?.(null)
                        this.setState({
                            show_cart:!this.state.show_cart,
                            item_info: null,
                            search:"",
                            search_result:[],
                            selected_group:-1
                        })
                    }}
                    search_focus={(event)=>{
                        if(event.target.value == ""){
                            // this.setState({search_result:[]})
                            this.load_on_scroll = 20
                        }
                        this.setState({search_focus:true})
                        // scrollToBottom()
                    }}
                    search_blur={(event)=>{
                        // console.log(event)
                        if(event.target.value == ""){
                            // this.setState({search_result:[]})
                            this.load_on_scroll = 20
                        }
                        this.setState({search_focus:false})

                    }}
                    updateProducts={(_sale_cart)=>{
                        if(_sale_cart){
                            this.updateProducts(_sale_cart)
                        }else{
                            this.setState({
                                show_cart:false,
                                search_result:this.state.sale_cart?.items.map(item=>item.data),
                                search:"",
                                selected_group:0
                            })
                        }
                    }}
                    onAddProduct={(event)=>{
                        const new_product = this.props.onAddProduct(event)
                        // console.log(new_product)
                        // this.updateProducts()
                        this.updateProducts(new_product)
                        this.setState({item_selected:{
                            id:event.PRODUTO_ID,
                            data:event,
                            quantity:1,
                            discount:0.0,
                            internal_use:false,
                            sale_price:event.PRECO
                        }})
                    }}
                    show_item={(item)=>{
                        // this.props.select_item?.(item)
                        
                        this.setState({
                            item_info:item,
                            mobile_info:true
                        })
                    }}
                />

                
                {!this.state.show_cart &&  <div className="flex absolute w-screen h-screen top-0 lg:align-items-center" >
                
                    
                    {this.state.search_result?.length == 0 && 
                        <GroupIcons
                            client={this.props.client}
                            groups={this.state.selected_groups}
                            selected={this.state.selected_group}
                            load={this.props.load_products_group}
                            load_client={this.props.load_products_client}
                            searchGroup={(data,group)=>{
                                // console.log(data)
                                this.setState({
                                    selected_group:group,
                                    search_result:data,
                                    scroll_position:0
                                })
                            }}
                        />
                    }
                
                </div>}
                {/* {this.state.selected_group == 0 && 
                <OrderCarousel />
                } */}

                {!this.state.show_cart &&
                    <ProductsViewer
                        products={this.state.search_result}
                        scroll={this.load_on_scroll}
                        cart={this.state.sale_cart}
                        onSelect={(_item)=>{
                            this.props.set_select(null)
                            this.onSelectItem(_item)
                        }}
                        updateProducts={(e)=>{this.updateProducts(e)}}
                        onAddProduct={this.props.onAddProduct}
                        onSubProduct={this.props.onSubProduct}
                    />
                }

                
                
                {this.state.show_cart &&
                    <SalesCartTable
                        sale_cart={this.state.sale_cart}
                        onAddProduct={(event)=>{
                            this.updateProducts(this.props.onAddProduct(event))
                        }}
                        onSubProduct={(event)=>{
                            this.updateProducts(this.props.onSubProduct(event))
                        }}
                        onUpdateProduct={(event)=>{
                            this.updateProducts(event)
                        }}
                        onShowInfo={(event)=>{
                            // console.log(event)
                            this.setState({
                                item_selected:event,
                                item_info:event.data,
                                mobile_info:true
                            })
                        }}
                    />
                }
                
                {/* {this.state.mobile_info == false && this.state.show_item_info &&
                <ProductInfo
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
                        this.updateProducts(_sale_cart)

                        // console.log("update",item, item.quantity)
                    }}
                />} */}
                
                <FiltersPanel 
                    items={this.state.search_result?.length > 0 ? this.state.search_result : this.props.items}
                    visible={this.state.group_filter}
                    onHide={(event)=>{
                        this.setState({group_filter:false})
                    }}
                    
                    selected_group={this.state.selected_group}
                    active_groups={this.state.active_groups}
                    groups={this.props.groups}
                    onChangeGroups={(event) => {
                        // console.log(event.value, this.props.groups)
                        var _selected_groups = this.props.groups.filter((group)=>{
                            if(event.value.indexOf(group.id) != -1){
                                return(group)
                            }
                        })
                        
                        this.setState({
                            item_info: null,
                            search:"",
                            selected_group:0,
                            show_cart:false,
                            search_result:[],
                            selected_groups:_selected_groups,
                            active_groups:event.value
                        })
                        // this.props.select_item?.(null)
                    }}
                    set_filter_search={(filtered_items)=>{
                        if(filtered_items.length > 0){
                            this.setState({search_result:filtered_items})
                        }else{
                            this.setState({search_result:[]})
                        }
                    }}
                />
            </div>
        )
    }
}