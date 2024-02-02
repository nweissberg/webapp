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
import { add_data, get_all_data, set_data } from "../../api/firebase";
import Rule from "../../contexts/rule_icon";
import { Chips } from 'primereact/chips';
import { scrollToTop } from "../../utils/util";
import { Timestamp } from "firebase/firestore"; 

const new_action = {
    name: "Sem Nome",
    info: "",
    script: "",
    exec: 5,
    weekdays: [],
    times:[],
    date:Timestamp.now(),
    days:[],
    months:[]
};

const exec_modes = [
    {label:"hora-em-hora",value:5},
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
const months = [
    {label:"Jan", name:"Janeiro",value:0},
    {label:"Fev", name:"Fevereiro",value:1},
    {label:"Mar", name:"Março",value:2},
    {label:"Abr", name:"Abril",value:3},
    {label:"Mai", name:"Maio",value:4},
    {label:"Jun", name:"Junho",value:5},
    {label:"Jul", name:"Julho",value:6},
    {label:"Ago", name:"Agosto",value:7},
    {label:"Set", name:"Setembro",value:8},
    {label:"Out", name:"Outubro",value:9},
    {label:"Nov", name:"Novembro",value:10},
    {label:"Dez", name:"Dezembro",value:11},
]

export default function CronActionsPage(props){
    const [actions_array, set_actions_array] = useState([])
    const [action, set_action] = useState(null)
    const [week_label, set_week_label] = useState("Selecione")
    const [can_save, set_can_save] = useState(false)
    
    

    useEffect(()=>{
        get_all_data("cron").then((cron_data)=>{
            var cron_jobs = []
            if(cron_data) cron_data.forEach((job)=>{
                cron_jobs.push(job.data())
            })
            set_actions_array(cron_jobs)
        })
    },[])

    function edit_action(key,value){
        var _action = {...action};
        _action[key] = value;
        set_action(_action)

        
        if(_action.script == ""){
            set_can_save(false)
            return
        }
        if(_action.exec == 1 && (_action.weekdays.length == 0 || _action.times.length == 0)){
            set_can_save(false)
            return
        }

        if(_action.exec == 0 && _action.times.length == 0){
            set_can_save(false)
            return
        }

        if(_action.exec == 4 && _action.times.length == 0 ){
            set_can_save(false)
            return
        }

        if(_action.exec == 2 && (_action.days.length == 0 || _action.times.length == 0)){
            set_can_save(false)
            return
        }

        if(_action.exec == 3 && (_action.months.length == 0 || _action.days.length == 0 || _action.times.length == 0)){
            set_can_save(false)
            return
        }
    
        set_can_save(true)
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
                    return(<Rule uid={row_data.script}/>)
                }}
            />
            <Column field="name" header="Nome" />
            <Column field="info" header="Descrição"
                alignHeader={'center'}
                style={{textAlign:"right"}}
                body={(action)=>{
                    var text_info = "Executa "

                    if(action.exec == 5) text_info += "de "
                    text_info += exec_modes.find((mode)=>mode.value == action.exec).label +", "
                    if(action.exec == 5) text_info += "todos os dias"

                    if(action.exec == 4){
                        text_info += " " + new Date(action.date.toMillis()).toLocaleDateString("pt-br", {
                            hour12: false,
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })
                        text_info += `, as ${action.times[0]}:00 horas`
                    }else if(action.exec != 5){

                        if(action.exec == 1){
                            let first = weekdays.find((weekday)=> weekday.value == [...action.weekdays].shift()) 
                            let last = weekdays.find((weekday)=> weekday.value == [...action.weekdays].pop()) 
                            if(action.weekdays.length <= 2){
                                if(action.weekdays.length == 1){
                                    let final = ( first.value == 0 || first.value == 6 )
                                    text_info += `${final?"no":"na"} ${first.name}${final?"":"-feira"}, `
                                }else{
                                    text_info += `na ${first.name} e ${last.name}, `
                                }
                            }else if(isSequential(action.weekdays)){
                                text_info += `de ${first.name} a ${last.name}, `
                            }else{
                                text_info += "de "
                                action.weekdays.map((item,index)=>{
                                    let weekday = weekdays.find((weekday)=> weekday.value == item)
                                    var label = weekday.label
                                    
                                    text_info += label 
                                    if(index < action.weekdays.length-2){
                                        text_info +=", "
                                    }else{
                                        if(index == action.weekdays.length-1){
                                            text_info +=", "
                                        }else{
                                            text_info +=" e "
                                        }
                                    }
                                })
                            }
                        }

                        if(action.exec == 3){
                            text_info += "em"
                            action.months.map((item,index)=>{
                                let month = months.find((month)=> month.value == item)
                                var label = month.label
                                if(action.months.length == 1){
                                    text_info += " "+ month.name +", "
                                }else{
                                    if(action.months.length <= 2) label = month.name
                                    if(index < action.months.length-1){
                                        text_info += " "+ label
                                        if(index < action.months.length-2) text_info += ","
                                    }else{
                                        text_info += " e "+ label +", "
                                    }
                                }
                            })
                        }
                        if(action.exec == 2 || action.exec == 3){
                            if(action.days.length > 1){
                                text_info += "nos dias "
                                if(action.days.length == 2){
                                    text_info += action.days[0] +" e "+ action.days[1] +", "
                                }else{
                                    action.days.map((day)=>{
                                        text_info += day+", "
                                    })
                                }
                            }else{
                                text_info += "no dia " + action.days[0] +", "
                            }
                        }

                        if(action.times.length == 1){
                            text_info += `as ${action.times[0]}:00 horas`
                        }else{
                            if(action.times.length == 2){
                                text_info +="as "+ action.times[0] +":00 e "+ action.times[1] +":00 horas"
                            }else{
                                text_info +="as "
                                action.times.map((time,i)=>{
                                    if(action.times.length != i+1){
                                        text_info += time+"h, "
                                    }else{
                                        text_info += time+"h"
                                    }
                                })
                            }
                        }
                    }
                    return(<span className="ml-2">{text_info}</span>)
                }}
            />
            <Column field="edit"
                body={(row_data)=>{
                    return(<Button
                        className="p-button-rounded p-button-text p-button-secondary"
                        icon="pi pi-pencil"
                        onClick={(event)=>{
                            var editable_action = {...new_action, ...row_data}
                            if(row_data.date) editable_action.date = new Date(row_data.date.toMillis())
                            set_action(editable_action)
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
                <div className="flex justify-content-center">
                    {/* <Button className="p-button-secondary p-button-outlined" label="Restaurar" icon="pi pi-replay"/> */}
                    {action && <Button
                        disabled={!can_save}
                        className="p-button-outlined p-button-rounded"
                        label={action.uid?"Atualizar Ação":"Salvar Ação"}
                        icon={action.uid?"pi pi-sync":"pi pi-save"}
                        onClick={()=>{
                            var _action = {...action}
                            switch (_action.exec) {
                                case 5: // hora-em-hora
                                    delete _action.date
                                    delete _action.days
                                    delete _action.months
                                    delete _action.weekdays
                                    delete _action.times
                                    break;
                                case 4: // uma vez
                                    _action.date = Timestamp.fromDate(_action.date)
                                    delete _action.days
                                    delete _action.months
                                    delete _action.weekdays
                                    break;
                                case 3: // todo ano
                                    delete _action.date
                                    delete _action.weekdays
                                    break;
                                case 2: // todo mês
                                    delete _action.date
                                    delete _action.months
                                    delete _action.weekdays
                                    break;
                                case 1: // toda semana
                                    delete _action.date
                                    delete _action.days
                                    delete _action.months
                                    break;
                                case 0: // todo dia
                                    delete _action.date
                                    delete _action.days
                                    delete _action.months
                                    delete _action.weekdays
                                    break;
                                default:
                                    break;
                            }
                            if(action.uid){
                                set_data("cron", action.uid, _action).then(()=>{
                                    var _actions_array = actions_array.map((action_item)=>{
                                        if(action_item.uid == action.uid){
                                            action_item = _action
                                        }
                                        return(action_item)
                                    })
                                    console.log(_action.date)
                                    set_action(null)
                                    set_actions_array(_actions_array)
                                    props.onUpdate?.(_action);
                                })
                            }else{
                                add_data("cron",_action).then((uid)=>{
                                    _action.uid = uid
                                    var _actions_array = [...actions_array]
                                    _actions_array.push(_action)
                                    set_action(null)
                                    set_actions_array(_actions_array)
                                    props.onSave?.();
                                })
                            }
                        }}
                    />}
                </div>
            }
        >
            {action && <div className="p-fluid grid formgrid gap-2">
                <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>Nome</h5>
                    <InputText
                        value={action.name} 
                        onChange={(event)=>{
                            edit_action("name",event.target.value)
                        }}
                    />
                </div>
                {/* <div className="flex flex-grow-1 field sm:col-12 md:col-4 lg:col-8">
                    <h5 style={{color:"var(--text-c)"}}>Descrição</h5>
                    <InputText
                        value={action.info} 
                        onChange={(event)=>{
                            edit_action("info",event.target.value)
                        }}
                    />
                </div> */}

                <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
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
                <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>Regra</h5>
                    <Rule
                        uid={action.script}
                        editable={true}
                        onClear={()=>{
                            // console.log("cleared script")
                            edit_action("script","")
                        }}
                        onSuccess={(uid)=>{
                            // console.log("loaded script")
                            edit_action("script",uid)
                        }}
                    />
                </div>
                {action.exec == 1 && <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    
                    <h5 style={{color:"var(--text-c)", whiteSpace:"nowrap"}}>{week_label}</h5>
                    <MultiSelect
                        style={{width:"100%"}}
                        panelHeaderTemplate={<></>}
                        showSelectAll={false}
                        value={action.weekdays.sort()}
                        options={weekdays}
                        onChange={(e) => {
                            if(e.value.length != weekdays.length){
                                edit_action("weekdays",e.value)
                            }else{
                                edit_action("exec",0)
                            }
                        }}
                        optionLabel="name"
                        selectedItemTemplate={(item)=>{
                            let day = weekdays.find((day)=> day.value == item)
                            const selected = action.weekdays.sort()
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

                {action.exec == 4 && <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
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
                            // const time_date = Timestamp.fromDate(e.value)
                            // console.log(time_date)
                            edit_action("date",e.value)
                        }}
                    />
                </div>}
                
                {action.exec == 3 && <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
                    <h5 style={{color:"var(--text-c)"}}>Mês</h5>
                    <MultiSelect
                        panelHeaderTemplate={<></>}
                        showSelectAll={false}
                        value={action.months}
                        options={months}
                        onChange={(e) =>{
                            console.log(e.value)
                            edit_action("months",e.value)
                        }}
                        optionLabel="name"
                        selectedItemTemplate={(item)=>{
                            let month = months.find((month)=> month.value == item)
                            if(!month)return("")
                            return(month.label + " ")
                        }}
                        placeholder="Selecione"
                        // display="chip"
                    />
                </div>}

                {(action.exec == 2 || action.exec == 3) && <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
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

                {action.exec != 5 && action.exec != 4 && <div className=" flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
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
                
                
                {action.exec == 4 && <div className="flex-grow-1 field sm:col-12 md:col-3 lg:col-4">
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