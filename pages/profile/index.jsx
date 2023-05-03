import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import { Button } from "primereact/button";
import { auth, get_data, readUsers , readRealtimeData, writeRealtimeData, readUser } from '../api/firebase';
import { signOut } from "firebase/auth";
import { useRouter } from 'next/router'
import { ProgressBar } from "primereact/progressbar";
import { copyToClipBoard, deepEqual, format_mask, scrollToBottom, scrollToTop, swap_array, time_ago } from "../utils/util";
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import localForage from "localforage";
import Swal from 'sweetalert2';
import { Toast } from 'primereact/toast';
import FlipCard from "../components/flip_card";
import ProfileInfo from "./components/profile_info";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { useProducts } from "../../contexts/products_context";
import OrderCarousel from "./components/orders_carousel";
import { useSales } from "../contexts/context_sales";
import UserSearch from "./components/user_search";
import ClientsDatatable from "./components/clients_datatable";
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';

const produtos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'produtos'
});

const pedidos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

const clientes_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'clientes'
});

var roles_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'cargos'
});

export default function ProfilePage(){
    const toast = useRef(null);
    const { currentUser, updateUser } = useAuth()
    const [user_profile, set_user_profile] = useState("")
    const router = useRouter()
    const [tab_index, set_tab_index] = useState(0)
    const [dates, set_dates] = useState([])
    const [drafts, set_drafts] = useState([])
    const [orders, set_orders] = useState([])
    const [selected_user, set_selected_user] = useState(null)
    const [find_user, set_find_user] = useState(null)
    const [edit_profile, set_edit_profile] = useState(false)
    const [display_filters, set_display_filters] = useState(false)
    const [clients_filtered, set_clients_filtered] = useState([])
    const [loading_data, set_loading_data] = useState(false)
    const {test_context,actions} = useSales()
    const [call_dialog, set_call_dialog] = useState(false)
    const [ all_users, set_all_users ] = useState([])
    const overlay_panel = useRef(null);
    const [user_position, set_user_position] = useState(null)

    const { asPath } = useRouter();
    
    const { check_rule, get_clients, clients, load_products_client } = useProducts()

    useEffect(()=>{
        const path = asPath.split('=')
        const hash = path[0].split('#');
        const user = hash[1];
        if(user != undefined) {
            get_clients(selected_user)
            if(selected_user) set_selected_user(null)
            set_find_user(user)
            switch (path[1]) {
                case "orders":
                    set_tab_index(tab_index => 2.2)
                    load_user_orders(user)
                    break;
            
                default:
                    break;
            }
        }
    }, [ asPath ]);

    const showSuccess = (name) => {
        toast.current.show({
            severity:'success',
            summary: 'Rascunho removido',
            detail:`Pedido "${name}" foi excluído`,
            life: 3000
        });
    }
    
    useEffect(()=>{
        if(currentUser == null) return
        if(selected_user == null) {
            if(!find_user) {
                set_selected_user(currentUser);
                return
            }
            readUser(find_user).then((user_data)=>{
                // console.log(user_data)
                set_selected_user(user_data);
            })
            return
        }else{
            readUsers().then(async(data)=>{
                if(!data)return
                // console.log(data)
                set_all_users(Object.values(data))
            })
    
            pedidos_db.getItem(selected_user.uid).then( async (data)=>{
                // console.log(data)
                if(data == null) return
                data.drafts = data.drafts.filter(cart=>cart.name!="")
                
                // console.log(data.drafts)
    
                pedidos_db.setItem(selected_user.uid,data)
                if(data){
                    set_drafts(data.drafts)
               
                }
                // router.push("/sales")
            })

        }
        
    },[currentUser,selected_user,find_user])
    
    async function load_user_orders(user_uid){
        var _orders = []
        var items_data = []
        var load_data = []

        await get_data("orders",user_uid).then( (oreder_data)=>{
            oreder_data.forEach((order)=>{
                load_data.push(order.data())
            })
        })
        // console.log(load_data)
        // set_loading_data(false)

        load_data = load_data.map( async (order_data)=>{
            // console.log(order_data)
            items_data = order_data.items.map(async(item)=>{
                await produtos_db.getItem(item.id.toString())
                .then((item_data)=>{
                    if(!item_data) return item
                    item.data = item_data
                    return item
                })
            })
            
            await Promise.all(items_data).then(()=>{
                const client = clients.find(c=>c.id == order_data.client)
                if(client){
                    order_data.client = client
                    order_data.key = order_data.uid
                }
                _orders.push(order_data)
            })
        })
        
        await Promise.all(load_data).then(()=>{
            // console.log(_orders)
            set_orders(_orders)
            set_loading_data(false)
        })
    }
    useEffect(()=>{
        // console.log(drafts)
        // set_tab_index(tab_index => 2.1)
        // console.log(drafts.map((draft)=>{
        //     const _items = draft.items.map((item)=>{
        //         // console.log(item)
        //         return({
        //             id:item.id,
        //             quantity:item.quantity,
        //             discount:item.discount,
        //             sales_price:item.sales_price
        //         })
        //     })
        //     draft.items = _items
        //     return draft
        // }))
        // writeRealtimeData(`drafts/${selected_user.uid}/`,drafts)
    },[drafts])

    

    

    const tooltip_options = {
        position: 'top',
        mouseTrack: true,
        mouseTrackTop: 15
    }
    
    const agenda_labels = {
        name:"Nome",
        date:"Dia",
        start:"Início",
        end:"Fim",
        info:"Informação"
    }
    const [agenda, set_agenda] = useState([
        // {
        //     name:"Evento de Teste",
        //     date:"6/10/2022",
        //     start:"8:00",
        //     end:"17:00",
        //     info:"Comentário do evento"
        // }
        {date:"5/10/2022", start:6, end:9},
        {date:"7/10/2022", start:13, end:14},
        {date:"20/10/2022", start:10, end:12}
    ])

    const dateTemplate = (date) => {
        var dates = agenda.map((day)=>{
            return(day.date)
        })
        const date_string = `${date.day}/${date.month+1}/${date.year}`
        // const dates = [1, 10 , 21, 17, 15]
        // console.log(dates, date_string)
        if( dates.indexOf(date_string)!= -1 ) {
            return (
                <strong style={{
                    color: "var(--primary-c)"
                }}>{date.day}</strong>
            );
        }

        return date.day;
    }

    const cellBody = (rowData,key)=>{
        const isEvent = eval(key) >= rowData.start && eval(key) <= rowData.end
        return(
            <div className={isEvent?"user_event":""}/>
        )
    }

    useEffect(()=>{
        if(currentUser === null){
            router.push('/login')
            return
        }
        if(selected_user == null)return
        roles_db.getItem(selected_user.role.toString())
        .then((user_role)=>{set_user_profile(user_role[selected_user.photo[0]])})

        
    },[selected_user])

    // useEffect(()=>{
    //     console.log(drafts)
    // },[drafts])

    const button_style = {
        textAlign:"left",
        width:"100%",
        height:"100%",
        minHeight:"100px",
        borderRadius:"15px"
    }

    const button_style_b = {
        ...button_style,
        backgroundColor:"var(--glass-c)",
        color:"var(--text)",
        border:"0px"
    }
    function update_draft(data){
        // console.log(data)
        
    }
    function inBetweenDates(date_a, date_b){
        var date_array = [date_a]
        if(date_b == null) return(date_array)
        //calculate total number of seconds between two dates  
        var total_seconds = Math.abs(date_b - date_a) / 1000;  

        //calculate days difference by dividing total seconds in a day  
        var days_difference = Math.floor (total_seconds / (60 * 60 * 24));
        
        for (let index = 1; index < days_difference; index++) {
            // Create new Date instance
            var date = new Date(date_a)
            // Add a day
            date.setDate(date.getDate() + (index))
            date_array.push(date)
        }
        date_array.push(date_b)
        // console.log(date_array)
        return(date_array)
    }

    function testOnChange(data){
        // console.log(data)
        set_clients_filtered(data)
    }

    if(currentUser == null || selected_user == null) return(<ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom:"-6px" }}/>)
    var isActiveUser = currentUser.uid == selected_user.uid
    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                set_user_position(e.state.position)
                document.title = "Perfil"
            }}
            // onScroll={(position)=>{
            //     if(!position)return
            //     set_user_position(position)
            //     // console.log(position.scroll.y)
            // }}
        >
            <div className={"header_search flex w-full z-1 p-2 justify-content-center align-items-center "+ (user_position?.scroll.y >90?"bg-white-alpha-40 bg":"")}
            style={{
                position:user_position?.scroll.y >90?"fixed":"absolute",
                top:user_position?.scroll.y >90?"0px":"90px",
                // top:"0px"
            }}>
                {user_position?.scroll.y >90 && <img src='/images/logo_b.svg' alt={"logo"} style={{ left:"10px", height:"60px", position:"fixed" }}/>}
                <div className="flex m-2" >
                    <Inplace closable>
                        <InplaceDisplay className="inline-flex align-content-center">
                            <Button className={"p-button-sm p-3 p-button-rounded p-button-outlined " + (user_position?.scroll.y >90?"bg bg-black-alpha-50 ":"bg-white-alpha-30 text-purple-900 bg")}
                                icon="pi pi-search"
                                // label="Pesquisar..."
                            />
                        </InplaceDisplay>
                        <InplaceContent className="inline-flex align-items-center">
                            <div className="w-full max-w-30rem">
                                <UserSearch
                                    all_users={all_users}
                                    currentUser={currentUser}
                                    onChange={(data)=>{
                                        if(!data)return
                                        console.log(data)
                                        router.push('/profile#'+data.uid+'=orders')
                                        set_orders([])
                                        set_drafts([])
                                        set_selected_user(data)
                                    }}
                                />
                            </div>
                        </InplaceContent>
                    </Inplace>
                </div>
                {/* <Button /> */}
            </div>

            <ProfileInfo
                user={selected_user}
                show={edit_profile}
                onHide={(event)=>{
                    set_edit_profile(false)
                }}
                updateUser={(_user)=>{
                    set_edit_profile(false)
                    updateUser(_user)
                }}
            />
            
            

            <Toast ref={toast} position="bottom-right" />
            <div style={{
                // marginLeft:window.innerWidth > 1024?"calc((1024px - 100vh) * 0.5)" : "0px",
                position:"absolute",
                width:"100vw",
                // maxWidth:"1024px",
                height:"100vh",
                backdropFilter:"blur(5px)",
            }}>
                <div className="image_container" style={{ // BANNER 
                    backgroundColor:"var(--glass-c)",
                    height:"30vh",
                    overflow:"hidden"
                }}>
                    <img  src={`images/background/bg_${selected_user.banner}.jpeg`}
                        alt="User Banner"
                        style={{
                            width:"100%",
                            // height:"100%",
                            // transform:"translateY(-33%)"
                        }}
                    />
                </div>
                <div style={{
                    backgroundColor:"var(--glass-b)",
                    // height:"20vh",
                    // minHeight:"20vh"
                }}>
                    <div className="flex justify-content-center flex-wrap"
                    style={{
                        // maxWidth:"1024px"
                    }}>
                        <div className="col-3"
                            style={{
                                minWidth:"250px",
                                transform:"translateY(-80px)",
                            }}
                        >
                        <div
                            style={{ // IMAGEM PERFIl
                                // position:"absolute",
                                width:"160px",
                                height:"160px",
                                marginLeft:"30px",
                                // backgroundColor:"black",
                                // borderRadius:"5px",
                                // top:"calc(30vh - 80px)",
                                marginBottom:"10px",
                                // overflow:"hidden"
                            }}
                        >
                            <FlipCard
                                style={{
                                    width:"160px",
                                    height:"160px",
                                    borderRadius:"5px"
                                }} 
                                front={<img src={`images/avatar/${selected_user.photo}.jpg`}
                                    alt="User Photo"
                                    style={{
                                        width:"100%"
                                    }}
                                />}
                                back={
                                    <div className="flex justify-content-center flex-wrap">

                                        {!isActiveUser && <Button
                                            // label="Editar"
                                            tooltip="Addicionar"
                                            tooltipOptions={tooltip_options}
                                            style={{width:"50px",height:"50px"}}
                                            className="p-button-lg p-button-rounded m-2 flex-grow-1 p-button-success"
                                            icon="pi pi-user-plus"
                                            onClick={(event)=>{
                                                // test_context("test_action",{Numero:81})
                                                // test_context("send_order",{Telefone:"81",Mensagem:"'Teste de disparo pelo botão de editar o perfil'"})
                                                // event.stopPropagation()
                                                // scrollToTop()
                                                // set_edit_profile(true)
                                            }}
                                        />}

                                        {!isActiveUser && <Button
                                            // label="Editar"
                                            tooltip="Mensagem"
                                            tooltipOptions={tooltip_options}
                                            style={{width:"50px",height:"50px"}}
                                            className="p-button-lg p-button-rounded m-2 flex-grow-1 p-button-help"
                                            icon="pi pi-comments"
                                            onClick={(event)=>{
                                                // test_context("test_action",{Numero:81})
                                                // test_context("send_order",{Telefone:"81",Mensagem:"'Teste de disparo pelo botão de editar o perfil'"})
                                                // event.stopPropagation()
                                                // scrollToTop()
                                                // set_edit_profile(true)
                                            }}
                                        />}
                                        {isActiveUser && <Button
                                            // label="Editar"
                                            tooltip="Editar Perfil"
                                            tooltipOptions={tooltip_options}
                                            style={{width:"50px",height:"50px"}}
                                            className="p-button-lg p-button-rounded m-2 flex-grow-1"
                                            icon="pi pi-user-edit"
                                            onClick={(event)=>{
                                                // test_context("test_action",{Numero:81})
                                                // test_context("send_order",{Telefone:"81",Mensagem:"'Teste de disparo pelo botão de editar o perfil'"})
                                                // event.stopPropagation()
                                                scrollToTop()
                                                set_edit_profile(true)
                                            }}
                                        />}
                                        {isActiveUser && <Button
                                            // label="Logout"
                                            tooltip="Sair do app"
                                            tooltipOptions={tooltip_options}
                                            style={{width:"50px",height:"50px"}}
                                            className="p-button-danger p-button-lg p-button-rounded m-2 flex-grow-1"
                                            icon="pi pi-sign-out"
                                            onClick={(event)=>{
                                                signOut(auth).then(() => {
                                                    this.menu.toggle(event)
                                                    router.push('/login')
                                                  }).catch((error) => {
                                                    // An error happened.
                                                  });
                                            }}
                                        />}
                                    </div>
                                }
                            />
                            
                        
                        </div>
                        <div style={{
                            // position:"absolute",
                            marginBottom:"-80px",
                            marginLeft:"30px",
                            color:"var(--text)"
                        }}>
                            <h6 style={{color:"var(--text-c)"}}>{user_profile}</h6>
                            <h5>
                                {selected_user.name}
                            </h5>
                            <h6 style={{color:"var(--text-c)"}}>
                                Online: {time_ago(selected_user.metadata?.lastSeen)}
                            </h6>
                        </div>
                    </div>
                        <div className="flex justify-content-center flex-wrap gap-3 m-2 p-3">

                            {isActiveUser && <div className="flex-grow-1">
                                <Button className="p-button-lg"
                                    icon="pi pi-chart-line"
                                    iconPos="right"
                                    label="Dashboard"
                                    style={Math.floor(tab_index)==0?button_style:button_style_b}
                                    onClick={(event)=>{
                                        set_tab_index(tab_index => 0)
                                        scrollToBottom()
                                    }}
                                />
                            </div>}

                            {check_rule(selected_user,"USA_AGENDA") && <div className="flex-grow-1">
                                <Button className="p-button-lg"
                                    icon="pi pi-book"
                                    iconPos="right"
                                    label="Agenda"
                                    style={Math.floor(tab_index)==1?button_style:button_style_b}
                                    onClick={(event)=>{
                                        get_clients(selected_user)
                                        set_tab_index(tab_index => 1.1)
                                        scrollToBottom()
                                    }}
                                />
                            </div>}
                            
                            <div className="flex-grow-1">
                                <Button className="p-button-lg"
                                    icon="pi pi-shopping-bag"
                                    iconPos="right"
                                    label="Pedidos"
                                    style={Math.floor(tab_index)==2?button_style:button_style_b}
                                    onClick={async (event)=>{
                                        set_loading_data(true)
                                        set_tab_index(tab_index => 2.2)
                                        await load_user_orders(selected_user.uid)
                                        scrollToBottom()
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {loading_data && <ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom:"-6px" }}/>}
                <div style={{
                    backgroundColor:"var(--glass)",
                    height:"auto",
                    minHeight:"55vh"
                }}>
                    
                    <div className="flex justify-content-center flex-wrap gap-3 p-3">
                        {tab_index == 0 && isActiveUser && <iframe src="https://share.stimulsoft.com/fda26"></iframe>}

                        {Math.floor(tab_index) == 1 && <>
                            <div className="flex flex-wrap gap-3" style={{width:"100%"}}>
                                <div className="flex-grow-1">
                                    <Button className="p-button-lg"
                                        icon="pi pi-users"
                                        iconPos="right"
                                        label="Clientes"
                                        style={{...tab_index==1.1?button_style:button_style_b,minHeight:"auto"}}
                                        onClick={(event)=>{
                                            // router.push("/sales")
                                            set_tab_index(tab_index => 1.1)
                                            // pedidos_db.getItem(selected_user.uid).then((data)=>{
                                            //     // console.log(data)
                                                scrollToBottom()
                                            //     if(data)set_drafts(data.drafts)
                                            // })
                                        }}
                                    />
                                </div>
                                <div className="flex-grow-1">
                                    <Button className="p-button-lg"
                                        icon="pi pi-phone"
                                        iconPos="right"
                                        label="Chamados"
                                        style={{...tab_index==1.2?button_style:button_style_b,minHeight:"auto"}}
                                        onClick={(event)=>{
                                            set_tab_index(tab_index => 1.2)
                                        }}
                                    />
                                </div>
                                <div className="flex-grow-1">
                                    <Button className="p-button-lg"
                                        icon="pi pi-check-circle"
                                        iconPos="right"
                                        label="Tarefas"
                                        // style={{...button_style_b, minHeight:"auto"}}
                                        style={{...tab_index == 1.3?button_style:button_style_b,minHeight:"auto"}}
                                        onClick={(event)=>{
                                            set_tab_index(tab_index => 1.3)
                                        }}
                                    />
                                </div>
                            </div>
                            {tab_index == 1.1 && <div className="flex w-full">
                                
                                <ClientsDatatable
                                    clients={clients}
                                    all_users={all_users}
                                    selected_user={selected_user}
                                    load_products_client={load_products_client}
                                />
                            </div>}
                            {/* <div>
                                <div className="flex-grow-1">
                                    <div className="flex flex-wrap justify-content-between">
                                        
                                        {dates[0] &&
                                            dates[0] && inBetweenDates(dates[0],dates[1]).map((date,date_index)=>{
                                                if(date == null) return("")
                                                var date_event = false
                                                // if(agenda[0]) console.log(date.toLocaleDateString(), new Date( swap_array((agenda[0].date).split('/'),0,1).join("/")).toLocaleDateString() )
                                                if(agenda.map((date_item)=>{return(new Date( swap_array((date_item.date).split('/'),0,1).join("/")).toLocaleDateString())}).indexOf(date.toLocaleDateString()) != -1){
                                                    date_event = true
                                                }else if(date != dates[0] && date != dates[1]){
                                                    return("")
                                                }
                                                return(<div className={(date_event?"date_label":"") +" p-2 mb-3"}
                                                    style={{
                                                        fontWeight:"bold",
                                                        color:"var(--text)",
                                                        backgroundColor:date_event?"var(--primary-c)":"var(--glass-c)",
                                                        borderRadius:"15px",
                                                        fontSize:"12px",
                                                        cursor:date_event?"pointer":"default"
                                                    }}>
                                                    {date.getDate() +" de "+ date.toLocaleDateString('pt-BR', { month: 'short'})}
                                                    </div>)
                                            })
                                        }
                                    </div>
                                    <Calendar
                                        inline
                                        // showWeek
                                        selectionMode="range"
                                        value={dates}
                                        onChange={(e) => {
                                            // console.log((e.value))
                                            set_dates(e.value)
                                        }}
                                        dateTemplate={dateTemplate}
                                    />
                                </div>
                                <Timeline value={dates} layout="horizontal" align="top" content={(item) => item} />
                            </div> */}
                            {/* <div className="flex-grow-1">
                                <DataTable value={agenda}>
                                    {Object.keys(agenda_labels).map((key,i)=>{
                                        return <Column key={key} field={key} header={agenda_labels[key]} />
                                    })}
                                </DataTable>
                            </div>
                            <div style={{
                                width:'100vw',
                                overflow:"scroll"
                            }}>
                                <DataTable 
                                    value={agenda}
                                    selectionMode="multiple"
                                    cellSelection
                                    dragSelection 
                                    selection={selected_times}
                                    onSelectionChange={e => {
                                        // console.log(e.value)
                                        return(set_selected_times(e.value))
                                    }}
                                    // dataKey="id"
                                    responsiveLayout="scroll"
                                >
                                        <Column key="date" field="date" header="Data" />
                                        {Array.from({length: 14}, (e, i) => (i+5).toString()).map((key)=>{
                                            return <Column key={key} field={key} header={key+":00"} body={(row_data)=>{
                                                return(cellBody(row_data,key))
                                            }}/>
                                        })}
                                </DataTable>
                            </div> */}

                        </>}
                        {Math.floor(tab_index) == 2 && <>
                            {isActiveUser && <div className="flex-grow-1">
                                <Button className="p-button-lg"
                                    icon="pi pi-file-edit"
                                    iconPos="right"
                                    label="Rascunhos"
                                    style={{...tab_index==2.1?button_style:button_style_b,minHeight:"auto"}}
                                    onClick={(event)=>{
                                        set_loading_data(true)
                                        // router.push("/sales")
                                        set_tab_index(tab_index => 2.1)
                                        pedidos_db.getItem(selected_user.uid).then((data)=>{
                                            // console.log(data)
                                            scrollToBottom()
                                            set_loading_data(false)
                                            // if(data)set_drafts(data.drafts)
                                        })
                                    }}
                                />
                            </div>}
                            <div className="flex-grow-1">
                                <Button className="p-button-lg"
                                    icon="pi pi-list"
                                    iconPos="right"
                                    label="Orçamentos"
                                    style={{...tab_index==2.2?button_style:button_style_b,minHeight:"auto"}}
                                    onClick={async (event)=>{
                                        set_loading_data(true)
                                        set_tab_index(tab_index => 2.2)

                                        await load_user_orders(selected_user.uid)
                                        
                                    }}
                                />
                            </div>
                            <div className="flex-grow-1">
                                <Button className="p-button-lg"
                                    icon="pi pi-truck"
                                    iconPos="right"
                                    label="Status dos Pedidos"
                                    // style={{...button_style_b, minHeight:"auto"}}
                                    style={{...tab_index == 2.3?button_style:button_style_b,minHeight:"auto"}}
                                    onClick={(event)=>{
                                        set_tab_index(tab_index => 2.3)
                                    }}
                                />
                            </div>

                            {isActiveUser && <div className="flex-grow-1">
                                <Button className="p-button-lg"
                                    icon="pi pi-cart-plus"
                                    iconPos="right"
                                    label="Novo Orçamento"
                                    style={{...button_style_b, minHeight:"auto", backgroundColor:"var(--glass-b)"}}
                                    onClick={(event)=>{
                                        pedidos_db.getItem(selected_user.uid).then((data)=>{
                                            if(data){
                                                var _pedidos = data
                                                _pedidos.drafts.unshift({name:"", items:[]})
                                                // console.log(_pedidos)
                                                pedidos_db.setItem(selected_user.uid, _pedidos).then(()=>{
                                                    router.push("/sales")
                                                })
                                            }else{
                                                router.push("/sales")
                                            }
                                        })
                                    }}
                                />
                            </div>}

                        </>}
                    </div>
                    {drafts[0]?.items[0].data && tab_index == 2.1 && 
                    <OrderCarousel
                        orders={drafts}
                        edit={(name)=>{
                            // console.log(name)
                            pedidos_db.getItem(selected_user.uid).then((data)=>{
                                // data.drafts = data.drafts.filter(cart=>cart.name==name)
                                
                                data.drafts.sort(function(x,y){ return x.name == name ? -1 : y.name == name ? 1 : 0; });
                                // console.log(data)
                                pedidos_db.setItem(selected_user.uid,data).then(()=>{
                                    router.push("/sales")
                                })
                                // if(data)set_drafts(data.drafts)
                            })
                        }}
                        clone={(name)=>{
                            pedidos_db.getItem(selected_user.uid).then((data)=>{
                                data.drafts.sort(function(x,y){ return x.name == name ? -1 : y.name == name ? 1 : 0; });
                                var _clone = {...data.drafts[0]}
                                _clone.name = ''
                                data.drafts.unshift(_clone)
                                // console.log(data)
                                pedidos_db.setItem(selected_user.uid,data).then(()=>{
                                    router.push("/sales")
                                })
                                // if(data)set_drafts(data.drafts)
                            })
                        }}

                        delete={(name)=>{
                            // console.log("Delete", name)

                            Swal.fire({
                                title: 'Aviso',
                                text: `Remover o pedido "${name}" dos rascunhos?`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: 'var(--teal-700)',
                                cancelButtonColor: 'var(--orange-700)',
                                confirmButtonText: 'Sim, remover!'
                            }).then((result) => {
                                // console.log(this)
                                if (result.isConfirmed) {
                                    pedidos_db.getItem(selected_user.uid).then((data)=>{
                                        // data.drafts = data.drafts.filter(cart=>cart.name==name)
                                        
                                        data.drafts.sort(function(x,y){ return x.name == name ? -1 : y.name == name ? 1 : 0; });
                                        data.drafts = data.drafts.slice(1)
                                        pedidos_db.setItem(selected_user.uid,data).then(()=>{
                                            showSuccess(name)
                                        })
                                        set_drafts(data.drafts)
                                    })
                                }
                            })
                        }}
                    />}
                    {/* {drafts.length > 0 && tab_index == 2 && drafts.map((cart)=>{
                        return(
                            <div style={{color:"var(--text)"}}>
                                {cart.name}
                            </div>
                        )
                    })} */}
                    {tab_index == 2.2 && //orders[0]?.cart.items[0].data && 
                    <OrderCarousel
                        currentUser={isActiveUser}
                        orders={orders}
                        view={(order)=>{
                            // console.log(order)
                            router.push("/order#"+order.key) 
                        }}
                        link={(data)=>{
                            toast.current.show({
                                severity: 'info',
                                summary: 'Ctrl+C',
                                detail: "Link copiado para área de transferência!",
                                life: 3000
                            });
                            copyToClipBoard("https://app.pilar.com.br/#goto=order~"+data.uid)
                            console.log(data)
                        }}
                        callback={(order)=>{
                            console.log("Devolver " + order)    
                        }}

                        delete={(name)=>{
                            console.log("Delete", name)

                            Swal.fire({
                                title: 'Aviso',
                                text: `Remover o pedido "${name == ''?'SEM NOME':name}" dos orçamentos?`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: 'var(--teal-700)',
                                cancelButtonColor: 'var(--orange-700)',
                                confirmButtonText: 'Sim, remover!'
                            }).then((result) => {
                                // console.log(this)
                                // if (result.isConfirmed) {
                                //     pedidos_db.getItem(selected_user.uid).then((data)=>{
                                //         // data.orders = data.orders.filter(cart=>cart.name==name)
                                        
                                //         data.orders.sort(function(x,y){ return x.name == name ? -1 : y.name == name ? 1 : 0; });
                                //         data.orders = data.orders.slice(1)
                                //         pedidos_db.setItem(selected_user.uid,data).then(()=>{
                                //             showSuccess(name)
                                //         })
                                //         set_orders(data.orders)
                                //     })
                                // }
                            })
                        }}
                    />}
                </div>

            </div>
        </ObjectComponent>
    );
}