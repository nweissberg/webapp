import React from "react";
import { Dropdown } from 'primereact/dropdown';
import { ToggleButton } from 'primereact/togglebutton';
import { Button } from "primereact/button";
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { isDeepEqual } from "../../utils/util";
import { Editor } from 'primereact/editor';
import ReactDOM from 'react-dom';
import { Steps } from 'primereact/steps';
import { SelectButton } from 'primereact/selectbutton';
import SpeechToText from "../../components/speech_to_text";
import UserSearch from "./user_search";

export default class CallDialog extends React.Component{
    constructor(props){
        super(props)
        this.original={
            selectedDelete:0,
            made_contact:false,
            got_problem:false,
            selectedChannel:"",
            selectedUser:null,
            selectedDate:null,
            problem_type:"",
            description:"",
            step_index:1,
            all_channels:false
        }
        this.state={ ...this.original }
        
        this.deleteOptions = [
            {name: 'Empresa Fechou', value: 1},
            {name: 'Telefone Incorreto', value: 2},
            {name: 'Outro', value: 3}
        ];

        this.select_options = [
            {name: 'Não', value: false},
            {name: 'Sim', value: true},
        ];

        this.step_items = [
            {
                label: 'Cancelar Cliente ',
                command: (event) => {}
            },
            {
                label: 'Canais de Comunicação ',
                command: (event) => {}
            },
            {
                label: 'Informações do Chamado',
                command: (event) => {}
            },
            {
                label: 'Finalizar Atendimento',
                command: (event) => {}
            }
        ];
        
        this.contact_channels = [
            {
                label:"Whatsapp",
                value:"WHATS",
                icon:"pi pi-whatsapp",
                color:"var(--green-500)",
                condition:()=>{
                    return(!(!this.props.client?.telefone || (this.props.client.telefone.length != 9 &&
                        this.props.client.telefone.length != 11)))
                },
                command:()=>{
                    var phone = this.props.client.telefone
                    if(phone?.length == 9){
                        phone = "11"+phone
                    }
                    window.open('https://wa.me/55'+phone);
                
                }
            },
            {
                label:"Telefone",
                value:"CALL",
                icon:"pi pi-phone",
                color:"var(--orange-500)",
                condition:()=>{
                    return( this.props.client?.telefone && this.props.client.telefone.length >= 8)
                },
                command:()=>{
                    var phone = this.props.client?.telefone
                    if(phone?.length == 9){
                        phone = "11"+phone
                    }
                    window.open('tel:+55'+phone, '_self')
                }
                
            },
            {
                label:"Email",
                value:"EMAIL",
                icon:"pi pi-envelope",
                color:"var(--red-400)",
                condition:()=>{
                    if(!this.props.client?.email || this.props.client?.email == "---" || this.props.client?.email == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
                command:()=>{
                    console.log(this.props.client?.email)
                    const html = "<h1>Hello World</h1><p>This is a test email with an HTML body.</p>";
                    const encodedHtml = html.replace(/</g, "%3C").replace(/>/g, "%3E");
                    console.log(this.props.user)
                    const emailLink = `mailto:${this.props.client?.email}?subject=Chamado%20de%20${this.props.user.name}&body=${encodedHtml}`;

                    window.open(emailLink);
                    // window.open('mailto:'+this.props.client.email+'?subject=Chamado de '+this.props.user.name+'&body=<h4>TESTE</h4>mensagem','_self').focus();
                
                }
            },
            {
                label:"Mensagem",
                value:"APP",
                icon:"pi pi-comments",
                color:"var(--primary-c)",
                condition:()=>{
                    if(!this.props.client || !this.props.client.app_uid || this.props.client.client_uid == "---" || this.props.client.client_uid == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
            },
            {
                label:"Facebook",
                value:"FACE",
                icon:"pi pi-facebook",
                color:"var(--blue-700)",
                condition:()=>{
                    if(!this.props.client || !this.props.client.facebook || this.props.client.facebook == "---" || this.props.client.facebook == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
            },
            {
                label:"Instagram",
                value:"INSTA",
                icon:"pi pi-instagram",
                color:"var(--pink-400)",
                condition:()=>{
                    if(!this.props.client || !this.props.client.instagram || this.props.client.instagram == "---" || this.props.client.instagram == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
            },
            {
                label:"Visita",
                value:"LOCAL",
                icon:"pi pi-map-marker",
                color:"var(--teal-500)",
                condition:()=>{
                    if(!this.props.client || !this.props.client.rua || this.props.client.rua == "---" || this.props.client.rua == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
            },
            {
                label:"Site Cliente",
                value:"WEB",
                icon:"pi pi-globe",
                color:"var(--indigo-500)",
                condition:()=>{
                    if(!this.props.client || !this.props.client.site || this.props.client.site == "---" || this.props.client.site == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
            }
        ]
    }
    
    contact_button(button,index){
        const condition = button.condition?.()
        const active_channel = condition == false && this.state.all_channels == true
        if(condition == false && this.state.all_channels == false){ return(<></>)}
        return(
            <div key={button.label+"_"+index}
                style={{width:"100px"}}
                className="mb-4 flex flex-column align-items-center">
                <Button
                    icon={button.icon}
                    className="contact-button p-button-rounded p-button-lg p-button-outlined mb-2"
                    style={{
                        width:"50px",
                        height:"50px",
                        color:"white",
                        border:"3px solid white",
                        backgroundColor:button.color,
                        filter:active_channel? "brightness(0.5) contrast(0.8)":"brightness(1) contrast(1)"
                    }}
                    tooltip={active_channel?"+ "+button.label:""}
                    tooltipOptions={
                        {
                            fontSize:"8rem",
                            position:"top"
                        }
                    }
                    onClick={(e)=>{
                        if(!active_channel){
                            button.command?.();
                            this.setState({step_index:2, selectedChannel:button.value})
                        }else{

                        }
                    }}
                />
                <label style={{whiteSpace:"nowrap"}}>{button.label}</label>
            </div>
        )
    }
    testForm(){
        if(isDeepEqual(this.original,this.state) ||
            this.state.selectedUser==null ||
            this.state.selectedDate==null ) return true

        if(this.state.made_contact && 
            this.state.selectedChannel == "") return true

        if(this.state.got_problem && 
            this.state.problem_type == "") return true
    }

    contact_icon(){
        const contact_data = this.contact_channels.find((i)=>i.value == this.state.selectedChannel)
        return(<i className={contact_data.icon}
        style={{
            color:contact_data.color,
            padding:"5px",
            marginRight:"10px",
            fontSize:"25px"
        }}
    />)
    }
    // componentDidMount(){
    //     console.log(this.props.all_users)
    // }
    call_window(){
        const footer_button = "flex w-full h-full bg pt-1 pb-1 m-0 pl-2 pr-2 p-button-outlined p-button-lg p-button-rounded "
        return(<div className="call-dialog w-full h-full">
            <div style={{height:"70px"}} className="flex flex-column m-3 mb-6 justify-content-between">
                <div className="flex h-full align-items-start">
                    {this.state.selectedChannel != "" &&
                        this.contact_icon()
                    }
                    <h3 className="text-bluegray-300">{this.step_items[this.state.step_index].label}</h3>
                    
                </div>
                {/* <label style={{ textAlign:"right", position:"absolute",top:"55px", right:"20px", width:"300px"}}>{this.props.client.fantasia}</label> */}
            </div>
            
            {this.state.step_index == 0 &&
                <div className="flex-grow-1 justify-content-center">
                    <div className="m-4">
                        <label>Selecione</label>
                        <SelectButton
                            unselectable={false}
                            value={this.state.selectedDelete}
                            options={this.deleteOptions}
                            onChange={(e) => this.setState({ selectedDelete: e.value })}
                            optionLabel="name"
                        />
                        {this.state.selectedDelete == 3 &&
                            <div className="mt-2">
                                <label>Motivo</label>
                                <InputText className="flex w-full"/>
                                
                            </div>
                        }
                        
                        <div className="mt-2">
                            <label>Comentário</label>
                            {/* <InputTextarea
                                style={{minHeight:"50px"}}
                                disabled={this.state.selectedDelete == 0}
                                className="flex w-full"
                            /> */}
                            <SpeechToText />
                        </div>
                    </div>
                    <div className="m-4 gap-3 flex justify-content-center align-items-center">
                        <Button label="Voltar"
                            className="pt-1 pb-1 p-button-secondary p-button-outlined p-button-lg p-button-rounded "
                            icon="pi pi-chevron-left"
                            onClick={(e)=>{
                                this.setState({step_index:1,selectedDelete:0})
                            }}
                        />

                        <Button label="Remover"
                            className="pt-1 pb-1 p-button-danger p-button-outlined p-button-lg p-button-rounded "
                            icon="pi pi-trash"
                            iconPos="right"
                            onClick={(e)=>{
                                this.setState({step_index:1})
                            }}
                        />
                    </div>
                </div>
            }
            
            {this.state.step_index == 1 &&
                <div className="flex-grow-1 justify-content-center">
                    <div id="contact_scroll" className="flex flex-wrap justify-content-center">
                        {this.contact_channels.map((button,i)=>{
                            return(this.contact_button(button,i))
                        })}
                    </div>

                    <div className="mb-4 gap-3 flex justify-content-center align-items-center ">
                        <Button label="Excluir"
                            className={footer_button + "p-button-secondary"}
                            icon="pi pi-user-minus"
                            iconPos="right"
                            onClick={(e)=>{
                                this.setState({step_index:0})
                            }}
                        />
                    <Button label={!this.state.all_channels?"Adicionar":"Voltar"}
                        className={footer_button + (!this.state.all_channels?"":"p-button-warning")}
                        icon={!this.state.all_channels?"pi pi-plus":"pi pi-times"}
                        iconPos="right"
                        onClick={(e)=>{
                            this.setState({all_channels:!this.state.all_channels})
                        }}
                    />
                    </div>
                </div>
            }
            {this.state.step_index == 2 && <div>
                <div className="flex p-fluid grid formgrid">
                    <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-3">
                        <label>Consegui Contato?</label>
                        <SelectButton
                            unselectable={false}
                            value={this.state.made_contact}
                            options={this.select_options}
                            onChange={(e) => this.setState({ made_contact: e.value })}
                            optionLabel="name"
                        />

                        <label className="mt-3">Data de Retorno</label>
                        <Calendar
                            locale="pt"
                            value={this.state.selectedDate}
                            onChange={(e) => this.setState({ selectedDate: e.value })}
                            showTime
                            // style={{width:"200px"}}
                            touchUI
                            // inline
                            showButtonBar 
                            minDate={new Date()}
                            maxDate={new Date(Date.now() + 1000*60*60*24*5)}
                        />

                        <div className=" mt-3">
                            <label>Descreva como foi</label>
                            <SpeechToText />
                        </div>
                    </div>

                    <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-3">
                        <label>Precisa de algum tipo de suporte?</label>
                        <SelectButton
                            unselectable={false}
                            value={this.state.got_problem}
                            options={this.select_options}
                            onChange={(e) => this.setState({ got_problem: e.value })}
                            optionLabel="name"
                        />
                        <div className=" mt-3">
                            <label style={{color:this.state.got_problem==false?"var(--text-b)":""}} className="mb-2">Quem pode ajudar?</label>
                            <UserSearch hideUser={true} disabled={this.state.got_problem==false} all_users={this.props.all_users} currentUser={this.props.user} />
                        </div>
                        <div className=" mt-3">
                            <label style={{color:this.state.got_problem==false?"var(--text-b)":""}}>Descreva a necessidade</label>
                            <SpeechToText disabled={this.state.got_problem==false} />
                        </div>
                    </div>
                </div>
            </div>}
            

            {this.state.step_index > 1 && <div className="mt-4 gap-3 flex justify-content-center align-items-center">
                {this.state.step_index == 2 && <Button label="Cancelar"
                    className={footer_button + "p-button-warning"}
                    icon="pi pi-times"
                    onClick={(e)=>{
                        this.setState({...this.original})
                    }}
                />}
                {this.state.step_index > 2 && <Button label="Voltar"
                    className={footer_button + "p-button-secondary"}
                    icon="pi pi-chevron-left"
                    onClick={(e)=>{
                        this.setState({step_index:this.state.step_index-1})
                    }}
                />}

                {this.state.step_index < this.step_items.length -1 && <Button label="Avançar"
                    className={footer_button}
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    onClick={(e)=>{
                        this.setState({step_index:this.state.step_index+1})
                    }}
                />}

                {this.state.step_index == this.step_items.length -1 && <Button label="Enviar"
                    className={footer_button +"p-button-success"}
                    icon="pi pi-send"
                    iconPos="right"
                    onClick={(e)=>{
                        this.setState({...this.original})
                    }}
                />}

            </div>}

        </div>)
    }
    render(){
        if(this.props?.fullScreen == true){
            return(this.call_window())
        }
        return(
            <div>
                <OverlayPanel
                    ref={(el) => this.op = el}
                    id="overlay_panel"
                    visible={ this.props.show }
                    onHide={()=>{
                        this.props?.onHide?.()
                    }}
                    className="flex p-0"
                    appendTo={this.props.overlay_panel}
                >
                    {this.call_window()}
                </OverlayPanel>
                <div className="flex">
                    <Button
                        ref={(el) => this.button = el}
                        icon="pi pi-phone"
                        className="p-button-outlined p-button-rounded p-button-success"
                        label='Abrir'
                        onClick={(e) => {
                            this.op.toggle(e)
                            // console.log(rowData)
                            // scrollToTop()
                            // set_call_dialog(true)
                        }}
                    />
                    {isDeepEqual(this.original,this.state) == false && <div
                        style={{
                            paddingLeft:"6px",
                            
                            transform:"Translate(-5px,-5px)",
                            position:"absolute",
                            backgroundColor:"var(--info)",
                            width:"20px",
                            height:"20px",
                            borderRadius:"50%"
                        }} ><span className="m-0 p-0" style={{color:"var(--text-a)",position:"absolute",transform:"TranslateY(-2px)"}}>{this.state.step_index-1}</span></div>
                    }
                </div>
            </div>
            
        )
    }
}