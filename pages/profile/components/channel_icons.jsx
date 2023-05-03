import React from "react";
import { confirmPopup } from 'primereact/confirmpopup';
import { Button } from 'primereact/button';
import { format_mask } from "../../utils/util";

export default class ChannelIcons extends React.Component{
    constructor(props){
        super(props)
        this.original={
            selectedChannel:"",
            step_index:1,
            all_channels:false
        }
        this.state={ ...this.original }
        
        this.accept = this.accept.bind(this);
        this.reject = this.reject.bind(this);
        this.confirmDialog = this.confirmDialog.bind(this);

        
        this.contact_channels = [
            {
                label:"Whatsapp",
                value:"WHATS",
                icon:"pi pi-whatsapp",
                color:"var(--green-500)",
                condition:()=>{
                    return(!(!this.props.client.telefone || (this.props.client.telefone.length != 9 &&
                        this.props.client.telefone.length != 11)))
                },
                command:()=>{
                    var phone = this.props.client.telefone
                    if(phone?.length == 9){
                        phone = "11"+phone
                    }
                    window.open('https://wa.me/55'+phone);
                },
                return:()=>{
                    return(format_mask(this.props.client.telefone,"(0##) #####-####"))
                }
            },
            {
                label:"Telefone",
                value:"CALL",
                icon:"pi pi-phone",
                color:"var(--orange-500)",
                condition:()=>{
                    return( this.props.client.telefone && this.props.client.telefone.length >= 8)
                },
                command:()=>{
                    var phone = this.props.client.telefone
                    if(phone?.length == 9){
                        phone = "11"+phone
                    }
                    window.open('tel:+55'+phone, '_self')
                },
                return:()=>{
                    var phone = this.props.client.telefone
                    if(phone?.length == 9){
                        phone = "11"+phone
                    }
                    return(format_mask(phone,"(0##) ####-####"))
                }
                
            },
            {
                label:"Email",
                value:"EMAIL",
                icon:"pi pi-envelope",
                color:"var(--red-400)",
                condition:()=>{
                    if(!this.props.client.email || this.props.client.email == "---" || this.props.client.email == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
                command:()=>{
                    console.log(this.props.client.email);
                    const html = `
                        <html>
                            <head>
                                <style>
                                    h1 {
                                        color: red;
                                    }
                                    p {
                                        font-size: 18px;
                                    }
                                </style>
                            </head>
                            <body>
                                <h1>Hello World</h1>
                                <p>This is a test email with an HTML body.</p>
                            </body>
                        </html>
                    `;
                    const encodedHtml = encodeURIComponent(html);
                    const emailLink = `mailto:${this.props.client.email}?subject=Chamado%20de%20${this.props.user.name}&body=${encodedHtml}`;
                
                    window.open(emailLink);
                }
                ,
                return:()=>{
                    return(this.props.client.email)
                }
            },
            {
                label:"Mensagem",
                value:"APP",
                icon:"pi pi-comments",
                color:"var(--primary-c)",
                condition:()=>{
                    if(!this.props.client.app_uid || this.props.client.client_uid == "---" || this.props.client.client_uid == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
                return:()=>{
                    return(this.props.client.app_uid)
                }
            },
            {
                label:"Facebook",
                value:"FACE",
                icon:"pi pi-facebook",
                color:"var(--blue-700)",
                condition:()=>{
                    if(!this.props.client.facebook || this.props.client.facebook == "---" || this.props.client.facebook == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
                return:()=>{
                    return(this.props.client.facebook)
                }
            },
            {
                label:"Instagram",
                value:"INSTA",
                icon:"pi pi-instagram",
                color:"var(--pink-400)",
                condition:()=>{
                    if(!this.props.client.instagram || this.props.client.instagram == "---" || this.props.client.instagram == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
                return:()=>{
                    return(this.props.client.instagram)
                }
            },
            {
                label:"Visita",
                value:"LOCAL",
                icon:"pi pi-map-marker",
                color:"var(--teal-500)",
                condition:()=>{
                    if(!this.props.client.rua || this.props.client.rua == "---" || this.props.client.rua == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
                return:()=>{
                    return(this.props.client.rua)
                }
            },
            {
                label:"Site Cliente",
                value:"WEB",
                icon:"pi pi-globe",
                color:"var(--indigo-500)",
                condition:()=>{
                    if(!this.props.client.site || this.props.client.site == "---" || this.props.client.site == null){
                        return(false)
                    }else{
                        return(true)
                    }
                },
                return:()=>{
                    return(this.props.client.site)
                }
            }
        ]
    }
    
    accept() {
        // this.toast.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
    }

    reject() {
        // this.toast.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    }

    confirmDialog(event,button) {
        // console.log(event)
        confirmPopup({
            target: event.currentTarget,
            message: "Abrir chamado via "+ button.label.toLowerCase() +": "+button.return(),
            icon: button.icon,
            accept: button.command,
            reject: this.reject
        });
    }

    contact_button(button,index){
        const condition = button.condition?.()
        const active_channel = (condition == false && this.state.all_channels == true)
        if(condition == false && this.state.all_channels == false){ return(<></>)}
        return(
            <div key={index}
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

    contact_dot(button,index){
        const condition = button.condition?.()
        const active_channel = condition == false && this.state.all_channels == true
        if(condition == false && this.state.all_channels == false){ return(<span key={"dot_"+index} style={{display:"none"}}/>)}
        return(
            <div key={"dot_"+index}>
                
                <div className=" contact-button cursor-pointer"
                    // data-pr-tooltip="No notifications"
                    // data-pr-position="left"
                    // data-pr-at="left+5 top"
                    // data-pr-my="left center-2"
                    onClick={(e)=>{this.confirmDialog(e,button)}}
                    style={{
                        borderRadius:"50%",
                        width:"20px",
                        height:"20px",
                        color:"white",
                        // border:"2px solid white",
                        backgroundColor:button.color,
                    }}
                />
            </div>
        )
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
    //     console.log(this.props.client)
    // }
    
    render(){
        if(this.props.small != false) return(
            <>
                {/* <Toast ref={(el) => this.toast = el} /> */}
                <div className="flex w-full h-full gap-2 justify-content-end">
                    {this.contact_channels.map((button,i)=>{
                        return(this.contact_dot(button,i))
                    })}
                </div>
            </>
        )
        return(
            <div>
                <div id="contact_scroll" className="flex flex-wrap justify-content-center">
                    {this.contact_channels.map((button,i)=>{
                        return(this.contact_button(button,i))
                    })}
                </div>
            </div>
        )
    }
}