import React from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from "primereact/inputtext";
import { isDeepEqual, normalize, print } from "../../utils/util";
import { SelectButton } from 'primereact/selectbutton';
import SpeechToText from "../../components/speech_to_text";
import UserSearch from "./user_search";
import WeekdaySearch from "../../components/next_weekdays_dropdown";
import { z } from "zod";

export default class CallDialog extends React.Component{
    constructor(props){
        super(props)
        this.original={
            selectedDelete:0,
            made_contact:false,
            got_problem:false,
            selectedChannel:"",
            help_user:null,
            call_return_date:null,
            problem_type:"",
            call_description:"",
            help_description:"",
            step_index:1,
            all_channels:false,
            remove_description:'',
            remove_reason:'',
            issues:[]
        }
        this.state={ ...this.original }
        
        // validador de formulário ZOD
        this.fileName = z.preprocess((val) => {
            try { return eval(val) } catch (error) { return val }
            }, z.string({
                required_error:"Nome é obrigatório",
                invalid_type_error:"Nome deve ser texto"
            }).min(3,{message:"Nome deve ter no mínimo 3 caracteres"})
        );
        
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
        this.send_call = this.send_call.bind(this)

    }

    // update(options={state:this.state, key:null,value:null},callback=()=>{}){
    //     var _state = (options.key && options.value)?{[options.key]:options.value}:this.state
    //     this.setState({...this.state, ..._state},callback)
    // }
    
    // componentDidUpdate(){
    //     this.props.onUpdate?.(this.state)
    // }

