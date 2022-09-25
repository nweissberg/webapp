import React from "react";
import { Button } from 'primereact/button';
import { moneyMask } from "../../utils/util";
import JsBarcode from "jsbarcode";

export default class ProductSidebar extends React.Component{
    constructor(props){
        super(props)
        
        this.state = {}

        this.info_keys = {
            "pid":{
                label:"Material ID"
            },
            "Categoria":{
                label:"Categoria"
            },
            "price":{
                label:"Preço Tabela",
                sufix:( item => item.abreviatura.toLowerCase() ),
                return:( text => moneyMask(text) )
            },
            "Marca":{
                label:"Marca"
            },
            "SALDO_PRODUTOS":{
                label:"Estoque"
            },
            "GR":{
                label:"Gramatura",
                sufix:"g/m²"
            },
            "LARG":{
                label:"Largura",
                sufix:"cm"
            },
            "COMP":{
                label:"Comprimento",
                sufix:"cm"
            },
            "ncm":{
                label:"Código Produto NCM"
            }
        }
    }
    makeBarcode(){
        if(this.props.item != null && this.props.item.codigo_barras != ""){
            try{
                JsBarcode("#barcode", this.props.item.codigo_barras,{ format: "EAN13" });
            }
            catch(e){
                console.error(e)
            }
        }
    }
    componentDidMount(){
        this.makeBarcode()
    }
    componentDidUpdate(){
        this.makeBarcode()
    }
    render(){
        if(!this.props.item)return(<></>)
        return(
            <div className="flex flex-wrap justify-content-center"
            style={{
                position:"absolute",
                background:"var(--glass-c)",
                backdropFilter: "blur(10px)",
                color:"var(--text)",
                width:"30%",
                right:"0px",
                overflow:"scroll",
                height:window.innerWidth>960?"calc(100vh - 110px)":"100vh",
                padding:"10px",
                ...this.props?.style
            }}>
            <div style={{width:"100%", position:"sticky", top:"0px"}}>
                <Button className="p-button-rounded"
                    // style={{width:"100%"}}
                    // label="Fechar"
                    icon="pi pi-times"
                    // iconPos="right"
                    onClick={(event)=>{
                        this.props.onHide?.()
                    }}/>
            </div>
            <div style={{width:"100%"}}>
                <div style={{textAlign:"center", paddingBottom:"80px"}}>
                    {this.props.item.photo && <img alt="Product Photo"
                        src={this.props.item.photo.img?  this.props.item.photo.img: "images/sem_foto.jpg"}
                        onError={(e) => e.target.src='images/sem_foto.jpg'}
                        style={{
                            width:"100%",
                            maxWidth:"250px",
                            borderRadius:"10px",
                            marginBottom:"20px"
                        }}
                    />}
                    <div style={{marginBottom:"20px"}}>
                        <h4>{this.props.item.name}</h4>
                    </div>
                    <div style={{textAlign:"left"}}>

                        {Object.keys(this.info_keys).map((key)=>{
                            if(this.props.item[key] == "0") return(<></>)
                            return(
                            <div key={key}>
                                <label>{this.info_keys[key].label}</label>
                                <div style={{whiteSpace:"pre-wrap", display:"flex"}}>
                                    <h5>
                                        {
                                            this.info_keys[key].return
                                            ?
                                            this.info_keys[key].return(this.props.item[key])
                                            :
                                            this.props.item[key]
                                        }
                                    </h5>
                                    {this.info_keys[key].sufix && <span>{" "+ (typeof(this.info_keys[key].sufix) == 'function'?this.info_keys[key].sufix(this.props.item):this.info_keys[key].sufix) }</span>}
                                </div>
                            </div>
                            )
                        })}
                        
                        {this.props.item.codigo_barras != "" && <div style={{textAlign:"center", paddingTop:"10px"}}>
                            <img style={{borderRadius:"5px", width:"100%", maxWidth:"250px"}} id="barcode"/>
                        </div>}
                        <div className="show_on_mobile" style={{paddingBottom:"30px"}}></div>
                    </div>
                </div>
            </div>
        </div>
        )
    }
}