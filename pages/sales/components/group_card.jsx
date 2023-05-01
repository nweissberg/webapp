import React from "react";
import { Button } from 'primereact/button';
import { ProgressSpinner } from "primereact/progressspinner";
import { ProgressBar } from "primereact/progressbar";

export default class GroupCard extends React.Component {
    constructor(props){
        super(props)
        this.state={loading:false}
        this.card_ref = React.createRef()
    
    }
    gotoView(){
        this.card_ref.scrollIntoView({ behavior: "smooth", block: "center",inline:'center' });
    }

    render(){
        return(<div ref={(el)=>this.card_ref = el} className="">
            <Button 
                style={{
                    background:"var(--primary-c)",
                    padding:"0px",
                    borderRadius:"20px"
                }}
                className='flex relative z-2 w-10 h-auto sm:w-14rem sm:h-14rem md:w-20rem md:h-20rem  lg:w-25rem lg:h-25rem sm:w-10rem sm:h-10rem shadow-none border-none p-button-text'
                // label={this.props.group.state>0?"":this.props.group.nome}
                // icon={this.props.group.state==2?"pi pi-check":false}
                // className={this.props.group.state>=2?"p-button-outlined":"p-button"}
                // loading={this.props.group.state==1?true:false}
                // loadingIcon="pi pi-spin pi-spinner"
                disabled={this.props.group.state == 1 ? true : false}
                // tooltip={this.props.group.state > 0 ? this.props.group.nome:this.props.group.nome}
                // tooltipOptions={{
                //     position: 'bottom',
                //     // mouseTrack: true,
                //     // mouseTrackTop: 30
                // }}
                onClick={(event)=>{
                    this.gotoView()
                    if(this.state.loading == false){
                        this.setState({loading:true})
                        if(this.props.group.id == 0){
                            // A3dAr3UGEwh6f3QiojkJ
                            this.props.load_products_client(this.props.group.client.id)
                            .then((client_products)=>{
                                // console.log(client_products)
                                this.setState({loading:false})
                                this.props.searchGroup(client_products)
                            })
                            // console.log("Load client items",this.props.group.client)
                            return
                        }else{
                            // console.log("load group "+this.props.group.nome)
                            this.props.load_products_group(this.props.group.id.toString(),
                            (local_loaded_data)=>{
                                this.props.searchGroup(local_loaded_data)
                            }).then((cloud_loaded_data)=>{
                                this.props.searchGroup(cloud_loaded_data)
                            })

                        }
                    }
                }}>
                <img className="relative h-full w-full" 
                    src={`images/grupos/${this.props.group.id}.jpg`}>
                </img>

                {this.state.loading && <div className="flex w-full h-full bg-glass-a absolute z-2">
                    <ProgressBar mode='indeterminate' className="absolute z-2 flex w-full h-1rem bottom-0"/>
                </div>}
            </Button>
            {/* <div style={{width:"300px", marginTop:"12px",color:"var(--text)"}}>
                <h6 style={{textAlign:"center"}}>{this.props.group.nome}</h6>

            </div> */}
        </div>)
    }
}