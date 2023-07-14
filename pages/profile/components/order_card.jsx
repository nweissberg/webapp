import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { capitalize, moneyMask, shorten, time_ago } from '../../utils/util';
import OrderTimeline from '../../order/components/order_timeline';
import ProductIcon from './product_photo';
import ClientIcon from '../../components/client_icon';

export default class OrderCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show_timeline:false
        };
    }
    
    
    // componentDidUpdate(){
    //     console.log(this.props.products)
    // }

    get_last_action(product){
        return(product.history?.slice(-1)[0])
    }

    productTemplate(product) {
        // console.log(product)
        const last_action = this.get_last_action(product)
        return (
            <div key={product.name}
                className={"order-card product-item w-4 " + this.props?.className}
            >
                <div className="product-item-content">
                    
                    <div>
                        {/* {product.client && <h5 style={{color:"var(--text-c)"}}>{product.client.fantasia}</h5>} */}
                        {product.client && <ClientIcon
                            client_id={product.client}
                            // onClick={(e)=>{
                            //     console.log("TESTE")
                            // }}
                        />}
                        <h4 className="mb-1 mt-1" style={{color:"var(--text)"}}>{product.name == ''?'SEM NOME':product.name}</h4>
                        <h6 className="mt-0 mb-3" style={{color:"var(--info)"}}>{product.items.length} itens</h6>
                        {/* <span className={`product-badge status-${product.inventoryStatus.toLowerCase()}`}>{product.inventoryStatus}</span> */}
                        
                        { !product.client && this.props.currentUser && <div className="card-buttons mt-3 mb-3">

                            <Button
                                icon="pi pi-pencil"
                                tooltip='Editar'
                                tooltipOptions={this.tooltip_options}
                                className="p-button-info p-button-outlined p-button-rounded mr-2"
                                onClick={(event)=>{
                                    // console.log("Edit Draft")
                                    this.props.edit?.(product.name)
                                }}
                            />
                            <Button
                                icon="pi pi-copy"
                                tooltip='Duplicar'
                                tooltipOptions={this.tooltip_options}
                                className="p-button-success p-button-outlined p-button-rounded mr-2"
                                onClick={(event)=>{
                                    // console.log("Clone ")
                                    this.props.clone?.(product.name)
                                }}
                            />
                            <Button
                                icon="pi pi-trash"
                                tooltip='Excluir'
                                tooltipOptions={this.tooltip_options}
                                className="p-button-help p-button-outlined p-button-rounded"
                                onClick={(event)=>{
                                    // console.log("Delete ")
                                    this.props.delete?.(product.name)
                                }}
                            />
                        </div>}

                        {product.client && <div className="card-buttons mt-3 mb-3">
                            
                            <Button
                                icon="pi pi-link"
                                tooltip='Gerar Link'
                                tooltipOptions={this.tooltip_options}
                                className="p-button-secondary p-button-outlined p-button-rounded mr-2"
                                onClick={(event)=>{
                                    // console.log("Get Link")
                                    this.props.link?.(product)
                                }}
                            />

                            <Button
                                icon="pi pi-eye"
                                tooltip='Visualizar'
                                tooltipOptions={this.tooltip_options}
                                className="p-button-info p-button-outlined p-button-rounded mr-2"
                                onClick={(event)=>{
                                    // console.log("Edit Draft")
                                    this.props.view?.(product)
                                }}
                            />

                            {/* <Button
                                icon="pi pi-history"
                                tooltip='Devolver'
                                tooltipOptions={this.tooltip_options}
                                className="p-button-success p-button-outlined p-button-rounded mr-2"
                                onClick={(event)=>{
                                    // console.log("Clone ")
                                    this.props.callback?.(product.name)
                                }}
                            /> */}

                            {this.props.currentUser && <Button
                                icon="pi pi-trash"
                                tooltip='Excluir'
                                tooltipOptions={this.tooltip_options}
                                className="p-button-help p-button-outlined p-button-rounded"
                                onClick={(event)=>{
                                    // console.log("Delete ")
                                    this.props.delete?.(product.name)
                                }}
                            />}

                            
                        </div>}

                        {product.history && <Button
                            style={{pointerEvents:"all"}}
                            className='p-button-success p-button-text p-button-sm p-button-rounded pt-0 pb-0 mb-2 pl-2 pr-2'
                            label={capitalize(last_action.action) + ' ' + time_ago(last_action.date).toLocaleLowerCase()}
                            // tooltip={new Date(product.history[0]).toLocaleString()}
                            onClick={()=>{
                                this.setState({show_timeline:!this.state.show_timeline})
                            }}
                        />}

                        <div style={{
                            overflow:"hidden",
                            borderRadius:"10px",
                            // maxHeight:"33vh",
                            pointerEvents:"all"
                        }}>
                            {this.state.show_timeline &&
                            <div
                                style={{
                                    maxHeight:"320px",
                                    overflowX:"hidden",
                                    overflowY:"scroll"
                                }}
                            >
                                <OrderTimeline
                                    align="alternate"
                                    history={product.history}
                                />
                            </div>}
                            { !this.state.show_timeline && <DataTable
                                rows={3}
                                first={0}
                                value={product.items}
                                // paginator={product.items.length>3?true:false}
                                responsiveLayout="scroll"
                                scrollHeight="320px"
                                size="small"
                                // scrollable
                                // resizableColumns
                                // columnResizeMode="expand"
                                // showGridlines
                            >

                                <Column
                                    field='data.photo' header='Info'
                                    body={(row_data)=>{
                                        return(<ProductIcon item={row_data.id} />)
                                    }}
                                ></Column>
                                <Column
                                    style={{
                                        // width:'33px', overflow:"scroll"
                                    }}
                                    field='data.PRODUTO_NOME'
                                    body={(row_data)=>{
                                        return(
                                            <div>
                                                {shorten(row_data.data?.PRODUTO_NOME)}
                                            </div>
                                        )
                                    }}
                                ></Column>

                                
                                <Column
                                    style={{maxWidth:'150px'}} 
                                    field='sale_price'
                                    header='Preço'
                                    body={(row_data)=>{
                                    return(<div style={{ textAlign:"right", width:"100%" }}>
                                        {(row_data.discount > 0 || row_data.quantity > 1) && <>
                                            {row_data.discount > 0 && <><div style={{whiteSpace:"nowrap", color:"var(--text-b)"}}>
                                                {moneyMask(row_data.sale_price)}
                                            </div>
                                            <div style={{color:"var(--warn)"}}>
                                                -{Math.round(row_data.discount)}%
                                            </div></>}
                                            {row_data.quantity > 1 && <>
                                                <div style={{color:"var(--text-c)"}}>
                                                    {moneyMask((row_data.sale_price-(row_data.sale_price*(row_data.discount/100))))}
                                                </div>
                                                <div style={{color:"var(--success)"}}>
                                                    x{row_data.quantity +" "+ (row_data.data?.ABREVIATURA)?.toLowerCase()}
                                                </div>
                                            </>}
                                        </>}
                                        <div style={{whiteSpace:"nowrap", fontWeight:"bold"}}>
                                            {moneyMask((row_data.sale_price-(row_data.sale_price*(row_data.discount/100)))*row_data.quantity)}
                                        </div>
                                        </div>)
                                }}></Column>
                            </DataTable>}
                            
                        </div>
                        {product.items.length > 0 && <div className='flex flex-wrap align-items-center justify-content-center gap-2 mt-3'>
                            <h5 style={{color:"var(--text-b)"}}>Total:</h5>
                            <h3 style={{color:"var(--text)"}}>{
                                moneyMask(product.items.map((item)=>{return((item.sale_price-(item.sale_price*(item.discount/100)))*item.quantity)}).reduce((sum,i)=> sum + i))
                            }</h3>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }
    render() {
        return (this.productTemplate(this.props.sale_cart));
    }

}