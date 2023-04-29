import React, { useRef, useState, useEffect } from "react"
import ObjectComponent, { load_notifications } from "../components/object";
import { Button } from "primereact/button";
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useAuth } from "../api/auth"
import { shorten, time_ago } from "../utils/util";
import { useRouter } from 'next/router'
import { writeRealtimeData } from "../api/firebase";
import { Toolbar } from "primereact/toolbar";
import Swal from "sweetalert2";

export default function AlertsPage(){
    const [alerts, set_alerts] = useState([])
    const [selectedAction, setSelectedAction] = useState([])
    
    const { currentUser } = useAuth()
    const router = useRouter()
    
    useEffect(()=>{
        load_notifications(currentUser.uid,true).then((alerts_data)=>{
            // console.log(alerts_data)
            set_alerts(alerts_data)
        })
    },[currentUser])

    function onView(action) {
        // var action = {...e.value}
        // console.log(action)
        action.viewed = true
        writeRealtimeData("notifications/"+currentUser.uid+"/"+action.uid, action)
        .then((ret)=>{
            router.push("/"+action.url)
        })
        // this.toast.show({severity:'info', summary: 'Action Selected', detail: this.state.selectedAction.title, life: 3000});
        
    }
    
    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Notificações"
            }}
            alerts={false}
        >
        
        <div className="card" >
            <DataTable
                value={alerts}
                // selectionMode="multiple"
                responsiveLayout="scroll"
                scrollHeight='calc(100vh - 130px)'
                paginator
                rows={7}
                // scrollable
                // selectionPageOnly
                emptyMessage="Carregando..."
                // breakpoint="100px"
                sortField="serverTime"
                sortOrder={-1}
                // selection={this.state.selectedAction}
                // onSelectionChange={(e)=>{
                //     onActionSelect(e)
                // }}
                selectionMode="checkbox"
                selection={selectedAction}
                onSelectionChange={e => setSelectedAction(e.value)}
                dataKey="uid"
                // size="small"
                // style={{
                //     height:"100%"
                // }}
                // contextMenuSelection={this.state.selectedAction}
                // onContextMenuSelectionChange={e => this.setState({ selectedAction: e.value })}
                // onContextMenu={e => this.cm.show(e.originalEvent)}
                // headerStyle="p-0"
                header={
                    <div style={{width:"100%"}} className="flex justify-content-between">
                        
                        <div className="flex align-items-center">
                            {/* <Button 
                                disabled={selectedAction.length == 0}
                                className="p-button-outlined p-button-help mr-2"
                                label={window.innerWidth < 500?"":"Cancelar"}
                                icon="pi pi-times"
                                onClick={(e)=>{
                                    setSelectedAction([])
                                }}
                            /> */}
                            <Button 
                                disabled={selectedAction.length == 0}
                                className="p-button-outlined p-button-danger"
                                label={(window.innerWidth < 500?"":"Excluir ") + selectedAction.length}
                                icon="pi pi-trash"
                                onClick={(e)=>{

                                    Swal.fire({
                                        title: 'Aviso',
                                        text: `Excluir ${selectedAction.length} notificações?`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: 'var(--teal-700)',
                                        cancelButtonColor: 'var(--orange-700)',
                                        confirmButtonText: 'Sim, remover!',
                                        cancelButtonText: 'Cancelar'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            var _alerts = [...alerts]
                                            selectedAction.map((alert)=>{
                                                _alerts = _alerts.filter(item=>item.uid!=alert.uid)
                                                writeRealtimeData("notifications/"+currentUser.uid+"/"+alert.uid,null)
                                            })
                                            setSelectedAction([])
                                            set_alerts(_alerts)
                                        }
                                    })
                                }}
                            />
                        </div>

                        <div className="flex align-items-center">
                            <h6 className="p-1 pt-2 mr-2" style={{color:"var(--text-c)"}}>Marcar como:</h6>
                            <Button
                                disabled={selectedAction.length == 0}
                                className="p-button-outlined p-button-success mr-2"
                                label={window.innerWidth < 500?"":"Nova"}
                                icon="pi pi-bell"
                                onClick={(e)=>{
                                    var _alerts = [...alerts]
                                    selectedAction.map((alert)=>{
                                        if(alert.viewed != false){
                                            _alerts.find(item=>item.uid==alert.uid).viewed = false
                                            var alert_obj = {...alert}
                                            delete(alert_obj.uid)
                                            writeRealtimeData("notifications/"+currentUser.uid+"/"+alert.uid,alert_obj)
                                        }
                                    })
                                    setSelectedAction([])
                                    set_alerts(_alerts)
                                }}
                            />
                            <Button
                                disabled={selectedAction.length == 0}
                                className="p-button-outlined p-button-secondary"
                                label={window.innerWidth < 500?"":"Visualizada"}
                                icon="pi pi-check"
                                onClick={(e)=>{
                                    var _alerts = [...alerts]
                                    selectedAction.map((alert)=>{
                                        if(alert.viewed != true){
                                            _alerts.find(item=>item.uid==alert.uid).viewed = true
                                            var alert_obj = {...alert}
                                            delete(alert_obj.uid)
                                            writeRealtimeData("notifications/"+currentUser.uid+"/"+alert.uid,alert_obj)
                                        }
                                    })
                                    setSelectedAction([])
                                    set_alerts(_alerts)
                                }}
                            />
                        </div>
                    </div>
                }
            >
                <Column selectionMode="multiple" headerStyle={{width: '3em'}}></Column>
                
                <Column header="Notificações" body={(row_data)=>{
                    
                    return(<div>
                        <div className="flex align-items-start justify-content-between">
                            <h5 style={{color:"var(--text-c)"}}>{row_data.title}</h5>
                            <div className="show_on_mobile">
                                <i className={(row_data.viewed==true?"pi pi-check":"pi pi-bell")+" p-1"}
                                    style={{
                                        fontSize: '18px',
                                        color:row_data.viewed==true?"var(--text-c)":"var(--success)"
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className='pl-1'>
                                {row_data.message}
                            </div>
                            <div className="flex justify-content-between mt-2">
                                <div className="show_on_mobile">
                                    <Button 
                                        label="Visualizar"
                                        icon="pi pi-link"
                                        className={"p-button-rounded "+(row_data.viewed?"p-button-secondary p-button-outlined":"")+" pt-0 pb-0 pl-2 pr-2 mt-1"}
                                        onClick={(e)=>{
                                            onView(row_data)
                                        }}
                                    />
                                </div>
                                <h6 className="m-2 show_on_mobile"
                                    style={{
                                        textAlign:"right",
                                        color:row_data.viewed?"var(--text-c)":"var(--info)"
                                    }}
                                >{time_ago(row_data.serverTime)}</h6>
                            </div>
                        </div>
                    </div>)
                }} />
                <Column
                    className="hide_on_mobile" 
                    field="url"
                    // header="url"
                    body={(row_data)=>{
                        return(<Button 
                            // style={{color:"var(--text)"}}
                            label="Visualizar"
                            icon="pi pi-link"
                            className={"p-button-rounded "+ (row_data.viewed?"p-button-secondary p-button-outlined":"")}
                            onClick={(e)=>{
                                onView(row_data)
                            }}
                        />)
                    }}
                    // sortable
                />
                <Column
                    className="hide_on_mobile"
                    field="serverTime"
                    header="Quando"
                    body={(row_data)=>{
                        return(time_ago(row_data.serverTime))
                    }}
                    sortable
                />
                
                <Column
                    className="hide_on_mobile"
                    field="viewed"
                    body={(row_data)=>{
                        return(
                            <div className="flex justify-content-center">
                                <i className={row_data.viewed==true?"pi pi-check":"pi pi-bell"}
                                    style={{
                                        fontSize: '25px',
                                        color:row_data.viewed==true?"var(--text-c)":"var(--success)"
                                    }}
                                />
                            </div>
                        )
                    }}
                    sortable
                />
            </DataTable>
        </div>
        {/* <div style={{position:"sticky", bottom:"0px",width:"100%"}}>
            
        </div> */}
        </ObjectComponent>
    );
}