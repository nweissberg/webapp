import React from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { format_mask, print } from '../../utils/util';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';

export default class ClientSearchTable extends React.Component{
    constructor(props){
        super(props)
        this.default={
            clients: [],
            selected_clients:[],
            filteredClients: null,
            searchClient: null,
            selectedClient: null,
            loadingClients:false,
            client_filters:null,
            multiSortMeta: [{ field: 'score', order: -1 }]
        }
        this.state={...this.default}
        
        this.searchClients = this.searchClients.bind(this);
    }
    componentDidUpdate(a,b){
        // console.log( this.state.multiSortMeta )
        if(a.show_search != this.props.show_search && this.state.client_filters == null){
            this.build_filters()
        }
        
    }

    build_filters(){
        if(this.props.clients[0] != undefined){
            var filters = {}
            Object.keys(this.props.clients?.[0]).map((col,i) => {
                filters[col] = {value:'',matchMode: FilterMatchMode.STARTS_WITH}
            })
            print(filters)
            this.setState({client_filters:filters})
        }
    }
    searchClients(event) {
        setTimeout(() => {
            let filteredClients;
            if (!event.query.trim().length) {
                filteredClients = [...this.props.clients];
            }
            else {
                filteredClients = this.props.clients.filter((Clients) => {
                    return Clients.fantasia.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
            
            this.setState({ filteredClients });
        }, 250);
    }

    render(){
        return(<>
            <DataTable
                ref={(el)=>this.clients_table = el}
                rowClassName='relative top-0'
                responsiveLayout="scroll"
                // breakpoint="600px"
                dragSelection
                emptyMessage={<><ProgressBar mode='indeterminate' /></>}
                sortMode="multiple"
                removableSort
                multiSortMeta={this.state.multiSortMeta}
                onSort={(e) => this.setState({multiSortMeta: e.multiSortMeta})} 
                metaKeySelection={true}
                selectionMode={this.props.selectionMode?this.props.selectionMode:"multiple"}
                selection={this.state.selected_clients}
                onSelectionChange={e => {
                    this.setState({selected_clients: e.value,loadingClients:false })
                    this.props.onSelect?.(e.value)
                }}
                dataKey="id"
                header={()=>{
                    if(this.state.client_filters == null)return(<></>)
                    let active_filters = Object.keys(this.state.client_filters)?.filter?.(f=>this.state.client_filters[f].value!='');
                    return(<div className='flex justify-content-between w-full h-full'>
                        {active_filters.length > 0 && <h5 className='flex w-auto h-full text-green-400 white-space-nowrap'>Filtros Ativos </h5> }
                        <div className='flex flex-wrap w-full h-full align-items-center justify-content-end gap-3'>
                            {active_filters.map((i,j)=>{
                                return(<label key={'filter_'+j} className='text-gray-300 flex w-auto h-auto uppercase gap-1 '>
                                    {i}
                                    <span className='text-lg font-bold capitalize text-blue-400'>
                                        "{this.state.client_filters[i].value}"
                                    </span>
                                    <i className='pi pi-times text-red-400 hover:text-orange-300 cursor-pointer'
                                        onClick={(e)=>{
                                            let _client_filters = {...this.state.client_filters}
                                            _client_filters[i].value = ''
                                            this.setState({client_filters:_client_filters})
                                        }}
                                    />
                                </label>)
                            })}
                        </div>
                    </div>)
                }}
                onFilter={(e)=>{
                    // console.log(e.filters)
                    this.setState({client_filters:e.filters})
                }}
                // onChange={}
                // stripedRows
                // scrollHeight="80vh"
                resizableColumns
                columnResizeMode="expand"
                // scrollable
                showGridlines
                filters={this.state.client_filters}
                filterDisplay={this.props.show_search && this.state.client_filters?"row":null}
                size="small"
                value={this.props.filtered?.length != 0? this.props.filtered : this.props.clients}
                paginator={this.props.clients?.length > 10?true:false}
                paginatorTemplate={this.props.clients?.length > 10?"CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown":null}
                currentPageReportTemplate={this.props.clients?.length > 10?"Exibindo {first} à {last} de {totalRecords} registros":null}
                rows={this.props.clients?.length > 10?10:0}
                rowsPerPageOptions={this.props.clients?.length > 10?[10,20,50,100]:null}
                className='bg '
            >
            {this.props.clients && this.props.clients[0] && Object.keys(this.props.clients?.[0]).map((col,i) => {
                return <Column
                    className='w-auto relative'
                    showFilterMenu={false}
                    filter={col == 'score'?false:true}
                    sortable
                    key={col}
                    field={col}
                    header={col}
                    sortableDisabled={col == 'score'?true:false}
                    // frozen={col == 'id'?true:false}
                    body={(row)=>{
                        var val = row[col]
                        if(!val)return(<></>)
                        if(col == 'id'){
                            return(<Button
                                tooltip=''
                                label={val}
                                icon="pi pi-eye text-purple-300"
                                className=" p-button-text text-blue-300 p-button-glass-light-1"
                                onClick={(e)=>{
                                    this.props.router?.push({
                                        pathname: '/client',
                                        query: { p: this.props.router.query.p, id: val }
                                    })
                                    this.props.onHide?.(row)
                                    this.setState({selected_clients: row})
                                    // this.props.router?.push('client#'+ val )
                                }}
                            />)
                        }
                        switch (col) {
                            case 'cpf_cnpj':
                                if(val.length == 14){
                                    val = format_mask(val,"##.###.###/####-##")
                                }else if(val.length == 11){
                                    val = format_mask(val,"###.###.###-##")
                                }
                                break;
                            
                            case 'telefone':
                                if(val.length == 8){
                                    val = format_mask(val,"(11) ####-####")
                                }else  if(val.length == 9){
                                    val = format_mask(val,"#.####-####")
                                }else  if(val.length == 10){
                                    val = format_mask(val,"(##) ####-####")
                                }else if(val.length == 11){
                                    val = format_mask(val,"(##) #.####-####")
                                }else if(val.length == 12){
                                    val = format_mask(val,"(###) #.####-####")
                                }
                                break;
                            case 'score':
                                val = Math.round(val*100)
                            default:
                                break;
                        }
                        return(<label
                            className=" p-0 m-2 ">
                                {val}
                        </label>)
                    }}
                />;
            })}
            </DataTable>    
        </>)
    }
}

