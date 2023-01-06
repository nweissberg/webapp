import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { useEffect, useState } from "react";
import { set_data } from "../../api/firebase";
import Rule from "../../contexts/rule_icon";
import { Chips } from 'primereact/chips';
import { scrollToTop } from "../../utils/util";

export default function CronActionsPage(){
    const [actions_array, set_actions_array] = useState([])
    const [action, set_action] = useState(null)
    const [week_label, set_week_label] = useState("Selecione")
    
    const new_action = {
        name: "Sem Nome",
        info: "",
        script: "",
        code: "* * * * *",
        exec: 5,
        repete: [],
        times:0,
        date:new Date(),
        days:[]
    };
    const exec_modes = [
        {label:"de hora-em-hora",value:5},
        {label:"apenas uma vez",value:4},
        {label:"todos os dias",value:0},
        {label:"toda semana",value:1},
        {label:"todo mês",value:2},
        {label:"todo ano",value:3},
    ]
    const weekdays = [
        {label:"Dom",name:"Domingo",value:0},
        {label:"Seg",name:"Segunda",value:1},
        {label:"Ter",name:"Terça",value:2},
        {label:"Qua",name:"Quarta",value:3},
        {label:"Qui",name:"Quinta",value:4},
        {label:"Sex",name:"Sexta",value:5},
        {label:"Sáb",name:"Sábado",value:6}
    ]

    useEffect(()=>{
        set_actions_array([
            {
                name: "Hora do Almoço",
                info: "Todos os dias ao meio dia",
                script: "7gmKGAPZcklpOqb3rW9Z",
                code: "0 12 * * *",
                exec: 0,
                repete: [],
                times:[12],
                days:[]
            },
            {
                info: "Segunda à Sexta as 20:00",
                script: "ZovzQVSfXMHNGrFYsrNT",
                code: "0 20 * * 1-5",
                name: "Início de expediente",
                exec: 1,
                repete: [1,2,3,4,5],
                times:[20],
                days:[]
            }
        ])
    },[])

    function edit_action(key,value){
        var _action = {...action};
        _action[key] = value;
        set_action(_action)
    }

    function isSequential(array) {
        for (let i = 1; i < array.length; i++) {
          if (array[i] !== array[i - 1] + 1) {
            return false;
          }
        }
        return true;
    }

    const customChip = (item) => {
        var hour = String(Number(item))
        return (
            <div>
                <span>{(item<9?"0":"")+hour}:00</span>
            </div>
        );
    }

    var can_save = true

    if(action && action.exec == 1 && action.repete.length == 0){
        can_save = false
    }
    return(<div>
        <DataTable
            value={actions_array}  
            footer={
                <div className="flex justify-content-end">
                    <Button 
                        label="Agendar Nova Ação"
                        onClick={(event)=>{
                            set_action({...new_action})
                        }}
                    />
                </div>
            }
        >
            <Column field="script" header="Regra"
                body={(row_data)=>{
                    return(<Rule key={row_data.code} uid={row_data.script}/>)
                }}
            />
            <Column field="name" header="Nome" />
            <Column field="code" header="Código Cron" alignHeader={'center'} style={{textAlign:"center"}}/>
            <Column field="info" header="Descrição" alignHeader={'center'}  style={{textAlign:"right"}} />
            <Column field="edit"
                body={(row_data)=>{
                    return(<Button
                        className="p-button-rounded p-button-text p-button-secondary"
                        icon="pi pi-pencil"
                        onClick={(event)=>{
                            set_action(row_data)
                        }}
                    />)
                }}
            />
        </DataTable>

        <Dialog
            header={action?`Editar Ação "${action.name}"`:"Nova Ação"}
            modal
            blockScroll={true}
            onShow={()=>{scrollToTop()}}
            onHide={()=>{set_action(null)}}
            style={{
                minWidth:"50vw",
                width:"100vw",
                maxWidth: 'min-content',
            }}
            visible={action!=null}
            footer={
                <div className="flex justify-content-between">
                    <Button className="p-button-secondary p-button-outlined" label="Restaurar" icon="pi pi-replay"/>
                    <Button
                        disabled={!can_save}
                        className="p-button-outlined"
                        label="Salvar"
                        icon="pi pi-save"
                    />
                </div>
            }
        >
            {action && <div className="p-fluid grid formgrid">
                <div className="align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>Nome</h5>
                    <InputText
                        value={action.name} 
                        onChange={(event)=>{
                            edit_action("name",event.target.value)
                        }}
                    />
                </div>
                {/* <div className="flex align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-4 lg:col-8">
                    <h5 style={{color:"var(--text-c)"}}>Descrição</h5>
                    <InputText
                        value={action.info} 
                        onChange={(event)=>{
                            edit_action("info",event.target.value)
                        }}
                    />
                </div> */}

                <div className="align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>Executar</h5>
                    <Dropdown
                        style={{width:"100%"}}
                        value={action.exec}
                        options={exec_modes}
                        onChange={(event)=>{
                            edit_action("exec",event.target.value)
                        }}
                    />
                </div>
                <div className="align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>Regra</h5>
                    <Rule uid={action.script} editable={true} onClear={()=>{}}/>
                </div>
                {action.exec == 1 && <div className="flex align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-4 lg:col-6">
                    
                    <h5 style={{color:"var(--text-c)", whiteSpace:"nowrap"}}>{week_label}</h5>
                    <MultiSelect
                        style={{width:"100%"}}
                        panelHeaderTemplate={<></>}
                        showSelectAll={false}
                        value={action.repete.sort()}
                        options={weekdays}
                        onChange={(e) => {
                            if(e.value.length != weekdays.length){
                                edit_action("repete",e.value)
                            }else{
                                edit_action("exec",0)
                            }
                        }}
                        optionLabel="name"
                        selectedItemTemplate={(item)=>{
                            let day = weekdays.find((day)=> day.value == item)
                            const selected = action.repete.sort()
                            if(selected.length == 0) {
                                if(week_label!= "Selecione") set_week_label("Selecione")
                                // return("os dias")
                                return(<span style={{color:"var(--text-b)"}}>os dias...</span>)
                            }
                            if(selected.length == 1) {
                                if(week_label!= "Somente") set_week_label("Somente")
                                return(day.name)
                            }
                            if(selected.length == weekdays.length){
                                if(week_label!= "Em") set_week_label("Em")
                                if(item != 0) return("")
                                return("todos os dias")
                            }
                            
                            let first = [...selected].shift()
                            let last = [...selected].pop()

                            if(isSequential(selected) && selected.length > 2){
                                if(week_label!= "De") set_week_label("De")                      
                                if(first != item && last != item) return("")
                                return((first == item?"":" a ") + day.name.toLocaleLowerCase())
                            }
                            if(week_label!= "Nos dias") set_week_label("Nos dias")
                            return(day.label + (selected.length > 1 && last != item?", ":""))
                        }}
                    />
                </div>}

                {action.exec == 4 && <div className="flex align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                <h5 style={{color:"var(--text-c)", whiteSpace:"nowrap"}}>No dia</h5>
                    <Calendar
                        style={{width:"100%"}}
                        showButtonBar
                        // timeOnly
                        // touchUI
                        // showTime
                        minDate = {new Date()}
                        // inline
                        dateFormat="dd M yy"
                        hourFormat="24"
                        value={action.date}
                        onChange={(e) => {
                            console.log(e.value)
                            edit_action("date",e.value)
                        }}
                    />
                </div>}
                
                {(action.exec == 2) && <div className="flex align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-4 lg:col-8">
                    <h5 style={{color:"var(--text-c)", whiteSpace:"nowrap"}}>{action.days.length > 1?"Nos dias":"No dia"}</h5>
                    <Chips
                        style={{width:"100%"}}
                        addOnBlur={true}
                        allowDuplicate={false}
                        value={action.days}
                        onAdd={(e)=>{
                            if(e.value > 31 || e.value < 1 ) return(false)
                        }}
                        onChange={(e) =>{
                            edit_action("days",e.value)
                        }}
                    />
                </div>}

                {action.exec != 5 && action.exec != 4 && <div className="flex align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>As</h5>
                    <Chips
                        style={{width:"100%"}}
                        addOnBlur={true}
                        allowDuplicate={false}
                        value={action.times}
                        itemTemplate={customChip}
                        onAdd={(e)=>{
                            if(e.value > 23 || e.value < 0 ) return(false)
                        }}
                        onChange={(e) =>{
                            edit_action("times",e.value)
                        }}
                    />
                </div>}
                
                {action.exec == 4 && <div className="flex align-items-center gap-2 flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>As</h5>
                    <InputNumber
                        min={0}
                        max={23}
                        inputId="time"
                        value={action.times[0]}
                        onChange={(e) =>{
                            edit_action("times",e.value?[e.value]:[])
                        }}
                        suffix=" horas"
                    />
                </div>}

            </div>}
        </Dialog>

    </div>)
}