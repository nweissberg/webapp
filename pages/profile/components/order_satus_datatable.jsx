import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import ClientDashboard from "./client_dashboard";
import ChannelIcons from "./channel_icons";
import { Tooltip } from 'primereact/tooltip';
import { format_mask, sqlDateToString, time_ago, var_set } from "../../utils/util";
import { MultiSelect } from 'primereact/multiselect';
import { Button } from "primereact/button";
import { FilterMatchMode } from 'primereact/api';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { ProgressBar } from "primereact/progressbar";
import { withRouter } from "next/router";
import { get_vendedor } from "../../api/firebase";
import { get_data_api } from "../../api/connect";
import { ToggleButton } from "primereact/togglebutton";

export default withRouter(class OrderStatusDatatable extends React.Component{
    constructor(props){
        super(props)
        this.original={
            items_filtered:[],
            display_filters:false,
			data_items:[],
			FINALIZADO:true,
			ORCAMENTO:true,
			PAGAMENTO:[]
        }
        this.state={ ...this.original }
		
		this.pagamentoFilterTemplate = this.pagamentoFilterTemplate.bind(this)
		
    }
	componentDidMount(){
		get_vendedor(this.props.user).then((vendedor)=>{
			console.log(vendedor)
			if(vendedor){
				get_data_api({
					query:"czNf3SZGTGt7sHgP3S4m",
					keys:[
						{ key: "Filial", type:"STRING", value: vendedor.EMPRESA },
						{ key: "Cliente", type:"NULL", value: null },
						{ key: "Vendedor", type:"STRING", value: vendedor.id.toString() },
						{ key: "Status", type:"NULL", value: null }
					]
				}).then((items)=>{
					console.log(items)
					this.setState({data_items:items, items_filtered:items})
				})
			}
		})
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
        console.log(data)
        // var_set('items_filtered', data.map(c=>c.id))
        // if(this.state.items_filtered.length!=data.length)this.setState({items_filtered:data})
    }
	onViewFilter(){
		var _items_filtered = [...this.state.data_items]
		if(!this.state.FINALIZADO){ _items_filtered = _items_filtered.filter(c=>c.FINALIZADO!=3)}
		if(!this.state.ORCAMENTO){ _items_filtered = _items_filtered.filter(c=>c.STATUS!=1)}
		if(this.state.PAGAMENTO.length>0) {
			_items_filtered = _items_filtered.filter(c=>{
				return this.state.PAGAMENTO.map(c=>c?.code).includes(c.ID_PAGAMENTO)
			})
		}
		this.setState({items_filtered:_items_filtered})
	}

	pagamentoFilterTemplate(options) {
        return <MultiSelect
			className="p-column-filter"
			value={options.value}
			options={this.state.data_items?.reduce((acc, item) => {
				if (!acc.codes.has(item.ID_PAGAMENTO)) {
				  acc.codes.add(item.ID_PAGAMENTO);
				  acc.result.push({ name: item.PAGAMENTO, code: item.ID_PAGAMENTO });
				}
				return acc;
			  }, { codes: new Set(), result: [] }).result}
			// itemTemplate={this.representativesItemTemplate}
			onChange={(e) => {
				
				options.filterCallback(e.value)
				// this.setState({PAGAMENTO:e.value})
				// if(e.value.length!=0)this.setState({PAGAMENTO:e.value.map(c=>c?.code)},this.onViewFilter)
			
			}}
			
			optionLabel="name"
			placeholder="Todas"
		/>;
    }

    render(){
        return(<div className="flex w-full gap-3 left-0">
        <ConfirmPopup className="max-w-1rem"/>
		<div className="w-full">
			
			<div className="gap-3 p-3 flex w-full h-auto mb-2 justify-content-center align-items-center">
				<MultiSelect
					className="p-column-filter text-white h-full flex p-1 rounded"
					maxSelectedLabels={3}
					value={this.state.PAGAMENTO}
					options={this.state.data_items?.reduce((acc, item) => {
						if (!acc.codes.has(item.ID_PAGAMENTO)) {
						acc.codes.add(item.ID_PAGAMENTO);
						acc.result.push({ name: item.PAGAMENTO, code: item.ID_PAGAMENTO });
						}
						return acc;
					}, { codes: new Set(), result: [] }).result}
					// itemTemplate={this.representativesItemTemplate}
					onChange={(e) => {
						console.log(e.value)
						// options.filterCallback(e.value)
						// this.setState({PAGAMENTO:e.value})
						// if(e.value.length!=0)
						this.setState({PAGAMENTO:e.value},this.onViewFilter)
					
					}}
					
					optionLabel="name"
					placeholder="Formas de Pagamento"
				/>
				<ToggleButton
					// value={}
					className={"shadow-none border-none p-button-lg rounded "+(this.state.FINALIZADO?"bg":"bg-secondary")}
					checked={this.state.FINALIZADO}
					offLabel="Esconder Finalizados"
					onLabel="Mostrar Finalizados"
					onIcon="pi pi-eye"
					offIcon="pi pi-eye-slash"
					onChange={(e)=>{
						this.setState({FINALIZADO:!this.state.FINALIZADO},this.onViewFilter)
					}}
				/>
				<ToggleButton
					// value={}
					className={"shadow-none border-none p-button-lg rounded text-white "+(this.state.ORCAMENTO?"bg":"bg-secondary")}
					checked={this.state.ORCAMENTO}
					offLabel="Esconder Orçamentos"
					onLabel="Mostrar Orçamentos"
					onIcon="pi pi-eye"
					offIcon="pi pi-eye-slash"
					onChange={(e)=>{
						this.setState({ORCAMENTO:!this.state.ORCAMENTO},this.onViewFilter)
					}}
				/>
				
			</div>
			<DataTable
				className="w-full"
				style={{width:"100%"}}
				// scrollHeight="70vh"
				scrollable
				paginator
				emptyMessage={this.state.data_items?.length > 0?
				<div className="flex w-full h-6rem justify-content-center align-items-center">
					<h4 className="text-center" ><i style={{'fontSize': '2em'}} className="pi pi-exclamation-triangle mb-2"/><br />Pedido não encontrado</h4>
				</div>
				:
				<div className=" w-full h-full">
					<ProgressBar mode="indeterminate" />
				</div>}
				paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
				currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords}" rows={5} rowsPerPageOptions={[10,20,50]}
				filterDisplay={this.state.display_filters?"row":""}
				filters={{
					'ID_PEDIDO': { value: '', matchMode: FilterMatchMode.STARTS_WITH },
					'CLIENTE': { value: '', matchMode: FilterMatchMode.CONTAINS },
					'EMISSAO': { value: '', matchMode: FilterMatchMode.STARTS_WITH },
					'ID_PAGAMENTO': { value: null, matchMode: FilterMatchMode.IN },
				}}
				onValueChange={ (data) => {this.testOnChange(data)} }
				
				// onFilter={(e)=>{
				//     var _data_items = [...this.state.data_items]
				//     // _data_items[e.sortField] = 
				//     console.log(e,_data_items)
				// }}
				stateStorage="local"
				stateKey="dt-state-order-status-agenda"
				// filterDelay={200}
				value={this.state.items_filtered}>
					<Column
						// ref={overlay_panel}
						key="id"
						// header={(rowData)=>{return(this.actionHeader(rowData))}}
						exportable={false}
						style={{ maxWidth: '5em' }}
						field="ID_PEDIDO"
						body={(rowData)=>{
							return(rowData.ID_PEDIDO);
							
						}}
						filter filterPlaceholder="ID" showFilterMenu={false}
					/>
					
					{/* <Column key="ID" field="id" header="ID" sortable></Column> */}
					<Column style={{ maxWidth: '30em' }} key="name" field="CLIENTE" header="Cliente" filter filterPlaceholder="Buscar por nome..." showFilterMenu={false} sortable></Column>
					
					{/* <Column key="email" field="email" header="E-Mail" filter filterPlaceholder="Buscar por e-mail..." showFilterMenu={false}></Column> */}
					{/* <Column key="phone" field="telefone" header="Telefone" filter filterPlaceholder="Buscar por telefone..." showFilterMenu={false}></Column> */}
					{/* <Column style={{ maxWidth: '15em' }} key="cpf_cnpj" field="cpf_cnpj" body={(rowData)=>{
						if(rowData.cpf_cnpj.length == 14){
							return(format_mask(rowData.cpf_cnpj,"##.###.###/####-##"))
						}else if(rowData.cpf_cnpj.length == 11){
							return(format_mask(rowData.cpf_cnpj,"###.###.###-##"))
						}else{
							return(rowData.cpf_cnpj)
						}
					}} header="Documento" filter filterPlaceholder="Buscar por documento..." showFilterMenu={false}></Column> */}
					<Column key="emissao" field="EMISSAO" header="Emissão" filter filterPlaceholder="Buscar por data..." showFilterMenu={false} sortable body={(rowData)=>{
						return(time_ago(rowData.EMISSAO) +" "+ sqlDateToString(rowData.EMISSAO))
					}}></Column>

					<Column filterField="ID_PAGAMENTO" filterElement={this.pagamentoFilterTemplate} key="code" field="ID_PAGAMENTO" header="Pagamento" filter showFilterMenu={false} sortable body={(rowData)=>{
						return(rowData.PAGAMENTO)
					}}></Column>

					<Column key="OBSERVACAO" field="OBSERVACAO" header="Observação"></Column>
					<Column key="LANCAMENTO" field="LANCAMENTO" header="Status"></Column>
					{/* <Column style={{ maxWidth: '7.5em' }} body={(rowData)=>{
						return(<>
							<ChannelIcons client={rowData} />
						</>)
						}}
					/> */}
			</DataTable>
		</div>
        
    </div>)
    }
})