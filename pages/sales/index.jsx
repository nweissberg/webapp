import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth";
import SalesFooter from "./components/sales_footer";
import SalesCart from "./components/sales_cart";
import { api_get } from "../api/connect";
import ProductSidebar from "./components/product_sidebar";
import { ProgressBar } from 'primereact/progressbar';
import localForage from "localforage";

const product_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'produtos'
});

export default function SalesPage(){
    var load_products = true
    const [ sale_cart, set_sale_cart] = useState({name:"", items:[]})
    const [ cart_obj, set_cart_obj] = useState(null)
    const [ products, set_products] = useState(null)
    const { currentUser } = useAuth()
    const [ selected_item, set_selected_item] = useState(null)

    useEffect(()=>{
        console.log(sale_cart)
        window.addEventListener('resize', ()=>{})
    },[])

    useEffect(()=>{
        // console.log(currentUser)
        // pedidos_db.getItem(currentUser.uid).then((data)=>{
        //     console.log(data)
        //     set_sale_cart(data)
        // })
    },[currentUser])

    useEffect(()=>{
        // console.log(sale_cart)
    },[sale_cart])

    useEffect(()=>{
        if(load_products){
            var _products = []
            product_db.iterate(function(value) {
                _products.push(value)
                // console.log([key, value]);
            }).then(()=>{
                if(_products.length > 0) set_products(_products)

                api_get({
                    credentials: "0pRmGDOkuIbZpFoLnRXB",
                    keys:[{
                        key:"Tabela_id",
                        value:"6",
                        type:"string"
                    }],
                    query:"h0sZNFPNWaR5W8WVDE8r"
                }).then((data)=>{
                    // console.log(products)
                    
                    var _data = [...data.map((item)=>{
                        
                        if(_products.length > 0) _products.forEach(_item => {
                            if(_item.pid == item.pid){
                                if(_item.photo != undefined && _item.photo != null){
                                    if(typeof(_item.photo) == "object"){
                                        item.photo = _item.photo
                                    }
                                    return
                                }
                            }
                        });

                        // if(item.photo != null){
                        //     item.photo = "data:image/png;base64," + new Buffer.from(item.photo).toString("base64")
                        // }
                        product_db.setItem(item.pid.toString(), item);
                        return(item)
                    })]
                    
                    set_products(_data)
                })
            })

            load_products = false
        }
    },[])

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Vendas"
            }}
            // header={false}
        >
            {products == null && <ProgressBar
                // color="var(--primary-c)"
                mode="indeterminate"
                style={{
                    height: '6px',
                    marginBottom:"-6px",
                    position:"relative",
                    zIndex:10002
                }}>        
            </ProgressBar>}

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
                        product_db={product_db}
                        user={currentUser}
                        selected={selected_item}
                        items={products}
                        sale_cart={sale_cart}
                        onAddProduct={(item)=>{
                            var _sale_cart = {...sale_cart}

                            var isInCart = _sale_cart.items.map((i,index)=>{
                                if(i.id == item.pid){
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
                                _sale_cart.items.push({id:item.pid, data:item, quantity:1, discount:0.0, sale_price:item.price})
                            }else{
                                _sale_cart.items[isInCart[0]].quantity += 1
                            }
                            set_sale_cart(_sale_cart)
                            return(_sale_cart)
                        }}

                        onSubProduct={(item)=>{
                            var _sale_cart = {...sale_cart}

                            var isInCart = _sale_cart.items.map((i,index)=>{
                                if(i.id == item.pid){
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
                                _sale_cart.items.push({id:item.pid, data:item, quantity:1, discount:0.0, sale_price:item.price})
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
                            set_products(_products.map((item)=>{
                                if(item.pid == _item.pid){
                                    // console.log(_item)
                                    return(_item)
                                }else{
                                    return(item)
                                }
                            }))
                        }}
                        updateProducts={(_sale_cart)=>{
                            // console.log(_sale_cart)
                            set_sale_cart(_sale_cart)
                        }}
                        select_item={(item)=>{
                            // console.log(item)
                            set_selected_item(item)
                        }}
                    />
                </div>
                {selected_item && window.innerWidth > 500 &&
                    <ProductSidebar
                    item={selected_item}
                    onHide={(event)=>{set_selected_item(null)}}
                />}
            </div>

            <SalesFooter
                user={currentUser}
                sale_cart={sale_cart}
                updateProducts={()=>{
                    cart_obj.setState({
                        search_result:sale_cart.items.map(item=>item.data),
                        search:""
                    })
                }}
                save_cart={(_sale_cart)=>{
                    // console.log(_sale_cart)
                    set_sale_cart(_sale_cart)
                }}
            />
            
        </ObjectComponent>
    );
}