    contact_button(button,index){
        const condition = button.condition?.()
        const active_channel = condition == false && this.state.all_channels == true
        if(condition == false && this.state.all_channels == false){ return(<span key={button.label+"_"+index}/>)}
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
    // testForm(){
    //     if(isDeepEqual(this.original,this.state) ||
    //         this.state.help_user==null ||
    //         this.state.selectedDate==null ) return true

    //     if(this.state.made_contact && 
    //         this.state.selectedChannel == "") return true

    //     if(this.state.got_problem && 
    //         this.state.problem_type == "") return true
    // }

    

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

    testForm(key,label){
        const result = z.object({
            [key]: z.string({
                required_error: label + " é um campo obrigatório",
                invalid_type_error: label + " deve ser texto"
            }).min(20,{
                message:"Descrição deve ter no mínimo 20 caracteres"
            })
        }).safeParse(this.state);
        print(result)
        // if (!result.success) {}
        this.setState({issues:!result.success?result.error.issues:[]})
    }

    send_call(){
        this.setState({...this.original})
        this.props.onSend?.(this.state)
    }

    call_window(){
        const footer_button = "flex w-auto p-4 h-full bg pt-1 pb-1 m-0 pl-2 pr-2 p-button-text shadow-none p-button-lg p-button-rounded "
        
        
        
        
        
        return(<div className="flex grid flex-wrap w-auto h-full p-3">
            <div style={{height:"70px"}} className="col-12 flex w-full flex-grow-1">
                <div className="flex flex-grow-1 w-full h-full align-items-start">
                    {this.state.selectedChannel != "" &&
                        this.contact_icon()
                    }
                    <h3 className="text-bluegray-300">{this.step_items[this.state.step_index].label}</h3>
                    
                </div>
                {/* <label style={{ textAlign:"right", position:"absolute",top:"55px", right:"20px", width:"300px"}}>{this.props.client.fantasia}</label> */}
            </div>
            
            {this.state.step_index == 0 &&
                <div className="flex flex-wrap p-fluid grid formgrid h-min">
                    <div className="flex-grow-1 justify-content-center">
                    
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
                                <InputText value={this.state.remove_reason} onChange={(e)=>this.setState({remove_reason:e.target.value})} className="flex w-full"/>
                                
                            </div>
                        }
                        {(()=>{
                            const zod_issue = this.state.issues.find((i)=>i.path[0] == 'remove_description')
                            return( <div className="flex flex-wrap m-0 w-full h-min">
                                <label>Comentário</label>
                                {/* <InputTextarea
                                    style={{minHeight:"50px"}}
                                    disabled={this.state.selectedDelete == 0}
                                    className="flex w-full"
                                /> */}
                                <SpeechToText
                                    className={zod_issue?'p-invalid':''}
                                    onChange={(text)=>{
                                        this.setState({remove_description:text})
                                    }}
                                    onBlur={()=>{
                                        if(normalize(this.state.remove_description) != '') this.testForm('remove_description','Comentário')
                                    }}
                                    uid={this.props.client.id+ '_call_remove'}
                                />
                                <span className="p-error text-sm">{zod_issue?.message}</span>
                            </div>)
                        })()}
                        
                    </div>
                    <div className="mb-4 flex w-full justify-content-center align-items-center mt-2">
                        <Button label="Voltar"
                            className={footer_button + "p-button-secondary"}
                            icon="pi pi-chevron-left"
                            onClick={(e)=>{
                                this.setState({step_index:1,selectedDelete:0})
                            }}
                        />

                        <Button label="Remover"
                            className={footer_button + "p-button-danger"}
                            icon="pi pi-trash"
                            iconPos="right"
                            onClick={(e)=>{
                                this.testForm('remove_description','Comentário')
                                // const result = z.string({
                                //     required_error:"Descrição é obrigatória",
                                //     invalid_type_error:"Descrição deve ser texto"
                                // }).min(20,{
                                //     message:"Descrição deve ter no mínimo 20 caracteres"
                                // }).safeParse(this.state.remove_description);

                                // if (!result.success) {
                                //     print(result.error.issues[0].message,'error');
                                // }else{
                                //     print(result.data)
                                //     this.setState({step_index:1})
                                // }

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
            {this.state.step_index == 2 && <div className="flex-grow-1 justify-content-center">
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
                        <WeekdaySearch
                            maxDays={this.state.made_contact==false?2:5}
                            onChange={(e)=>{
                                this.setState({call_return_date:e})
                            }}
                        />
                        
                        <div className=" mt-3">
                            <label>Descreva como foi</label>
                            <SpeechToText
                                uid={this.props.client.id+ '_call_description'}
                                onChange={(text)=>{
                                    this.setState({call_description:text})
                                }}
                            />
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
                            <UserSearch
                                hideUser={true}
                                disabled={this.state.got_problem==false}
                                all_users={this.props.all_users}
                                currentUser={this.props.user}
                                onChange={(e)=>{
                                    this.setState({help_user:{name:e.name, uid:e.uid}})
                                    // console.log(e)
                                }}
                            />
                        </div>
                        <div className=" mt-3">
                            <label style={{color:this.state.got_problem==false?"var(--text-b)":""}}>Descreva a necessidade</label>
                            <SpeechToText
                                uid={this.props.client.id+ '_call_help'}
                                disabled={this.state.got_problem==false}
                                onChange={(text)=>{
                                    this.setState({help_description:text})
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>}
            {this.state.step_index == 3 && <div className="flex p-fluid grid formgrid">
                <div className="flex col-6 flex-grow-1">
                    <pre className='text-white max-w-30rem text-overflow-ellipsis overflow-hidden'>
                        {JSON.stringify(this.state,null,2)}
                    </pre>

                </div>
            </div>
            }
            {this.state.step_index > 1 && <div className="flex flex-grow-1 justify-content-center w-full col-12">
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
                        this.props.onUpdate?.(this.state)
                    }}
                />}

                {this.state.step_index == this.step_items.length -1 && <Button label="Enviar"
                    className={footer_button +"p-button-success"}
                    icon="pi pi-send"
                    iconPos="right"
                    onClick={this.send_call}
                />}

            </div>}

        </div>)
    }
    render(){
        return (<div className="flex w-full h-full justify-content-center align-items-center">
            {this.call_window()}
        </div>)
        if(this.props?.fullScreen == true){
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