import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import { format_mask, var_set } from "../../utils/util";
import { Button } from "primereact/button";
import { FilterMatchMode } from 'primereact/api';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { ProgressBar } from "primereact/progressbar";
import { withRouter } from "next/router";

export default withRouter(class ClientsDatatable extends React.Component{
    constructor(props){
        super(props)
        this.original={
            clients_filtered:[],
            display_filters:false
        }
        this.state={ ...this.original }

    }

    actionHeader(rowData){
        return(
        <Button
            className="p-button-rounded p-button-secondary p-button-outlined"
            // label={this.state.display_filters?"Fechar":"Buscar"}
            icon={this.state.display_filters?"pi pi-times":"pi pi-search"}
            onClick={(event)=>{
                this.setState({display_filters:!this.state.display_filters})
                // scrollToBottom()
            }}
        />)
    }

    testOnChange(data){
        // console.log()
        var_set('clients_filtered', data.map(c=>c.id))
        // if(this.state.clients_filtered.length!=data.length)this.setState({clients_filtered:data})
    }

    render(){
        return(<div className="flex w-screen gap-3">
        <ConfirmPopup className="max-w-1rem"/>
        <DataTable
            style={{width:"100%"}}
            scrollHeight="70vh"
            // size="small"
            scrollable
            paginator
            responsiveLayout="scroll"
            emptyMessage={this.props.clients.length > 0?
            <div className="flex w-full h-6rem justify-content-center align-items-center">
                <h4 className="text-center" ><i style={{'fontSize': '2em'}} className="pi pi-exclamation-triangle mb-2"/><br />Cliente não encontrado</h4>
            </div>
            :
            <div className=" w-full h-full">
                <ProgressBar mode="indeterminate" />
            </div>}
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords}" rows={5} rowsPerPageOptions={[10,20,50]}
            filterDisplay={this.state.display_filters?"row":""}
            filters={{
                'fantasia': { value: '', matchMode: FilterMatchMode.CONTAINS },
                'email': { value: '', matchMode: FilterMatchMode.STARTS_WITH },
                'telefone': { value: '', matchMode: FilterMatchMode.STARTS_WITH },
                'cpf_cnpj': { value: '', matchMode: FilterMatchMode.STARTS_WITH },
                'vendedor_nome': { value: '', matchMode: FilterMatchMode.CONTAINS },
            }}
            onValueChange={ (data) => {this.testOnChange(data)} }
            
            stateStorage="local"
            stateKey="dt-state-client-agenda"
            filterDelay={1000}
            value={this.props.clients}>
                <Column
                    // ref={overlay_panel}
                    header={(rowData)=>{return(this.actionHeader(rowData))}}
                    exportable={false}
                    style={{ maxWidth: '5em' }}
                    body={(rowData)=>{
                        return(<Button
                            // label="Abrir"
                            icon="pi pi-eye"
                            className="p-button-outlined p-button-rounded"
                            onClick={(e)=>{
                                this.props.router.push('client?p=chamado&id='+ rowData.id)
                            }}
                        />);
                    }}
                />
                
                {/* <Column key="ID" field="id" header="ID" sortable></Column> */}
                <Column style={{ maxWidth: '30em' }} key="name" field="fantasia" header="Nome" filter filterPlaceholder="Buscar por nome..." showFilterMenu={false} sortable></Column>
                
                {/* <Column key="email" field="email" header="E-Mail" filter filterPlaceholder="Buscar por e-mail..." showFilterMenu={false}></Column> */}
                {/* <Column key="phone" field="telefone" header="Telefone" filter filterPlaceholder="Buscar por telefone..." showFilterMenu={false}></Column> */}
                <Column style={{ maxWidth: '15em' }} key="cpf_cnpj" field="cpf_cnpj" body={(rowData)=>{
                    if(rowData.cpf_cnpj.length == 14){
                        return(format_mask(rowData.cpf_cnpj,"##.###.###/####-##"))
                    }else if(rowData.cpf_cnpj.length == 11){
                        return(format_mask(rowData.cpf_cnpj,"###.###.###-##"))
                    }else{
                        return(rowData.cpf_cnpj)
                    }
                }} header="Documento" filter filterPlaceholder="Buscar por documento..." showFilterMenu={false}></Column>
                <Column key="vendedor" field="vendedor_nome" header="Vendedor" filter filterPlaceholder="Buscar por vendedor..." showFilterMenu={false} sortable></Column>
                <Column style={{ maxWidth: '7.5em' }} body={(rowData)=>{
                    return(<>
                        <ChannelIcons client={rowData} />
                    </>)
                    }}
                />
        </DataTable>
        
    </div>)
    }
})