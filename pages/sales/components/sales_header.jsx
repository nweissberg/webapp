import React from "react";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import SaleInfo from "./sale_info";
import BarcodeScanner from "./barcode_scanner";
import { scrollToBottom, scrollToTop } from "../../utils/util";
import { loadItemPhoto } from "../service/sales_service";
import HeaderTitle from "../../components/title";

export default class SalesHeader extends React.Component{
    constructor(props){
        super(props)
        this.state={
            show_sale_info:false,
            search:""
        }
    }
    header_button = {
        color:"var(--text)",
        background:"var(--glass)",
        border:"0px",
        minWidth:"40px",
        height:"42px"
    }
    set_search(search_text){
        this.setState({search:search_text})
    }
    componentDidMount(){
        this.props.onLoad?.(this)
    }
    render(){
        return(
            <div style={{
                paddingTop:"4px",
                paddingInline:"10px",
                width:"100%",
                height:"51px",
                position:"absolute",
                top:"0px",
                backdropFilter: "blur(10px)",
                background:"var(--glass-c)",
                zIndex:4
            }}>
                <div className="flex justify-content-between">
                    {/* <div>
                        <Button
                            className="p-button-outlined"
                            style={{
                                marginRight:"8px",
                                ...this.header_button
                            }}
                            label={window.innerWidth > 500?  (this.props.show_cart? "Pesquisar Produtos" : "Visualizar Carrinho"):""}
                            icon={ this.props.show_cart? "pi pi-search" : "pi pi-shopping-cart" }
                            onClick={this.props.toggle_cart}
                        />
                    </div> */}
                    
                    
                    {<div className="flex justify-content-center flex-wrap">
                        {<Button
                            className={"p-button-info p-button-small p-button-outlined mr-2 "+(this.props.group != 0 && window.innerWidth < 600?"p-0":"") +(window.innerWidth < 600 ?"":" gap-2")}
                            style={{...this.header_button, minWidth:"80px"}}
                            // tooltip={this.props.group != 0?this.props.group.nome:"Escolha um abaixo:"}
                            // tooltipOptions={{
                            //     position: 'bottom',
                            //     // mouseTrack: true,
                            //     // mouseTrackRight: 30
                            // }}
                            icon="pi pi-th-large"//{this.props.group != 0?"":"pi pi-th-large"}
                            label={ window.innerWidth < 600 ?"":(this.props.group != 0?this.props.group.nome.replace("GRUPO",""):"Segmentos")}
                            onClick={()=>{
                                
                                this.setState({search:"",group:0})
                                // console.log(this.props.items)
                                if(this.props.search_result.length == 0 && this.props.items.length != this.props.search_result.length){
                                    // if(this.props.group == 0) return
                                    if(this.props.items.length == this.props.search_result.length)return 
                                    this.props.set_search(this.props.items)
                                }else{
                                    this.props.set_search([])
                                }
                            }}
                        >
                            {this.props.group.id && <img style={{borderRadius:"50%",marginLeft:"10px"}} height={30} src={`images/grupos/${this.props.group.id}_foto.jpg`}/>}
                        </Button>}
                        
                    </div>}
                    {/* {this.props.group == 0 && this.props.show_cart && <div>
                        <Button
                            className="p-button-outlined p-button-secondary"
                            disabled={this.props.selected_products?.length == 0}
                            label={this.props.selected_products?.length > 0? this.state.selected_products.length + " Item Selecionado" + (this.state.selected_products.length>1?"s":"") :"Nenhum Selecionado"}
                        />  
                    </div>} */}
                    {this.props.group == 0 && this.props.sale_cart.name!="" && 
                        <HeaderTitle title="Pedido" value={this.props.sale_cart.name}/>
                    }
                    {this.props.items.length != 0 && this.props.group != 0 &&
                        <div>
                            <InputText
                                value={this.state.search}
                                style={{
                                    width:"33vw",
                                    // minWidth:"200px"
                                }}
                                placeholder={window.innerWidth < 960?'Buscar material...':'Buscar material por "Nome","ID" ou "Etiqueta"'}
                                onChange={(event)=>{
                                    if(event.target.value == ""){
                                        this.props.search_focus(event)
                                        this.props.set_search(false)
                                        this.setState({search:event.target.value})
                                        return
                                    }
                                    this.props.select_item?.(null)
                                    this.setState({search:event.target.value},()=>{
                                        // faz a pesquisa
                                        this.props.get_search(event.target.value)

                                    })
                                }}
                                onKeyDown={(event)=>{
                                    if(event.keyCode == 13){
                                        // console.log("ENTER")
                                        event.target.setSelectionRange(0, event.target.value.length)
                                        this.props.addItemToCart()
                                    }
                                    // this.get_search()
                                }}
                                onFocus={(event)=>{
                                    // console.log(event)
                                    this.props.search_focus(event)
                                }}
                                onBlur={(event)=>{
                                    this.props.search_blur(event)
                                }}
                            />
                            <Button
                                style={{
                                    marginLeft:"8px",
                                    ...this.header_button
                                }}
                                label={window.innerWidth > 960? "Filtros": ""}
                                icon="pi pi-filter"
                                iconPos="right"
                                // className="p-button-outlined mr-2"
                                onClick={(event)=>{
                                    this.props.show_filters?.()
                                }}
                            />
                        </div>}
                    
                    <div>
                        <BarcodeScanner
                            item={this.state.barcode_item}
                            onDetected={(barcode)=>{
                                // console.log(barcode,this.props.all_products)
                                scrollToBottom()

                                var _item =this.props.all_products.find(item => item.COD_BARRA === barcode)
                                console.log(_item)
                                if(_item){
                                    this.props.show_item(_item)
                                    this.props.onAddProduct(_item)
                                    this.props.updateProducts()
                                    return(_item)
                                }
                            }}
                            onConfirm={(_item)=>{
                                this.props.addItemToCart(_item)
                            }}
                        />
                    </div>
                    
                </div>
                <SaleInfo
                    user_uid={this.props.user_uid}
                    sale={this.props.sale_cart}
                    show={this.state.show_sale_info}
                    onHide={(_sale)=>{
                        this.setState({show_sale_info:false})
                    }}
                    updateSale={(_sale_cart)=>{
                        // console.log(_sale_cart)
                        this.setState({show_sale_info:false})
                        this.props.updateProducts(_sale_cart)
                    }}
                />
            </div>
        )
    }
}