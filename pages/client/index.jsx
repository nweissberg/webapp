import React, { useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import ClientDashboard from "../client/components/client_dashboard";
import localForage from "localforage";
import ClientSearch from "./components/client_search";
import ScrollWrapper from "../components/scroll_wrapper";
import { useProducts } from "../../contexts/products_context";
import { readUsers } from "../api/firebase";
import { print, var_get } from "../utils/util";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { useResponsive } from "../components/responsive_wrapper";
import ClientSearchTable from "../sales/components/client_search_table";
import { withRouter } from 'next/router'
import { get_data_api } from "../api/connect";
import UndoableEditor from "../../contexts/UndoableEditor";
import CallDialog from "../profile/components/call_dialog";
import UserCalls from "../components/user_call_viewer";
import SettingsPage from "../admin/components/settings";
import ClientCallDialog from "./components/client_call_dialog";
import { TabPanel, TabView } from "primereact/tabview";

export async function getServerSideProps( context ) {
    const { query, res } = context
    res.setHeader(
        'Cache-Control','s-maxage=86400'
    )
    const client_credit = await get_data_api({
        query:"hMM7WFHClaxYEjAxayms",
        keys:[{ key: "ID_EMPRESA", value:query.id, type: "STRING" }]
    }).then((client_limit)=>{
        var reply = 0
        if(client_limit != null && client_limit.length > 0){
            reply = client_limit[0].valor_limite_atual1
        }
        return reply
    })
    return { props: {
        client_credit,
        // pedidos_cliente
    }}
}

function ClientPage(props){
    const [ client, set_client ] = useState(null)
    const [ load_client, set_load_client ] = useState(null)
    const [ clients_list, set_clients_list ] = useState([])
    const { currentUser } = useAuth()
    const [ loading, set_loading ] = useState(true)
    const [ client_id, set_client_id ] = useState(true)
    const [ matrix, set_matrix ] = useState(null)
    const [ filtered, set_filtered ] = useState([])
    const [ show_search, set_show_search ] = useState(false)
    const [ all_users, set_all_users ] = useState(null)

    const { 
        check_rule,
        clients,
        get_clients,
        load_products_client,
        load_products_group,
        groups,
        load_groups,
    } = useProducts()
    
    const {isMobile} = useResponsive()

    useEffect(()=>{
        // console.log(groups)
        if(groups.length == 0) load_groups()
        // set_loading(false)
    },[])


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
        // if(clients.length == 0) return null;
        var_get("clients_filtered").then((data)=>{
            if(data){
                var _clients = data.split(',').map(c=>clients.find(c_db=>c == c_db.id))
                // console.log(_clients)
                set_clients_list([...new Set(_clients)])
            }
        })
        if(props.router.query.id){
            const client = clients.find(c=>c.id == props.router.query.id)
            // console.log(client)
            set_load_client(null)
            set_client(client)
            set_loading('client')
        }
    },[clients, props.router])
    
    const clients_header = ()=>{
        return(<ScrollWrapper className="scrollbar-none client_bar_nav gap-2 bg flex w-screen overflow-x-scroll" speed={300}>
            <div className={' flex w-10 h-auto align-items-center sticky left-0 z-4 '}>
                {show_search &&
                    <div className="absolute flex w-auto h-full" >
                        <div className="relative flex w-20rem h-full bg-glass-b left-0"/>
                        <div className="relative flex w-20rem h-full bg-gradient-right "/>
                    </div>
                }
                {!show_search && <div className="absolute z-0 flex w-5rem h-full bg-gradient-right "/>}
                <Button
                    icon={(show_search?'pi pi-chevron-left':'pi pi-search text-green-500 ')+' text-xl'}
                    className={"relative left-0 mx-2 p-button-lg p-button-rounded p-3 " +(show_search?'':'p-button-text text-white shadow-none')}
                    onClick={(e)=>{ set_show_search(!show_search) }}
                />
                {show_search &&<div className="absolute ml-6 fadein flex flex-grow-1 animation-iteration-1 animation-duration-400 w-full ">
                    <ClientSearch
                        clients={clients}
                        className='bg-red-500'
                        auto_complete={false}
                        dropdown={false}
                        user={currentUser}
                        onChange={(event)=>{
                            console.log(event)
                            if(event == null) set_filtered([])
                        }}
                        onSelect={(c)=>{
                            set_show_search(false)
                            set_client(c)
                        }}
                        set_filtered_clients={(_filtered)=>{
                            // console.log(_filtered)
                            set_filtered(_filtered)
                        }}
                    />
                </div>
                }
                
            </div>
                {clients_list.map((c,i)=>{
                    return(
                        <div key={i} id={c?.id} className={(c?.id == client?.id?" sticky top-0 z-3 border-blue-400 border-3 bg-black-alpha-10":" z-0 border-none bg-white-alpha-10" )+" flex cursor-pointer w-max p-2 white-space-nowrap text-white border-round-md mt-2 mb-2 hover:bg-bluegray-800 hover:text-cyan-200 transition-colors transition-duration-300"}
                        onClick={(e)=>{
                            set_load_client(c)
                            set_loading(true)
                            // set_show_search(false)
                            // let route = matrix?"="+matrix:""
                            props.router.push({
                                pathname: '/client',
                                query: { p:'chamado', id: c.id },
                            })
                        }}>
                        {c?.fantasia}
                        </div>
                        )
                    })
                }
            
        </ScrollWrapper>)
    }
    if((!client && show_search) && currentUser){
        return(<ObjectComponent
            user={currentUser}
            header={true}
            onLoad={(e)=>{
                document.title = "Cliente"
            }}
        >
            <div>
                <div className="sticky top-0 z-1">
                    <clients_header />
                </div>
                
                { !(!show_search || loading == 'client' || loading != false ) && <ClientSearchTable 
                    user={currentUser}
                    check_rule={check_rule}
                    clients={clients}
                    filtered={filtered}
                    router={props.router}
                    show_search={show_search}
                    onHide={(c)=>{
                        set_show_search(false)
                        set_loading(true)
                        set_client(null)
                    }}
                />}
            </div>
        </ObjectComponent>)
    }
    
    return(
        <ObjectComponent
            user={currentUser}
            show_users={false}
            header={true}
            onLoad={(e)=>{
                document.title = "Cliente"
            }}
        >
            {/* <p>{router.query.id}</p> */}
            {/* <div className="flex pointer-events-none bg-gradient-bottom bg-blur-2 fixed h-10rem w-screen" style={{bottom:"0px", zIndex:-11}}/>
            <div className="flex pointer-events-none absolute h-10rem w-screen" style={{top:"calc(100vh + 100px)"}}/> */}
            {/* <div className="flex pointer-events-none fixed bg-gradient-top bg-blur-1 h-10rem w-full justify-content-center text-white top-0 z-1 pt-3 pb-3" /> */}
            {/* <div className="flex pointer-events-none fixed h-4rem w-full justify-content-center text-white top-0 z-3 pt-3 pb-3">
                <div className={"flex z-3 top-0 z-3 border-blue-400 border-3 bg flex cursor-pointer w-max p-2 h-3rem white-space-nowrap text-white border-round-md"}>
                    {shorten(client?.fantasia,3)}
                </div>
            </div> */}
            
            {clients_header()}
            {filtered.length > 0 && show_search  && <ClientSearchTable 
                user={currentUser}
                check_rule={check_rule}
                clients={clients}
                filtered={filtered}
                router={props.router}
                show_search={show_search}
                onHide={(c)=>{
                    set_show_search(false)
                    set_loading('client')
                    set_client(null)
                }}
            />}
            
            {client && <div className="bg-glass-a">
                <div className="flex flex-grow-1 text-left flex-wrap w-auto h-auto gap-2 align-items-center p-2 pt-4 w-full justify-content-center">
                    <h4 className="white-space-normal text-white">{client?.fantasia}</h4>
                    <h5 className=" text-overflow-ellipsis overflow-hidden hide_on_phone" style={{color:"var(--text-c)"}}>{client?.razao_social}</h5>
                </div>
                
                <SettingsPage multiple={true} tabs={[{
                    header:"Abrir Chamado",
                    icon:"p-phone",
                    body:<ClientCallDialog user={currentUser} all_users={all_users} client={client}/>
                },
                {
                    header:"Chamados",
                    icon:"p-users",
                    body:<UserCalls
                    clients={clients_list}
                    user={currentUser}
                    currentUser={currentUser}
                    query={{"client.id": ['==', client?.id]}}
                />
                }]}/>
                
                    
                {/* <ClientDashboard 
                    {...props}
                    // router={props.router}
                    fullScreen={true}
                    clients={clients_list}
                    client={client}
                    user={currentUser}
                    all_users={all_users}
                    load_products_client={load_products_client}
                    load_products_group={load_products_group}
                    check_rule={check_rule}
                    matrix={props.router.query.p}
                    groups={groups}
                    isMobile={isMobile}
                    onLoad={(value)=>{
                        set_loading(value)
                    }}
                /> */}
            </div>
            }
            
            {(load_client && props.router.query.id != load_client?.id && loading) && <div
                className="flex fixed z-2 top-0 left-0 w-screen min-h-max h-screen bg-glass-b "
                style={{backdropFilter:"blur(5px)"}}>
                <div className="center z-3 absolute w-max max-w-full p-3">
                    <h4 className="text-blue-300">Carregando...</h4>
                    <h1 className="text-white text-center">{load_client?.fantasia}</h1>
                    <h3 className="text-gray-300 text-center">{load_client?.razao_social}</h3>
                    <ProgressBar mode="indeterminate"/>
                    
                </div>
            </div>}
        </ObjectComponent>
    );
}

export default withRouter(ClientPage)