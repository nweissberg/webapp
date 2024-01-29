import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import { get_all_data, get_user_orders, readRealtimeData, readUsers, writeRealtimeData } from "../api/firebase";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deepEqual, moneyMask, scrollToTop, sqlDateToString, time_ago } from "../utils/util";
import { TabMenu } from 'primereact/tabmenu';
import { useProducts } from "../../contexts/products_context";
import { Button } from "primereact/button"
import { MultiSelect } from "primereact/multiselect";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Dropdown } from "primereact/dropdown";
import { Slider } from 'primereact/slider';
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from 'primereact/toast';
import localForage from "localforage";
import { ProgressBar } from 'primereact/progressbar';
import { AutoComplete } from 'primereact/autocomplete';
import HierarchyChart from "./components/hierarchy_chart";
import { Dialog } from 'primereact/dialog';
import ProductsTable from "../components/products_table";
import OrderCard from "../profile/components/order_card";
import { useRouter } from 'next/router'
import Rules from "./components/rules";
import SettingsPage from "./components/settings";
import ActionsPage from "./components/actions";
import UserIcon from "../components/user_icon";
import { useSales } from "../contexts/context_sales";
import CronActionsPage from "./components/cron_actions";
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import IframeExternalURL from "./components/external_iframe";

var vendedores_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'vendedores'
});

