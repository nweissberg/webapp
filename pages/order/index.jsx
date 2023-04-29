import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useRouter } from 'next/router'
import { useAuth } from "../api/auth"
import { get_order, readRealtimeData } from "../api/firebase";
import localForage from "localforage";
import SalesCartTable from "../sales/components/sale_cart_table";
import HeaderTitle from "../components/title";
import { moneyMask } from "../utils/util";
import { useProducts } from "../../contexts/products_context";
import ProductSidebar from "../sales/components/product_sidebar";
import { Sidebar } from "primereact/sidebar";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import ErrorPopup from "../components/error_popup";

const produtos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'produtos'
});
const clientes_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'clientes'
});

export default function OrderPage(){
    const router = useRouter()
    const { asPath } = useRouter();
    const { currentUser } = useAuth()
    const [ loading, set_loading ] = useState(true)
    const [ order, set_order ] = useState(null)
    const [ selected_item, set_selected_item] = useState(null)
    const [ cart_table, set_cart_table] = useState(null)
    
    
    const {
        groups,
        load_groups,
        check_rule,
        load_product,
        clients
    } = useProducts()

    useEffect(()=>{
        // console.log(window.location)
        load_groups()
    },[])

    // useEffect(()=>{
    //     console.log(groups)
    // },[groups])

    useEffect(()=>{
        if(asPath.includes("#") == false){
            set_loading(false)
            return
        }
        const hash = asPath.split('#')[1];
        // console.log("View order "+ hash)

        var items_data = []
        get_order(hash).then(async (data)=>{
            const cart = data.data()
            console.log(cart)
            if(!cart){
                set_loading(false)
                return
            }

            items_data = cart.items.map(async(item)=>{
                // console.log(item)
                await produtos_db.getItem(item.id.toString()).then(async(item_data)=>{
                    // console.log(item_data)
                    if(!item_data) {
                        await load_product(item.id).then((item_data)=>{
                            // console.log(item_data)
                            item.data = item_data
                        })
                        return item
                    }
                    item.data = item_data
                    // console.log(item)
                    return item
                })
            })
            await Promise.all(items_data).then(async()=>{
                // if(currentUser){
                await readRealtimeData("users/"+cart.user_uid+"/name").then((order_user_data)=>{
                    // console.log(order_user_data)
                    cart.author = order_user_data
                })
                // }
                
                const client = clients.find(c=>c.id == cart.client)
                // console.log(client_id)
                if(client){
                    cart.client = client
                    cart.total = cart.items.length > 0 ? cart.items.map((item)=>{return((item.data?.PRECO-(item.data?.PRECO*(item.discount/100)))*item.quantity)}).reduce((sum,i)=> sum + i) : 0
                }
                set_loading(false)
                set_order(cart)
            })
        })
    }, [ asPath ]);

    useEffect(()=>{
        console.log(currentUser)
    },[currentUser])

    // useEffect(()=>{
    //     console.log(order)
    // },[order])
    
        
    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Pedido"
            }}
        >
        {!order && !loading && <ErrorPopup />}
        {loading && <ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom:"-6px" }}/>}
        <div className="">
                {order==null && <></>}
                {order && <div style={{
                    marginBottom:"55px"
                }}>
                    {currentUser?.uid != order.user_uid && <div className="flex justify-content-between"
                    style={{
                        padding:"10px",
                        color:"var(--text)",
                        backgroundColor:"var(--glass-b)",
                        backdropFilter:"blur(10px)"
                    }}>
                        <div>
                            <HeaderTitle title="Orçamento" value={order.name == ""?"SEM NOME":order.name}/>
                        </div>
                        <div>
                            <HeaderTitle title="Por" value={order.author}/>
                        </div>

                        {order.client && <div>
                            <HeaderTitle title="Cliente" value={order.client?.fantasia}/>
                        </div>}
                    </div>}

                    {currentUser?.uid == order.user_uid && <div className="flex justify-content-center"
                    style={{
                        padding:"10px",
                        color:"var(--text)",
                        backgroundColor:"var(--glass-b)",
                        backdropFilter:"blur(10px)",
                    }}>
                        <HeaderTitle title="Meu Orçamento" value={order.name == ""?"SEM NOME":order.name}/>
                    </div>}

                    <SalesCartTable 
                        check_rule={check_rule}
                        groups={groups}
                        user={currentUser}
                        editable={false}
                        sale_cart={order}
                        can_approve={currentUser && currentUser?.uid != order.user_uid}
                        sidebar={(item_selected)=>{
                            console.log(item_selected)
                        }}
                        onShowInfo={(event)=>{
                            console.log(event)
                            set_selected_item(event.data)
                        }}
                        onLoad={(obj)=>{
                            set_cart_table(obj)
                        }}
                    />    
                    <div className="flex justify-content-between w-full p-2 gap-3" style={{
                        position:"fixed",
                        bottom:"0px",
                        backgroundColor:"var(--glass-b)",
                        height:"90px",
                        backdropFilter:"blur(10px)",
                        
                    }}>
                        <HeaderTitle title="Valor Total" value={moneyMask(order.total)}/>
                        <Button
                            label="Linha do tempo"
                            icon="pi pi-history"
                            style={{
                                backgroundColor:"var(--glass-c)",
                                color:"var(--text)",
                                border:"1px solid var(--glass)"
                            }}
                            onClick={()=>{
                                cart_table.toogle_timeline()
                                console.log(cart_table)
                            }}
                        />
                        
                    </div>
                </div>}
                <Sidebar
                    blockScroll
                    style={{
                        width:"100%",
                        maxWidth:"500px",
                        background:"#0000"
                    }}
                    position="right"
                    showCloseIcon={false}
                    visible={selected_item}
                    onHide={(event)=>{set_selected_item(null)}}
                >
                <ProductSidebar
                    style={{
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
                    sidebar={true}
                    anim={false}
                    close={false}
                    user={currentUser}
                    check_rule={check_rule}
                    groups={groups}
                    item={selected_item}
                    editable={false}
                    onHide={(event)=>{set_selected_item(null)}}
                />

                </Sidebar>
            </div>
        </ObjectComponent>
    );
}

//-NFtRfdMFAikcoil9qiU

//http://localhost:3000/order#-NFuRLfdIvxSfwCbS5zL