import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { set_data } from "../../api/firebase";
import { useSales } from "../../contexts/context_sales";
import Rule from "../../contexts/rule_icon";

export default function ActionsPage(){
    const {actions, update_action, load_actions} = useSales()
    const [actions_array, set_actions_array] = useState([])
    
    useEffect(()=>{
        load_actions()
    },[])

    useEffect(()=>{
        console.log(actions)
        set_actions_array(Object.keys(actions).map((action)=>{
            return({
                ...actions[action],
                code:action,
            })
        }))
    },[actions])

    const on_rule_edit = (event) => {
        // console.log(event)
        let _actions_array = [...actions_array];
        let { newData, index } = event;
        index = _actions_array.findIndex((action)=>action.code == newData.code)
        // console.log(index)
        // writeRealtimeData("users/"+newData.uid+"/",newData)
        update_action(newData)
        console.log(newData.code)
        
        _actions_array[index] = newData;

        set_actions_array(_actions_array);
    }
    
    const inline_text_editor = (options) => {
        // console.log(options)
        return (
            <div className="flex-grow-1">
                <InputText
                    suffix=" %"
                    style={{width:"100%"}}
                    value={options.value}
                    onChange={(e) => options.editorCallback(e.target.value)}
                />
            </div>
        );
    }

    return(<div>

        {actions &&
            <DataTable
                editMode="row"
                onRowEditComplete={on_rule_edit}
                value={actions_array}>
                <Column field="code" header="Código" />
                <Column field="script" header="Regra"
                    body={(row_data)=>{
                        return(<Rule key={row_data.code} uid={row_data.script}/>)
                    }}
                    editor={(options) => inline_text_editor(options)}
                />
                <Column field="name" header="Ação" editor={(options) => inline_text_editor(options)}/>
                <Column field="info" header="Descrição" alignHeader={'center'}  style={{textAlign:"right"}} editor={(options) => inline_text_editor(options)}/>
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
            </DataTable>
        }
    </div>)
}