export default function AdminPage(){
    const [ users, set_users ] = useState([])
    const [ all_users, set_all_users ] = useState([])
    const { currentUser } = useAuth()
    const [rp_user, set_rp_user] = useState(null);
    const [ activeIndex, setActiveIndex ] = useState(0)

    const [ selected_profiles, set_selected_profiles ] = useState([])
    const [ saved_profiles, set_saved_profiles ] = useState([])
    const [ changed_profiles, set_changed_profiles ] = useState(false)
    const [ new_iframe, set_new_iframe ] = useState(false)
    const [parents, set_parents] = useState([]);
    const [selected_parents, set_selected_parents] = useState(null);
    const [filtered_parents, set_filtered_parents] = useState(null);
    const [external_urls, set_external_urls] = useState([])
    const [selected_user, set_selected_user] = useState(null);
    const [display_hierarchy, set_display_hierarchy] = useState(false);
    const [display_orders, set_display_orders] = useState(false);
    const [orders, set_orders] = useState([])
    const [loading_data, set_loading_data] = useState(false)
    
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');
    const [filters1, setFilters1] = useState(null);
    
    const [blockly_workspace, set_blockly_workspace] = useState(null);
    const [iframe_data, set_iframe_data] = useState(null);
    
    const {test_context,actions} = useSales()
    
    const router = useRouter()
    const { asPath } = useRouter();
    
    const {
        groups,
        profiles,
        update_profiles,
        upload_profiles,
        all_products,
        rules
    } = useProducts()
    
    const toastTL = useRef(null);

    const showTopLeftToast = () => {
        toastTL.current.show({
            severity: 'info',
            summary: 'Sucesso',
            detail: 'Alterações foram salvas na nuvem.',
            life: 3000
        });
    }

    const items = [
        // {label: 'Produtos', icon: 'pi pi-shopping-cart'},
        {hash: "users", label: 'Usuários', icon: 'pi pi-users'},
        {hash: "rules", label: 'Regras', icon: 'pi pi-bolt'},
        {hash: "settings", label: 'Configurações', icon: 'pi pi-wrench'},
    ];
    
    const searchUsers = (event) => {
        console.log(event)
        setTimeout(() => {
            let _filtered_parents;
            if (!event.query.trim().length) {
                _filtered_parents = [...parents];
            }
            else {
                _filtered_parents = parents.filter((country) => {
                    return country.name.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }

            set_filtered_parents(_filtered_parents);
        }, 250);
    }
    useEffect(()=>{
        const hash = asPath.split('#')[1];
        if(hash){
            setActiveIndex(items.findIndex(i=>i.hash == hash))
        }
    },[asPath])

    function loadIframeURLs(){
        var _external_urls = []
		get_all_data("external_url").then((folder_data)=>{
			if(folder_data){
				folder_data.forEach((file_data)=>{
					_external_urls.push(file_data.data())
                })
				set_external_urls(_external_urls)
			}
			console.log(_external_urls)
		})
    }
    useEffect(()=>{
        loadIframeURLs()
        // console.log(currentUser)
        vendedores_db.getItem(currentUser.email).then((seller)=>{
            if(seller){
                set_rp_user(seller)
            }
        })
    },[currentUser])

    useEffect(()=>{
        // console.log(users)
        set_parents(users.concat([currentUser]))
    },[users])

    const onUserEditComplete = (event) => {
        // console.log(event)
        set_selected_parents([])
        let _users = [...users];
        let { newData, index } = event;
        index = _users.findIndex((user)=>user.email == newData.email)
        // console.log(index)
        writeRealtimeData("users/"+newData.uid+"/",newData)

        _users[index] = newData;

        set_users(_users);
    }

    useEffect(()=>{
        // console.log(test_context("test_action",{Numero:49}))
        initFilters1()
    },[actions])
    
    const initFilters1 = () => {
        setFilters1({
            'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
            'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            'email': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            'rp_user.EMRPES_NOME': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        });
        setGlobalFilterValue1('');
    }
    
    const clearFilter1 = () => {
        initFilters1();
    }

    const onGlobalFilterChange1 = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters1 };
        _filters1['global'].value = value;

        setFilters1(_filters1);
        setGlobalFilterValue1(value);
    }

    const renderHeaderSearch = () => {
        return (
            <div className="flex justify-content-center gap-2">
                <Button
                    disabled={globalFilterValue1.length==0}
                    type="button"
                    icon="pi pi-filter-slash"
                    label="Limpar"
                    className="p-button-outlined"
                    onClick={clearFilter1}
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue1}
                        onChange={onGlobalFilterChange1}
                        placeholder="Buscar..." />
                </span>
            </div>
        )
    }
    
    const header_search = renderHeaderSearch();
    
    const userParentEditor = (options) => {
        // console.log(options)
        return(
            <div className="flex-grow-1">
                <AutoComplete
                    style={{width:"max-content"}}
                    dropdown 
                    value={options.value?options.value: selected_parents}
                    suggestions={filtered_parents}
                    completeMethod={searchUsers}
                    field="name"
                    multiple
                    onChange={(e) => {
                        const _parents = e.value.map(i=>{
                            return({
                                name:i.name,
                                email:i.email
                            })
                        })
                        options.editorCallback(_parents)
                        set_selected_parents(_parents)
                    }}
                />      
            </div>
        )
    }

    const userDiscountEditor = (options) => {
        // console.log(options)
        return (
            <div className="flex-grow-1">
                <InputNumber
                    suffix=" %"
                    style={{width:"100%"}}
                    value={options.value}
                    onChange={(e) => options.editorCallback(e.target.value)}
                />
                <Slider value={options.value} onChange={(e) => options.editorCallback(e.value)} />
            </div>
        );
    }

    const userProfileEditor = (options) => {
        return (
            <Dropdown
                value={options.value+1}
                options={profiles}
                scrollHeight={window.innerHeight>300?300:window.innerHeight}
                optionLabel="name"
                optionValue="id"
                onChange={(e) => options.editorCallback(e.target.value-1)}
                placeholder="Selecione um Perfil"
                itemTemplate={(option) => {
                    // console.log(option)
                    return <div className="flex gap-2 align-items-center"><i className={'pi pi-'+option.icon} />{option.name}</div>
                }}
            />
        );
    }
    
    useEffect(()=>{
        if(deepEqual(saved_profiles,profiles) == false){
            if(saved_profiles.length == 0){
                set_saved_profiles(profiles)
            }
            set_changed_profiles(true)
        }else{
            set_changed_profiles(false)
        }
        // console.log(profiles)
    },[profiles])

    useEffect(()=>{
        console.log(items[activeIndex].label)
    },[activeIndex])

    useEffect(()=>{
        // console.log(currentUser)
        readUsers().then(async(data)=>{
            if(!data)return
            
            set_all_users(Object.values(data))

            // Hide current user from user list
            delete (data[currentUser.uid])
            
            for (const [key, value] of Object.entries(data) ){
                const user = data[key]
                user.uid = key

                await get_user_orders(key)
                .then( (orders_data)=>{
                    var user_orders_data = []
                    if(orders_data) {
                        orders_data.forEach((doc) => {
                            const order = doc.data()
                            // console.log(order)
                            user_orders_data.push(order)
                        })
                        
                        user.orders = user_orders_data
                    }
                })
                await vendedores_db.getItem(user.email).then((seller)=>{
                    if(seller){
                        user.rp_user = seller
                        data[key] = user
                        // console.log(user)
                    }
                })
            }
            
            data = Object.values(data).filter( (user)=>{
                if(user.photo.indexOf("super") == -1 ){
                    if(currentUser.role < user.role || user.role == 0){
                        return(user)
                    }
                }
                // return(user)
            })

            // console.log(data)
            set_users(data)
            // load_groups()
        })
    },[currentUser])

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Administação"
            }}
        >
        <Toast ref={toastTL} position="top-left" />
        <main className="flex flex-wrap justify-content-center">
            <div style={{
                position:"absolute",
                padding:"10px",
                backgroundColor:"var(--glass)",
                backdropFilter:"blur(10px)",
                // height:"100vh"
            }}>
                
                <div style={{
                    // borderRadius:"10px",
                    width:"calc(100vw - 30px)",
                    overflow: "scroll",
                    margin:"10px",
                    marginRight:"0px"
                }}>
                    <TabMenu
                        model={items}
                        activeIndex={activeIndex}
                        onTabChange={(e) => {
                            setActiveIndex(e.index)
                            router.push("#"+items[e.index].hash)
                        }}
                    />
                    {items[activeIndex].label == "Regras" &&
                        <Rules currentUser={currentUser}/>
                    }
                    
                    {items[activeIndex].label == "Usuários" &&
                    <DataTable
                        style={{
                            width:"80vw",
                            minWidth:"100%",
                            maxWidth:"800px"
                        }}
                        onRowEditComplete={onUserEditComplete}
                        // size="small"
                        value={users}
                        responsiveLayout="stack"
                        breakpoint="600px"
                        // scrollable
                        scrollHeight="90vh"
                        editMode="row"
                        filters={filters1}
                        filterDisplay="menu"
                        globalFilterFields={[
                            'global',
                            'name',
                            'email',
                            'rp_user.EMRPES_NOME'
                        ]}
                        emptyMessage="Carregando..."
                        header={header_search}
                    >
                        <Column width="8em" field="photo" body={(row_data)=>{
                            return(
                                <UserIcon
                                    size={60}
                                    uid={row_data.uid}
                                    role={true}
                                    icon_only={true}
                                    profiles={profiles}
                                    router={router}
                                />
                            )
                        }}/>
                        
                        <Column width="8rem" field="online" header="Online" body={(row_data)=>{
                            return(<h6 style={{color:"var(--text-c)"}}>
                                {time_ago(row_data.metadata?.lastSeen)}
                            </h6>)
                        }}/>
                        <Column field="name" header="Nome" sortable></Column>
                        <Column field="email" header="E-Mail"></Column>
                        <Column field="rp_user.EMRPES_NOME" header="Empresa"></Column>
                        <Column field="orders.length" header="Orçamentos" sortable body={(row_data)=>{
                                if(row_data.orders && row_data.orders.length > 0){
                                    return(<div className="flex justify-content-center">
                                            <Button
                                                className="p-button-outlined p-button-rounded p-button-success"
                                                style={{whiteSpace:"nowrap"}}
                                                label={row_data.orders.length + " Orçamento" +(row_data.orders.length>1?"s":"")}

                                                onClick={async (event)=>{
                                                    // console.log(row_data)
                                                    set_orders(row_data.orders)
                                                    set_selected_user(row_data)
                                                    set_display_orders(true)
                                                    
                                                }}
                                            />
                                        </div>)
                                }else{
                                    return(<div className="flex justify-content-center">Nenhum</div>)
                                }
                        }}></Column>
                        <Column field="parent" header="Responsáveis"
                            body={(row_data)=>{
                                return(
                                    <div className="flex gap-2 align-items-center">
                                        <Button
                                            style={{width:"40px",height:"40px"}}
                                            className="p-button-rounded p-button-outlined flex flex-none"
                                            tooltip={row_data.parent? row_data.parent.map(u=>u.name).join("\n"):""}
                                            icon="pi pi-sitemap"
                                            onClick={(event)=>{
                                                set_selected_user(row_data)
                                                set_display_hierarchy(true)
                                            }}
                                        />
                                        {row_data.parent && <h6>{row_data.parent.length == 1 ? row_data.parent[0].name:row_data.parent.length+" usuários"}</h6>}
                                    </div>
                                )
                            }}
                            editor={(options) => userParentEditor(options)}>                        
                        </Column>
                        
                        <Column sortable field="discount" header="Desconto"
                            body={(row_data)=>{
                                return(<div>
                                    <ProgressBar value={row_data.discount} />
                                </div>)
                            }}
                            editor={(options) => userDiscountEditor(options)}>
                        </Column>
                        <Column field="role" header="Perfil" sortable
                            editor={(options) => userProfileEditor(options)}
                            body={(row_data)=>{
                                if(!profiles)return(<></>)
                                return(profiles[row_data.role]?.[row_data.photo[0]])
                            }}
                        ></Column>
                        <Column
                            rowEditor
                            headerStyle={{
                                width: '10%',
                                minWidth: '8rem'
                            }}
                            bodyStyle={{
                                textAlign: 'center'
                            }}>    
                        </Column>
                    </DataTable>}
                    
                    {items[activeIndex].label == "Configurações" &&
                    <div>
                        <SettingsPage tabs={[
                            {
                                icon:"pi pi-clock",
                                header:"Ações Agendadas",
                                body:<CronActionsPage 
                                    onSave={()=>{
                                        toastTL.current.show({
                                            severity: 'success',
                                            summary: 'Sucesso',
                                            detail: 'Ação foi agendada na nuvem.',
                                            life: 3000
                                        });
                                    }}
                                    onUpdate={(action)=>{
                                        toastTL.current.show({
                                            severity: 'info',
                                            summary: 'Sucesso',
                                            detail: 'Ação foi atualizada.',
                                            life: 3000
                                        });
                                    }}
                                />
                            },
                            {
                                icon:"pi pi-cog",
                                header:"Ações do sistema",
                                body:<ActionsPage />
                            },
                            {
                                icon:"pi pi-shopping-cart",
                                header:"Promoções",
                                body:<ProductsTable products={all_products} />
                            },
                            {
                                icon:"pi pi-user-edit",
                                header:"Perfis",
                                body:<DataTable
                                    value={profiles.filter(profile=>currentUser.role!=profile.id-1 && currentUser.role < profile.id-1 || profile.id == 1)}
                                    // selectionMode="checkbox"
                                    selection={selected_profiles}
                                    onSelectionChange={e => set_selected_profiles(e.value)}
                                    dataKey="id"
                                    // style={{
                                    //     width:"80vw",
                                    //     minWidth:"100%",
                                    //     maxWidth:"800px"
                                    // }}
                                    // size="large"
                                    responsiveLayout="stack"
                                    breakpoint="600px"
                                    // scrollable
                                    // scrollHeight="90vh"
                                    footer={()=>{
                                        return(<div className="flex justify-content-between flex-wrap">
                                            {/* <Button
                                                // className="p-button-outlined"
                                                label="Criar Perfil"
                                                icon="pi pi-id-card"
                                            /> */}
                                            <Button
                                                className="p-button-success "
                                                disabled={!changed_profiles}
                                                label="Salvar Alterações"
                                                icon="pi pi-cloud-upload"
                                                onClick={()=>{
                                                    showTopLeftToast()
                                                    set_changed_profiles(false)
                                                    set_saved_profiles(profiles)
                                                    upload_profiles()
                                                }}
                                            />
                                        </div>)
                                    }}
                                >
                                    {/* <Column selectionMode="multiple" headerStyle={{width: '3em'}}></Column> */}
                                    <Column field="icon" body={(row_data)=>{
                                        return(<div className="flex flex-wrap w-11rem">
                                            <div className="flex align-items-center w-auto h-full">
                                                <label className="text-purple-300 font-bold uppercase">{row_data.name}</label>
                                                <Button className="text-purple-100 p-button-text shadow-none p-button-rounded p-button-lg" icon={'pi pi-'+row_data.icon}/>
                                            </div>
                                            <div className="w-full p-2">
                                                <div className="flex flex-wrap align-items-center">
                                                    <i className="text-pink-300 pi pi-caret-down mr-2"/>
                                                    <label>{row_data.f}</label>
                                                </div>
                                                <div className="flex flex-wrap align-items-center">
                                                    <i className="text-blue-300 pi pi-caret-up mr-2"/>
                                                    <label>{row_data.m}</label>
                                                </div>
                                            </div>
                                        </div>)
                                    }}></Column>
                                    <Column field="dashboard" header="Dashboard" body={(row_data)=>{
                                        
                                        return(<MultiSelect
                                            filter
                                            selectAll
                                            value={row_data.dashboard?row_data.dashboard:[]}
                                            options={external_urls}
                                            scrollHeight={window.innerHeight>300?300:window.innerHeight}
                                            optionLabel="dashboard_name"
                                            optionValue="uid"
                                            placeholder="Nenhuma"
                                            maxSelectedLabels={1}
                                            panelHeaderTemplate={()=>{}}
                                            // selectedItemsLabel={row_data.rules && row_data.rules.length == Object.values(rules).length? "Pode tudo" :"{0} Ativos"}
                                            style={{width:"100%"}} 
                                            // selectedItemTemplate={this.selectedItemTemplate}
                                            // onChange={this.props.onChangeGroups}
                                            onChange={(event)=>{
                                                const set_dashboard = (value)=>{
                                                    var _row_data = {...row_data}
                                                    _row_data.dashboard = value
                                                    update_profiles(_row_data)
                                                }
                                                set_dashboard(event.value)
                                            }}
                                        />)
                                    }}></Column>
                                    {/* <Column field="f" header="Nome Feminino"></Column>
                                    <Column field="m" header="Nome Masculino"></Column> */}
                                    <Column field="sla" header="Tempo SLA" body={(row_data)=>{
                                        const set_sla = (value)=>{
                                            var _row_data = {...row_data}
                                            _row_data.sla = value
                                            update_profiles(_row_data)
                                        }
                                        return(
                                            <InputNumber
                                                value={row_data.sla}
                                                suffix=" Horas"
                                                onChange={(e) => set_sla(e.value)}
                                            />
                                        )
                                    }}></Column>
                                    <Column field="discount" header="Desconto" body={(row_data)=>{
                                        const set_discount = (value)=>{
                                            var _row_data = {...row_data}
                                            _row_data.discount = value
                                            update_profiles(_row_data)
                                        }
                                        return(<div className="flex-grow-1">
                                            <InputNumber
                                                suffix=" %"
                                                // style={{width:"100%"}}
                                                value={row_data.discount}
                                                onChange={(e) => set_discount(e.value)} />
                                            <Slider value={row_data.discount} onChange={(e) => set_discount(e.value)} />
                                        </div>)
                                    }}></Column>
                                    
                                    <Column field="rules" header="Direitos" body={(row_data)=>{
                                        return(<MultiSelect
                                            filter
                                            selectAll
                                            value={row_data.rules?row_data.rules:[]}
                                            options={Object.values(rules)}
                                            scrollHeight={window.innerHeight>300?300:window.innerHeight}
                                            optionLabel="nome"
                                            optionValue="id"
                                            placeholder="Nenhuma"
                                            maxSelectedLabels={1}
                                            panelHeaderTemplate={()=>{}}
                                            selectedItemsLabel={row_data.rules && row_data.rules.length == Object.values(rules).length? "Pode tudo" :"{0} Ativos"}
                                            style={{width:"100%"}} 
                                            // selectedItemTemplate={this.selectedItemTemplate}
                                            // onChange={this.props.onChangeGroups}
                                            onChange={(event)=>{
                                                const set_rules = (value)=>{
                                                    var _row_data = {...row_data}
                                                    _row_data.rules = value
                                                    update_profiles(_row_data)
                                                }
                                                set_rules(event.value)
                                            }}
                                        />)
                                    }}></Column>
                                    <Column
                                        field="pages"
                                        header="Áreas do Site"
                                        body={(row_data)=>{
                                        return(<MultiSelect
                                            style={{width:"100%"}} 
                                            filter
                                            selectAll
                                            value={row_data.pages}
                                            options={[
                                                {
                                                    label:'Perfil',
                                                    icon:'pi pi-user',
                                                    value:1
                                                },
                                                {
                                                    label:'Vendas',
                                                    icon:'pi pi-shopping-cart',
                                                    value:2
                                                },
                                                {
                                                    label:'Administração',
                                                    icon:'pi pi-briefcase',
                                                    value:3
                                                },
                                                {
                                                    label:'Database',
                                                    icon:'pi pi-server',
                                                    value:4
                                                },
                                                {
                                                    label:'Arquivos',
                                                    icon:'pi pi-folder',
                                                    value:5
                                                }
                                            ]}
                                            scrollHeight={window.innerHeight>300?300:window.innerHeight}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Selecione..."
                                            maxSelectedLabels={1}
                                            panelHeaderTemplate={()=>{}}
                                            selectedItemsLabel={"{0} Páginas"}
                                            // selectedItemTemplate={this.selectedItemTemplate}
                                            onChange={(event)=>{
                                                const set_pages = (value)=>{
                                                    var _row_data = {...row_data}
                                                    _row_data.pages = value
                                                    update_profiles(_row_data)
                                                }
                                                set_pages(event.value)
                                            }}
                                        />)
                                    }}></Column>
                                </DataTable>
                            },
                            {
                                icon:"pi pi-paperclip",
                                header:"URL externa",
                                body:<div>
                                    <DataTable
                                        // className="p-datatable-sm"
                                        value={external_urls}
                                    >
                                        <Column header="Imagem" field="dashboard_image" body={(row_data)=>{
                                            return(<Button className="hover:opacity-100 p-0 max-w-10rem max-h-10rem border-round-lg border-none overflow-hidden justify-content-center" onClick={(e)=>{
                                                // console.log(row_data)
                                                set_iframe_data(row_data)
                                                set_new_iframe(false)
                                            }}>
                                                <i className="opacity-0 absolute pi pi-eye text-3xl text-blue-500 bg-glass-b p-3 border-circle" />
                                                <img className="w-full" src={row_data.selected_image}/>
                                            </Button>)
                                        }}/>
                                        <Column header="Nome" field="dashboard_name"/>
                                        <Column header="Criador" field="dashboard_image" body={(row_data)=>{
                                            return(<UserIcon uid={row_data.user_uid} inline/>)
                                        }}/>
                                        <Column header="Data" field="dashboard_image" body={(row_data)=>{
                                            return(<div>
                                                <div>{sqlDateToString(row_data.enviado?.toDate())}</div>
                                                <div>{time_ago(row_data.enviado.toDate())}</div>
                                            </div>)
                                        }}/>
                                    </DataTable>
                                    <IframeExternalURL
                                        editable
                                        data={iframe_data}
                                        edit={new_iframe}
                                        onSave={(e)=>{
                                            loadIframeURLs()
                                        }}
                                    />
                                </div>
                            }
                        ]}/>
                    </div>
                    }

                <Dialog
                    header={selected_user?`Fluxo de aprovação de ${selected_user.name}`:"Fluxo"}
                    visible={display_hierarchy}
                    // maximizable
                    blockScroll={true}
                    onShow={()=>{scrollToTop()}}
                    modal
                    style={{
                        minWidth:"50vw",
                        width:"100vw",
                        maxWidth: 'min-content',
                    }}
                    // footer={renderFooter('display_hierarchy')}
                    onHide={() => {
                        set_display_hierarchy(false)
                        set_selected_user(null)
                    }}>
                    <HierarchyChart profiles={profiles} user={selected_user} users={all_users}/>
                </Dialog>

                <Dialog
                    header={"Orçamentos de "+ selected_user?.name}
                    modal
                    style={{
                        minWidth:"50vw",
                        width:"100vw",
                        maxWidth: 'max-content',
                    }}
                    visible={display_orders}
                    blockScroll={true}
                    onShow={()=>{scrollToTop()}}
                    onHide={() => {
                        set_orders([])
                        set_display_orders(false)
                        set_selected_user(null)
                    }}>
                    <DataTable value={orders}>
                        <Column field="name" header="Nome" body={(row_data)=>{
                            // console.log(row_data.name)
                            if(row_data.name == "") return('"SEM NOME"')
                            return(row_data.name)
                        }}/>

                        <Column field="history[0].date" header="Criado" body={(row_data)=>{
                            // console.log(row_data)
                            return(time_ago(row_data.history[0].date))
                        }}/>
                        <Column field="history[0].date" header="Status" body={(row_data)=>{
                            const status = row_data.history.slice(-1)[0]
                            // console.log(row_data, status)
                            return(status.action +" "+ time_ago(status.date).toLocaleLowerCase())
                        }}/>
                        <Column field="client.fantasia" header="Cliente"/>
                        <Column field="items.length" header="Itens"/>
                        <Column field="edit" body={(row_data)=>{
                            return(<div>
                                <Button
                                    label="Visualizar"
                                    className="p-button-outlined p-button-rounded"
                                    icon="pi pi-eye"
                                    onClick={(event)=>{
                                        router.push("/order#"+row_data.uid)
                                    }}
                                />
                            </div>)
                        }}/>
                    </DataTable>
                    {/* <OrderCard products={orders} /> */}
                </Dialog>
                
                </div>
            </div>
        </main>
        </ObjectComponent>
    );
}