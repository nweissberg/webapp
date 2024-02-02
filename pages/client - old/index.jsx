import React, { useContext, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import ClientDashboard from "../client/components/client_dashboard";
import { useRouter } from 'next/router'
import localForage from "localforage";
import { ProgressSpinner } from "primereact/progressspinner";
import ClientSearch from "./components/client_search";
import ScrollWrapper from "../components/scroll_wrapper";
import { useProducts } from "../../contexts/products_context";
import { readUsers } from "../api/firebase";
import { shorten, var_get } from "../utils/util";
import { ProgressBar } from "primereact/progressbar";
import { useResponsive } from "../components/responsive_wrapper";

export default function ClientPage(){
    const [client, set_client] = useState(null)
    const [ clients_list, set_clients_list ] = useState([])
    const { asPath } = useRouter();
    const router = useRouter()
    const { currentUser } = useAuth()
    const [ loading, set_loading ] = useState(true)
    const [ client_id, set_client_id ] = useState(true)
    const [ matrix, set_matrix ] = useState(null)
    const [ all_users, set_all_users ] = useState(null)
    // const [ is_mobile, set_is_mobile ] = useState(false)
    const { 
        check_rule,
        clients,
        get_clients,
        load_products_client,
        groups,
        load_products_group,
    } = useProducts()
    
    const {isMobile} = useResponsive()

    // useEffect(()=>{
    //     console.log(isMobile)
    //     // set_is_mobile(isMobile)
    // },[isMobile])

    useEffect(()=>{
        if(clients.length == 0) get_clients(currentUser)
        readUsers().then(async(data)=>{
            if(!data)return
            // console.log(data)
            set_all_users(Object.values(data))
        })
    },[currentUser])

    useEffect(()=>{
        // console.log(clients_list)
        set_loading(false)
    },[clients_list])

    useEffect(()=>{
        if(clients.length == 0) return
        var_get("clients_filtered").then((data)=>{
            if(data){
                var _clients = data.split(',').map(c=>clients.find(c_db=>c == c_db.id))
                // console.log(_clients)
                set_clients_list([...new Set(_clients)])
                
            }
        })
        if(client_id){
            const client = clients.find(c=>c.id == client_id)
            set_client(client)
        }
    },[clients, client_id])
    
    useEffect(()=>{
        if(client){
            const divElement = document.getElementById(client.id)
            if(!divElement) return
            const parentElement = divElement.parentElement;
            
            parentElement.scrollTo(divElement.offsetLeft - (window.innerWidth*0.5) + (divElement.scrollWidth*0.5),0)
            // console.log(divPosition);
        }
    },[client])

    useEffect(()=>{
        const _client_id = asPath.split('#')[1]?.split('=')[0];
        const _matrix = asPath.split('#')[1]?.split('=')[1];
        set_matrix(_matrix)
        if(client?.id == _client_id) return
        console.log("ver cliente "+ _client_id, "em "+_matrix)
        if(_client_id){
            set_client_id(_client_id)
            set_loading(true)
        }
        

    }, [ asPath ]);
    
    const clients_header = ()=>{
        return(<ScrollWrapper className="scrollbar-none client_bar_nav gap-2 bg flex w-screen overflow-x-scroll" speed={333}>
            
                {clients_list.map((c,i)=>{
                    return(
                        <div key={i} id={c?.id} className={(c?.id == client?.id?"flex sticky top-0 z-3 border-blue-400 border-3 bg-black-alpha-10":" z-0 border-none bg-white-alpha-10" )+" flex cursor-pointer w-max p-2 white-space-nowrap text-white border-round-md mt-2 mb-2 "}
                        onClick={(e)=>{
                            set_client(c)
                            // let route = matrix?"="+matrix:""
                            router.push('client#'+c.id).then(()=>{
                                // set_loading(true)
                            })
                        }}>
                        {c.fantasia}
                        </div>
                        )
                    })
                }
            
        </ScrollWrapper>)
    }

    if(!client && loading) {
        return(<div className="flex w-full h-screen align-items-center absolute top-0 bg-blur-1">
            <ProgressSpinner/>
        </div>)
    }else if(!client && currentUser){
        return(<ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Cliente"
            }}
        >
            {loading && <ProgressBar mode="indeterminate"/>}
            <div>
                {clients_header()}
                <ClientSearch user={currentUser} onSelect={set_client}/>
            </div>
        </ObjectComponent>)
    }
    
    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Cliente"
            }}
        >
            <div className="flex pointer-events-none bg-gradient-bottom bg-blur-2 fixed h-10rem w-screen" style={{bottom:"0px", zIndex:-11}}/>
            <div className="flex pointer-events-none absolute h-10rem w-screen" style={{top:"calc(100vh + 100px)"}}/>
            <div className="flex pointer-events-none fixed bg-gradient-top bg-blur-1 h-5rem w-full justify-content-center text-white top-0 z-2 pt-3 pb-3" />
            <div className="flex pointer-events-none fixed h-4rem w-full justify-content-center text-white top-0 z-3 pt-3 pb-3">
                <div className={"flex z-3 top-0 z-3 border-blue-400 border-3 bg flex cursor-pointer w-max p-2 h-3rem white-space-nowrap text-white border-round-md"}>
                    {shorten(client?.fantasia,3)}
                </div>
            </div>
            
            {clients_header()}
            <ClientDashboard 
                fullScreen={true}
                clients={clients_list}
                client={client}
                user={currentUser}
                all_users={all_users}
                load_products_client={load_products_client}
                load_products_group={load_products_group}
                check_rule={check_rule}
                matrix={matrix}
                groups={groups}
                isMobile={isMobile}
                onLoad={(value)=>{
                    set_loading(value)
                }}
            />
            
        </ObjectComponent>
    );
}