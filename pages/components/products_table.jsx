import React, { Component } from 'react'
import { Button } from "primereact/button";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { moneyMask } from '../utils/util';
import { ToggleButton } from "primereact/togglebutton";
import localForage from "localforage";
import ProductIcon from '../profile/components/product_photo';

export default class ProductsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_products:[],
            products_filters:{},
            products:[],
            frozen_column:null,
        };
    }
    
    componentDidMount(){
        
        if(this.props.products != undefined &&
            this.state.products.length != this.props.products.length){
    
            var filters = {}
            Object.keys(this.props.products?.[0]).map((col,i) => {
                filters[col] = {value:'',matchMode: FilterMatchMode.STARTS_WITH}
            })
            // console.log(filters)
            this.setState({products_filters: filters})
        }
    }
    componentDidUpdate(){
        // console.log(this.props.products)
    }

    render(){
        return(<div id="products_datatable" style={{}}>
        <DataTable
            // style={{maxWidth:"calc(100vw - 30px)"}}
            // scrollHeight="70vh"
            scrollable
            // scrollDirection="both"
            // resizableColumns
            // columnResizeMode="fit"
            // showGridlines
            size="small"
            value={this.props.products}
            emptyMessage="Nenhum resultado encontrado..."
            responsiveLayout="scroll"
            paginator={this.props.products.length > 5?true:false}
            paginatorTemplate={this.props.products.length > 5?"CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown":null}
            currentPageReportTemplate={this.props.products.length > 5?"Exibindo {first} à {last} de {totalRecords} registros":null}
            rows={this.props.products.length > 5?5:0}
            rowsPerPageOptions={this.props.products.length > 5?[5,20,50,100]:null}
            filterDisplay="row"
            filters={this.state.products_filters}
            
            selectionPageOnly
            selectionMode="row"
            selection={this.state.selected_products}
            onSelectionChange={e => this.setState({selected_products:e.value})}
            dataKey="PRODUTO_ID"
        >
            
            <Column className="flex justify-content-center" selectionMode="multiple" style={{width: '80px'}}></Column>
    
            {this.props.products && this.props.products[0] && Object.keys(this.props.products?.[0]).map((col,i) => {
                if(this.props.columns?.indexOf(col) == -1){
                    return(false)
                }
                if(col == "PRECO_KG_OU_UNITARIO" || col == "PRECO"){
                    return(<Column sortable style={{minWidth:"100px"}} key={col} field={col} header="PREÇO" body={(row_data)=>moneyMask(row_data.PRECO_KG_OU_UNITARIO)}/>)
                }
                if(col == "photo_uid"){
                    return(<Column key={col} field={col} frozen body={(row_data)=><ProductIcon item={row_data?.PRODUTO_ID} size="4"/>}/>)
                }
                return <Column
                    style={{minWidth:"300px"}}
                    filter
                    filterPlaceholder={col+" ..."}
                    // showFilterMenu={false}
                    // sortable
                    key={col}
                    field={col}
                    // header={false}
                    // alignFrozen="right"
                    frozen={this.state.frozen_column == col}
                    header={
                        <div className="flex align-items-center gap-2">
                            <ToggleButton
                                className="p-button-rounded p-2"
                                checked={this.state.frozen_column == col}
                                onChange={(e) => {
                                    if(e.value){
                                        this.setState({frozen_column:col})
                                    }else if(this.state.frozen_column == col){
                                         this.setState({frozen_column:null})
                                    }
                                }}
                                onIcon="pi pi-lock"
                                offIcon="pi pi-lock-open"
                                onLabel=""
                                offLabel=""
                                style={{
                                    width:"50px"
                                    // flexGrow: 1,
                                    // flexBasis: '12rem',
                                }}
                            />
                            {/* <Button
                                // tooltip="Criar Filtro"
                                // tooltipOptions={{position:"top"}}
                                className="p-button-rounded p-button-outlined mr-2"
                                icon="pi pi-lock-open"
                            /> */}
                            <h6 style={{margin:"auto"}}>{col}</h6>
                        </div>
                    }
                />;
            })}
        </DataTable>
        <div className="flex justify-content-between flex-wrap p-2 gap-2">
            <Button
                className="p-button-outlined"
                disabled={this.state.selected_products.length == 0}
                label="Criar Promoção"
            />
            <Button
                className="p-button-outlined p-button-secondary"
                disabled={this.state.selected_products.length == 0}
                label={this.state.selected_products.length > 0? this.state.selected_products.length + " Item Selecionado" + (this.state.selected_products.length>1?"s":"") :"Nenhum Selecionado"}
            />
        </div>
    </div>)
    }
}