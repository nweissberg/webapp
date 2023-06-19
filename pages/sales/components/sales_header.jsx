import React from "react";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import SaleInfo from "./sale_info";
import BarcodeScanner from "./barcode_scanner";
import { print, scrollToBottom, scrollToTop, similarText } from "../../utils/util";
import HeaderTitle from "../../components/title";
import ClientIcon from "../../components/client_icon";

export default class SalesHeader extends React.Component{
    constructor(props){
        super(props)
        this.state={
            show_sale_info:false,
            search:""
        }
    }
    header_button = 'sm:icon-only p-button-glass-dark border-none shadow-none'
    set_search(search_text){
        this.setState({search:search_text})
    }
    componentDidMount(){
        this.props.onLoad?.(this)
    }
    componentDidUpdate(){
        print(this.props.client)
    }
    render(){
        return(
            <div className="sticky top-0 z-3 ">
                <div className="p-2 flex w-screen justify-content-between bg-glass-c bg-blur-2  gap-3">
                    {<Button
                        className={this.header_button + " min-w-max md:w-auto"}
                        // style={{ minWidth:"80px"}}
                        // tooltip={this.props.group > 0?this.props.group.nome:"Escolha um abaixo:"}
                        // tooltipOptions={{
                        //     position: 'bottom',
                        //     // mouseTrack: true,
                        //     // mouseTrackRight: 30
                        // }}
                        icon={this.props.group.id >= 0?"pi pi-chevron-left":"pi pi-th-large"}
                        label={ this.props.group.id >= 0?this.props.group?.nome?.replace("GRUPO",""):"Segmentos"}
                        onClick={()=>{
                            
                            this.setState({search:"",group:null})
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
                        {this.props.group.id >= 0 &&
                            <img style={{borderRadius:"50%",marginLeft:"10px"}}
                                height={30}
                                src={`images/grupos/${this.props.group.id}_foto.jpg`}
                            />
                        }
                    </Button>}
                    {/* {this.props.group == 0 && this.props.show_cart && <div>
                        <Button
                            className="p-button-outlined p-button-secondary"
                            disabled={this.props.selected_products?.length == 0}
                            label={this.props.selected_products?.length > 0? this.state.selected_products.length + " Item Selecionado" + (this.state.selected_products.length>1?"s":"") :"Nenhum Selecionado"}
                        />  
                    </div>} */}
                    {this.props.group.id == -1 && this.props.sale_cart.name!="" && 
                        <HeaderTitle title="Pedido" value={this.props.sale_cart.name}/>
                    }
                    {this.props.items.length != 0 && this.props.group.id >= 0 &&
                        <div className="flex w-screen justify-content-between gap-3">
                            <span className="flex w-full h-full p-input-icon-left p-float-label">
                                <i className="pi pi-search text-white pl-2" />
                                <InputText
                                    value={this.state.search}
                                    className={this.header_button + ' w-full pl-6'}
                                    // placeholder='Buscar material por "Nome","ID" ou "Etiqueta"'
                                    id='search_bar'
                                    icon="pi pi-search"
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
                                <label className="hidden md:flex w-auto h-auto pl-2 ml-3 justify-content-center white-space-nowrap overflow-hidden text-overflow-clip" htmlFor="search_bar">
                                    Buscar material <span className='mx-1'>Nome</span>,<span className='mx-1'>ID</span> ou <span className='mx-1'>Etiqueta</span>
                                </label>

                                {/* <label className="block md:hidden flex w-auto h-auto pl-2 ml-3 justify-content-center white-space-nowrap overflow-hidden text-overflow-clip" htmlFor="search_bar">
                                    Buscar...
                                </label> */}
                            </span>
                            <Button
                                label="Filtros" 
                                badge={<i className="pi pi-filter my-0 text-info"/>}
                                badgeClassName='my-0 mx-2 p-0 '
                                className={this.header_button + " md:icon-only min-w-max sm:w-auto"}
                                onClick={(event)=>{
                                    this.props.show_filters?.()
                                }}
                            />
                        </div>}
                    
                    {/* <div>
                        <BarcodeScanner
                            item={this.state.barcode_item}
                            onDetected={(barcode)=>{
                                
                                var similar = 0.0
                                var similar_items = []
                                this.props.all_products.map(item => {
                                    var similarity = similarText(item.COD_BARRA.toString(), barcode.toString())
                                    if(similarity > similar){
                                        similar_items.unshift(item)
                                        similar = similarity
                                    }
                                })
                                if(similar_items.length > 0){
                                    var _item = similar_items[0]
                                    this.props.set_search(similar_items)
                                    this.props.show_item(_item)
                                    this.props.onAddProduct(_item)
                                    this.props.updateProducts()
                                    return(_item)
                                }
                                // }
                            }}
                            onConfirm={(_item)=>{
                                this.props.addItemToCart(_item)
                            }}
                        />
                    </div> */}
                    <ClientIcon client={this.props.client}/>
                    
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