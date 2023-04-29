import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth";
import SalesFooter from "./components/sales_footer";
import SalesCart from "./components/sales_cart";
import { api_get } from "../api/connect";
import ProductSidebar from "./components/product_sidebar";
import { ProgressBar } from 'primereact/progressbar';
import localForage from "localforage";
import { useRouter } from 'next/router'
import { Button } from "primereact/button";
import { useSales } from "../contexts/context_sales";
import { useProducts } from "../../contexts/products_context";

const product_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'produtos'
});
const pedidos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

export default function SalesPage(){
    var load_products = true
    const [ sale_cart, set_sale_cart] = useState({name:"", items:[]})
    const [ cart_obj, set_cart_obj] = useState(null)
    // const [ products, set_products] = useState(null)
    const { currentUser } = useAuth()
    const [ selected_item, set_selected_item] = useState(null)
    const [ select_item, set_select_item] = useState(null)
    const router = useRouter()
    const [client, set_client] = useState(null)
    const {test_context} = useSales()
    
    const [loaded_group, set_loaded_group] = useState([0,0,0,0,0])
    
    const {
        load_top_products,
        load_products_client,
        load_products_group,
        products,
        groups,
        load_local_products,
        profiles,
        all_products,
        load_groups,
        check_rule
    } = useProducts()

    // useEffect(()=>{
    //     console.log(sale_cart)
    //     window.addEventListener('resize', ()=>{})
    // },[])

    // useEffect(()=>{
    //     // console.log(currentUser)
    //     if(currentUser === null){
    //         router.push("/login")
    //     }
    //     pedidos_db.getItem(currentUser.uid).then((data)=>{
    //         console.log(data)
    //         // set_sale_cart(data)
    //     })
    // },[currentUser])

    useEffect(()=>{
        console.log(sale_cart)
        load_groups()
    },[])

    // useEffect(()=>{
    //     console.log(groups)
    // },[groups])

    // if(currentUser == null) return(<ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom:"-6px" }}/>)

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Vendas"
            }}
        >
                <div className="flex justify-content-between flex-wrap">
                    
                    <div style={{
                        position:"absolute",
                        width:selected_item && window.innerWidth > 500?"70%":"100%",
                        
                        // overflow:"hidden"
                    }}>
                        <SalesCart 
                            onLoad={(obj)=>{
                                // console.log(obj)
                                set_cart_obj(obj)
                            }}
                            select_item={select_item}
                            set_select={(_item)=>{
                                // console.log(_item)
                                set_select_item(_item)
                            }}
                            // show_filters={(event)=>{
                            //     set_group_filter(true)
                            // }}
                            load_products_group={(group_id)=>{
                                // load_top_products(group_id)
                                return load_products_group(group_id)
                            }}
                            load_products_client={(client_id)=>{
                                return load_products_client(client_id)
                            }}
                            client={client}
                            groups={groups}
                            product_db={product_db}
                            user={currentUser}
                            selected={selected_item}
                            items={products}
                            all_products={all_products}
                            sale_cart={sale_cart}
                            check_rule={check_rule}
                            onAddProduct={(item)=>{
                                var _sale_cart = {...sale_cart}

                                var isInCart = _sale_cart.items.map((i,index)=>{
                                    if(i.id == item.PRODUTO_ID){
                                        return(index.toString())
                                    }else{
                                        return(null)
                                    }
                                })
                                .filter((index)=>{
                                    if( index !== null ){
                                        return(index)
                                    }
                                })

                                // console.log(isInCart)

                                if(isInCart[0] == null){
                                    _sale_cart.items.push({
                                        id:item.PRODUTO_ID,
                                        // PRODUTO_NOME:item.PRODUTO_NOME,
                                        data:item,
                                        quantity:1,
                                        discount:0.0,
                                        internal_use:false,
                                        sale_price:item.PRECO
                                    })
                                }else{
                                    _sale_cart.items[isInCart[0]].quantity += 1
                                }
                                set_sale_cart(_sale_cart)
                                return(_sale_cart)
                            }}

                            onSubProduct={(item)=>{
                                var _sale_cart = {...sale_cart}

                                var isInCart = _sale_cart.items.map((i,index)=>{
                                    if(i.id == item.PRODUTO_ID){
                                        return(index.toString())
                                    }else{
                                        return(null)
                                    }
                                })
                                .filter((index)=>{
                                    if( index !== null ){
                                        return(index)
                                    }
                                })

                                // console.log(isInCart)

                                if(isInCart[0] == null){
                                    _sale_cart.items.push({
                                        id:item.PRODUTO_ID,
                                        data:item,
                                        quantity:1,
                                        discount:0.0,
                                        internal_use:false,
                                        sale_price:item.PRECO
                                    })
                                }else{
                                    if(_sale_cart.items[isInCart[0]].quantity>1){
                                        _sale_cart.items[isInCart[0]].quantity -= 1
                                    }else{
                                        _sale_cart.items.splice(isInCart[0],1)
                                    }
                                }
                                set_sale_cart(_sale_cart)
                                return(_sale_cart)
                            }}
                            updateItem={(_item)=>{
                                var _products = [...products]
                                // set_products(_products.map((item)=>{
                                //     if(item.PRODUTO_ID == _item.PRODUTO_ID){
                                //         // console.log(_item)
                                //         return(_item)
                                //     }else{
                                //         return(item)
                                //     }
                                // }))
                            }}
                            updateProducts={(_sale_cart)=>{
                                // console.log(_sale_cart)
                                set_sale_cart(_sale_cart)
                            }}
                        />
                    </div>
                    {selected_item && window.innerWidth > 500 &&
                        <ProductSidebar
                            check_rule={check_rule}
                            user={currentUser}
                            groups={groups}
                            item={selected_item}
                            onHide={(event)=>{set_selected_item(null)}}
                            item_selected={sale_cart.items.find((cart_item)=>cart_item.id == selected_item.PRODUTO_ID) }
                            updateProduct={(item)=>{
                                var _sale_cart = {...sale_cart}
                                _sale_cart.items = _sale_cart.items.map((i,index)=>{
                                    if(i.id == item.id){
                                        i = item
                                    }
                                    return(i)
                                })
                                // this.updateProducts(_sale_cart)
                                set_sale_cart(_sale_cart)
        
                                // console.log("update",item, item.quantity)
                            }}
                        />
                    }
                    
                </div>

                <SalesFooter
                    user={currentUser}
                    sale_cart={sale_cart}
                    profiles={profiles}
                    check_rule={check_rule}
                    test_context={test_context}
                    updateProducts={()=>{
                        cart_obj.setState({
                            show_cart:!cart_obj.state.show_cart,
                            search_result:sale_cart.items.map(item=>item.data),
                            search:"",
                            selected_group:0
                        })
                    }}
                    featureProducts={(_items)=>{
                        console.log(_items)
                        // item_info
                        // this.props.select_item(_items[0])
                        set_select_item(_items[0])
                        cart_obj.setState({
                            show_cart:false,
                            search_result:[{type:'split',PRODUTO_NOME:"Revisar produtos", icon:"pi pi-exclamation-triangle text-orange-400" }, ... _items.map(item=>item.data),{type:'split',PRODUTO_NOME:"Restante do carrinho"},...sale_cart.items.map(item=>item.data)],
                            search:"",
                            selected_group:0
                        })
                    }}
                    save_cart={async(_sale_cart)=>{
                        console.log(_sale_cart)
                        var _items = _sale_cart.items.map(async(item)=>{
                            return product_db.getItem(item.id.toString()).then((item_data)=>{
                                return(item_data)
                            })
                        })
                        await Promise.all(_items).then((data)=>{
                            console.log(data)
                            set_sale_cart(data)
                        })
                        console.log("Teste")
                    }}
                    setClient={(client)=>{
                        set_client(client)
                    }}
                    // showGroups={()=>{
                    //     cart_obj.setState({search_result:[]})
                    // }}
                />
                
                
        </ObjectComponent>
    );
}