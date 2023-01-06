import { withRouter } from 'next/router'
import React from "react";
import Swal from "sweetalert2";
import { get_rule } from "../api/firebase";
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { var_set } from "../utils/util";
import { runCode } from '../admin/components/rules';
import { InputText } from 'primereact/inputtext';


export default withRouter(class Rule extends React.Component{
    constructor(props){
        super(props)
        this.state={
            rule_doc:null,
            edit:false,
            uid:""
        }
        
    }
    componentDidMount(){
        if(this.props.uid){
            get_rule(this.props.uid).then((doc)=>{
                if(doc){
                    const doc_data = doc.data()
                    this.setState({rule_doc:doc_data})
                }       
            })
        }else{
            this.setState({edit:true})
        }
        this.items = [
            {
                label: 'Ações',
                items: [
                    {
                        label: 'Executar Teste',
                        icon: 'pi pi-play',
                        command: () => {
                            var code = this.state.rule_doc.code
                            runCode(code)
                        }
                    },
                    {
                        label: 'Abrir Regra',
                        icon: 'pi pi-pencil',
                        command: () => {
                            var_set("workspace_saved",JSON.stringify(this.state.rule_doc),false)
                            var_set("workspace",this.state.rule_doc.workspace,false)
                            // this.props.go_to("Regras")
                            this.props.router.push("#rules")
                            // this.toast.show({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
                        }
                    }
                ]
            }
        ];
        if(this.props.editable){
            this.items[0].items.push(
                {
                    label: 'Limpar',
                    icon: 'pi pi-times',
                    command: () => {
                        this.setState({
                            rule_doc:null,
                            edit:true,
                            uid:""
                        })
                    }
                }
            )
        }
    }
    render(){
        if(this.state.rule_doc == null){
            if(this.state.edit)return(
                <div className="p-inputgroup">
                    <InputText
                        value={this.state.uid}
                        onChange={(event)=>{
                            this.setState({uid:event.target.value})
                        }}
                    />
                    <Button
                        icon="pi pi-check"
                        className='p-button-success p-button-outlined'
                        disabled={this.state.uid.length != 20}
                        onClick={(event)=>{
                            get_rule(this.state.uid).then((doc)=>{
                                if(doc){
                                    const doc_data = doc.data()
                                    this.setState({
                                        rule_doc:doc_data,
                                        edit:false
                                    })
                                }       
                            })
                        }}
                    />
                </div>)
            return(<><Skeleton width="10rem" height="2rem" className="mb-2" borderRadius="16px"></Skeleton></>)
        }
        return(<div className={this.props.pointer?'shadow-3':""}
        style={this.props.pointer?{
            backgroundColor:"white",
            borderRadius:"2px 50% 50% 50%",
            padding:"2px"
        }:{}}>
            <Toast ref={(el) => { this.toast = el; }}></Toast>
            <Menu model={this.items} popup ref={el => this.menu = el} id="popup_menu" />
            <Button
                icon="pi pi-bars"
                label={this.state.rule_doc.name}
                tooltipOptions={{position:this.props.tooltip || "left"}}
                className="p-button-rounded p-button-outlined p-button-success"
                onClick={(event) => this.menu.toggle(event)}
                
            />
        </div>)
    }
})