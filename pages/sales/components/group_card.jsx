import React from "react";
import { Button } from 'primereact/button';
import { ProgressSpinner } from "primereact/progressspinner";

export default class GroupCard extends React.Component {
    constructor(props){
        super(props)
        this.state={loading:false}
    }
    render(){
        return(<>
            <Button 
                style={{
                    margin:"0px",
                    border:"0px",
                    background:"var(--primary-c)",
                    padding:"0px",
                    borderRadius:"20px"
                }}
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
                    if(this.state.loading == false){
                        this.setState({loading:true})
                        console.log("load group "+this.props.group.nome)
                        this.props.load_products_group(this.props.group.id.toString(),
                        (local_loaded_data)=>{
                            this.props.searchGroup(local_loaded_data)
                        }).then((cloud_loaded_data)=>{
                            this.props.searchGroup(cloud_loaded_data)
                        })
                    }
                }}>
                <img height={window.innerWidth*0.9 > 300?300:window.innerWidth*0.9} 
                    src={`images/grupos/${this.props.group.id}.jpg`}>
                </img>

                {this.state.loading && <div style={{
                    position:"absolute",
                    backgroundColor:"var(--glass-c)",
                    width:"100%",
                    height:"100%",
                }}>
                    <ProgressSpinner style={{
                    
                    // left:"50%",
                    top:"100px",
                    // transform:"Translate(-50%,-50%)"
                }}/>
                </div>}
            </Button>
            {/* <div style={{width:"300px", marginTop:"12px",color:"var(--text)"}}>
                <h6 style={{textAlign:"center"}}>{this.props.group.nome}</h6>

            </div> */}
        </>)
    }
}