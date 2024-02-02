import React from 'react';
import localForage from "localforage";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { api_get, get_data_api } from '../../api/connect';
import { moneyMask, var_get, var_set } from '../../utils/util';
import { Skeleton } from 'primereact/skeleton';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Menu } from 'primereact/menu';

var companies_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'empresas'
});

export default class TaxDataTable extends React.Component{
    constructor(props){
        super(props)

        this.columns = [
            {key:"icms", header:"ICMS" },
            {key:"icms_st", header:"ICMS ST"},
            {key:"pis", header:"PIS" },
            {key:"cofins", header:"Cofins" },
            {key:"ipi", header:"IPI" },
        ];
        
        this.state={
            loading:true,
            selected_row:null,
            selected_column:null,
            selected_date_start:new Date(),
            selected_date_end:new Date(),
            selected_columns:[...this.columns],
            calendar_mode:"single"
        }

        this.caledar_icons = {
            "single":{icon:"pi pi-calendar",label:'Mês'},
            "range":{icon:"pi pi-arrows-h",label:'Período'}
        }

        this.items = [
            {
                label: 'Modo',
                items: [
                    {
                        label: this.caledar_icons.single.label,
                        icon: this.caledar_icons.single.icon,
                        command: () => {
                            this.get_empresas().then(()=>{
                                this.setState({calendar_mode:"single",selected_date_end:new Date(),loading:true}, async ()=>{await this.buid_datatable()})
                            })
                        }
                    },
                    {
                        label: this.caledar_icons.range.label,
                        icon: this.caledar_icons.range.icon,
                        command: () => {
                            this.get_empresas().then(()=>{
                                this.setState({calendar_mode:"range",loading:true}, async ()=>{await this.buid_datatable()})
                            })
                        }
                    }
                ]
            },
            {
                label: 'Ação',
                items: [
                    {
                        label: "Mês atual",
                        icon: this.caledar_icons.single.icon,
                        command: () => {
                            this.get_empresas().then(()=>{
                                this.setState({calendar_mode:"single",loading:true,selected_date_start:new Date(),selected_date_end:new Date()}, async ()=>{await this.buid_datatable()})
                            })
                        }
                    },
                    {
                        label: "Ano atual",
                        icon: this.caledar_icons.range.icon,
                        command: () => {
                            const ano = new Date().getFullYear()
                            this.get_empresas().then(()=>{
                                this.setState({calendar_mode:"range",loading:true,selected_date_start:new Date(ano,0,1),selected_date_end:new Date(ano,11,31)}, async ()=>{await this.buid_datatable()})
                            })
                        }
                    }
                ]
            }
        ];
    }

    get_data_api(query,state){
        return(api_get({
            credentials:"0pRmGDOkuIbZpFoLnRXB",
            query,
            keys:[]
        }).then(async(data)=>{
            data = data.map((i)=>{
                if(i.prazo_entrega) i.prazo_entrega = new Date(i.prazo_entrega)
                i.data_emissao = new Date(i.data_emissao)
                return(i)
            })
            await new Promise(res => this.setState({ [state]:data }, ()=>res()))
        }))
    }

    async get_empresas(){
        var _empresas = {}
        return await companies_db.iterate(function(empresa) {
            empresa.faturamento = 0
            empresa.compras = 0
            empresa.pedidos = 0
            empresa.dispesa = 0
            empresa.receita = 0
            empresa.total = 0
            empresa.iva = 0
            _empresas[empresa.id] = empresa
        }).then(()=>{
            this.setState({empresas:_empresas})
        })
    }
    
    async get_all_data(){
        return await Promise.all([
            get_data_api("Sgnl05dUjKiqMe9hxZ2U","ordem_compras"),
            get_data_api("vU88G1zOu60JLRq7LtrI","faturamento"),
            get_data_api("Oov68ZUpr29y7QxbXw6R","entrada"),
            get_data_api("Jj7fmO9XscYDkDKgz8TV","saida"),
            get_data_api("JDeHJRlQ0q2YbaUvh1WK","pedidos"),
            get_data_api("TayZrwYoXAPjcVLD0hnQ","compras"),
            this.get_empresas(),
        ])
    }

    sqlDateToString(date_string){
        return(new Date(date_string).toLocaleDateString("pt-br", {
            hour12: false,
            day: "2-digit",
            month: "short",
            year: "numeric",
        }))
    }

    
    money_body(value,field,tax=null){
        if(this.state.loading){ return(<Skeleton width='100%'/>) }
        if(!value || value[field] == 0) return(<></>)
        return(<h6 className={(tax!=null?(value[field] >0?'text-green-400 font-medium':'text-orange-400 font-medium'):'')+' white-space-nowrap text-right pr-2 pt-1'}>{moneyMask(value[field])}</h6>)
    }
    
    tax_body(row_data,field){
        if(this.state.loading){ return(<Skeleton width='8rem'/>) }
        if(!row_data.entrada && !row_data.saida) return(<></>)
        var entrada = row_data.entrada?.[field]? row_data.entrada[field]: 0
        var saida = row_data.saida?.[field]? row_data.saida[field]:0
        const sum_tax = entrada - saida
        var color = "text-color-secondary"
        if(sum_tax > 0) color = "text-green-400 font-medium"
        if(sum_tax < 0) color = "text-orange-400 font-medium"
        
        const show_op = (e)=>{
            this.op?.toggle(e)
            if(this.state.selected_row?.id != row_data.id){
                this.setState({selected_row:row_data,selected_column:field})
            }else{
                this.setState({selected_column:field})
            }
        }
        
        return(<>
            <Button
                className={`pt-0 pb-0 p-button-text p-button-rounded white-space-nowrap ${color} `}
                label={moneyMask(sum_tax)}
                disabled={sum_tax==0}
                onClick={(e) => {
                    clearTimeout(this.op_timer)
                    show_op(e)
                }}
                onPointerEnter={(e)=>{
                    this.op_timer = setTimeout(()=>show_op(e),400)
                }}
                // onPointerLeave={()=>{
                //     clearTimeout(this.op_timer)
                //     this.op.hide()
                // }}
                />
        </>)
    }
    
    test_date(date){
        if(this.state.calendar_mode == "range"){
            if(date >= this.state.selected_date_start
            && date <= this.state.selected_date_end) return true
        }else{
            var firstDayOfMonth = new Date(this.state.selected_date_start.getFullYear(), this.state.selected_date_start.getMonth(), 1);
            var lastDayOfMonth = new Date(this.state.selected_date_start.getFullYear(), this.state.selected_date_start.getMonth() + 1, 0);
            if(date >= firstDayOfMonth && date <= lastDayOfMonth) return true
        }
        return false
    }
    async buid_datatable(){
        // console.log(this.state)
        if(!this.state.selected_date_start) return(null)
        var _empresas = {...this.state.empresas}
        

        this.state.faturamento?.map((item)=>{
            if( this.test_date(item.data_emissao) == false) return(null)
            _empresas[item.empresa_id].faturamento += item.valor_total_geral
        })

        this.state.compras?.map((item)=>{
            if( this.test_date(item.data_emissao) == false) return(null)
            _empresas[item.empresa_id].compras += item.valor_total
        })

        this.state.pedidos?.map((item)=>{
            if( this.test_date(item.data_emissao) == false) return(null)
            _empresas[item.empresa_id].pedidos += item.Sum_valor_total
        })
        
        
        this.state.entrada?.map((item)=>{
            _empresas[item.empresa_id].entrada ||= {cofins:0,icms:0,ipi:0,pis:0,icms_st:0,total:0}
            if( this.test_date(item.data_emissao) == false) return(null)
            _empresas[item.empresa_id].entrada.cofins += item.Sum_valor_cofins
            _empresas[item.empresa_id].entrada.icms += item.Sum_valor_icms
            _empresas[item.empresa_id].entrada.ipi += item.Sum_valor_ipi
            _empresas[item.empresa_id].entrada.pis += item.Sum_valor_pis,
            _empresas[item.empresa_id].entrada.icms_st += item.Sum_valor_icms_st
        })

        this.state.saida?.map((item)=>{
            _empresas[item.empresa_id].saida ||= {cofins:0,icms:0,ipi:0,pis:0,icms_st:0,total:0}
            if( this.test_date(item.data_emissao) == false) return(null)
            _empresas[item.empresa_id].saida.cofins += item.Sum_valor_cofins
            _empresas[item.empresa_id].saida.icms += item.Sum_valor_icms
            _empresas[item.empresa_id].saida.ipi += item.Sum_valor_ipi
            _empresas[item.empresa_id].saida.pis += item.Sum_valor_pis
            _empresas[item.empresa_id].saida.icms_st += item.Sum_valor_icms_st
        })

        const empresas_array = Object.values(_empresas)
        // console.log(empresas_array)
        _empresas.total = {
            fantasia:"TOTAL",
            faturamento:empresas_array.map((i)=>i.faturamento||0).reduce((a,b)=>a+b),
            compras:empresas_array.map((i)=>i.compras||0).reduce((a,b)=>a+b),
            pedidos:empresas_array.map((i)=>i.pedidos||0).reduce((a,b)=>a+b),
            entrada:{
                cofins:empresas_array.map((i)=>i.entrada?.cofins||0).reduce((a,b)=>a+b),
                icms:empresas_array.map((i)=>i.entrada?.icms||0).reduce((a,b)=>a+b),
                ipi:empresas_array.map((i)=>i.entrada?.ipi||0).reduce((a,b)=>a+b),
                pis:empresas_array.map((i)=>i.entrada?.pis||0).reduce((a,b)=>a+b),
                icms_st:empresas_array.map((i)=>i.entrada?.icms_st||0).reduce((a,b)=>a+b),
                total:0
            },
            saida:{
                cofins:empresas_array.map((i)=>i.saida?.cofins||0).reduce((a,b)=>a+b),
                icms:empresas_array.map((i)=>i.saida?.icms||0).reduce((a,b)=>a+b),
                ipi:empresas_array.map((i)=>i.saida?.ipi||0).reduce((a,b)=>a+b),
                pis:empresas_array.map((i)=>i.saida?.pis||0).reduce((a,b)=>a+b),
                icms_st:empresas_array.map((i)=>i.saida?.icms_st||0).reduce((a,b)=>a+b),
                total:0
            }
        }
        for (var key in _empresas) {
            var empresa = _empresas[key]
            if(empresa.saida && empresa.entrada){
                empresa.saida.total = empresa.saida?.cofins + empresa.saida?.ipi + empresa.saida?.icms + empresa.saida?.pis + empresa.saida?.icms_st
                empresa.entrada.total = empresa.entrada?.cofins + empresa.entrada?.ipi +empresa.entrada?.icms + empresa.entrada?.pis
                empresa.impostos = empresa.entrada.total - empresa.saida.total

            }
            empresa.iva = (100-((empresa.compras + empresa.saida?.total)*100)/(empresa.entrada?.total + empresa.faturamento)).toFixed(2) +" %"
            empresa.total = (empresa.faturamento - empresa.compras) + empresa.impostos
        }

        this.props.onChange(_empresas)
        this.setState({ empresas:_empresas, loading:false })
    }

    componentDidMount(){
        var_get("tax_columns").then((active_cols)=>{
            if(active_cols) this.setState({selected_columns:JSON.parse(active_cols)});
        })
        return(this.get_all_data().then(async (data)=>{data && await this.buid_datatable()}))
    }
    
    onColumnToggle(event){
        let selected_columns = event.value;
        let orderedSelected_columns = this.columns.filter(col => selected_columns.some(sCol => sCol.key === col.key));
        var_set("tax_columns",JSON.stringify(orderedSelected_columns))
        this.setState({selected_columns:orderedSelected_columns});
    }
    
    columnComponents(){
        return this.state.selected_columns.map(col=> {
            return <Column alignHeader='center' align='right' key={col.key} header={col.header} body={data=>this.tax_body(data,col.key)}/>
        });
    }
    render(){
        var data_array = []
        if(this.state.empresas) data_array = Object.values(this.state.empresas)
        if(this.state.loading == false) data_array = data_array.filter((i)=>i.faturamento != 0)
        var entrada = this.state.selected_row?.entrada?.[this.state.selected_column]?this.state.selected_row.entrada[this.state.selected_column]:0
        var saida = this.state.selected_row?.saida?.[this.state.selected_column]?this.state.selected_row.saida[this.state.selected_column]:0
        
        const header = (
            <div className='flex w-full justify-content-between pr-2 pl-2'>
                <Menu model={this.items} popup ref={el => this.menu = el} id="popup_menu" />
                <MultiSelect
                    disabled={this.state.loading}
                    value={this.state.selected_columns}
                    options={this.columns}
                    optionLabel="header"
                    placeholder='Impostos...'
                    onChange={(e)=>{this.onColumnToggle(e)}}
                    style={{minWidth:'10em'}}
                />
                <div className='flex gap-2'>
                    
                    <Calendar
                        minDate={new Date(2022,9,1)}
                        maxDate={this.state.selected_date_end}
                        style={{width:"9rem"}}
                        disabled={this.state.loading}
                        value={this.state.selected_date_start}
                        view="month" dateFormat="MM yy"
                        onChange={(e)=>{
                            var date = e.target.value;
                            var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                            this.get_empresas().then(()=>{
                                this.setState({selected_date_start:firstDayOfMonth,loading:true}, async ()=>{await this.buid_datatable()})
                            })
                        }}
                    />
                    <Button
                        icon={this.caledar_icons[this.state.calendar_mode].icon}
                        disabled={this.state.loading}
                        className='p-button-help p-button-outlined'
                        onClick={(event) => this.menu.toggle(event)}
                        aria-controls="popup_menu"
                    />
                    {this.state.calendar_mode == "range" &&
                        <Calendar
                            maxDate={new Date()}
                            minDate={this.state.selected_date_start}
                            style={{width:"9rem"}}
                            disabled={this.state.loading}
                            value={this.state.selected_date_end}
                            view="month" dateFormat="MM yy"
                            onChange={(e)=>{
                                // console.log(e.target.value)
                                var date = e.target.value;
                                var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                                this.get_empresas().then(()=>{
                                    this.setState({selected_date_end:lastDayOfMonth,loading:true}, async ()=>{await this.buid_datatable()})
                                })
                            }}
                        />
                    }
                </div>
                <Button
                    disabled={this.state.loading}
                    className='p-button-outlined'
                    label="Recarregar"
                    icon="pi pi-sync"
                    onClick={()=>{
                        this.setState({loading:true},()=>{this.get_all_data().then(async ()=>{await this.buid_datatable()})})
                        
                    }}
                />
            </div>
        );

        return(<div className={this.props.className?this.props.className:"flex flex-1 w-full"}>
            <OverlayPanel ref={(el) => this.op = el}
            onPointerLeave={()=>{
                clearTimeout(this.op_timer)
                this.op.hide()
            }}>
                <div className='m-2'>
                    {this.state.selected_row &&<>
                        <h6 className='flex gap-1'>Crédito: <h6 className='text-green-400'>{moneyMask(entrada)}</h6></h6>
                        <h6 className='flex gap-1'>Débito: <h6 className='text-orange-400'>{moneyMask(saida)}</h6></h6>
                    </>}
                </div>
            </OverlayPanel>
            <DataTable
                className='block w-full'
                size='small'
                // scrollable
                // scrollHeight="100%"
                emptyMessage={<div className='flex justify-content-center'>Nenhum registro encontrado</div>}
                value={data_array}
                breakpoint="600px"
                responsiveLayout='scroll'
                // footer={<div className='flex justify-content-between pr-2 pl-2'>
                //     <Button className='p-button-outlined p-button-secondary' label="Imposto de Renda"/>
                //     <Button className='p-button-outlined p-button-secondary' label="Imposto do Valor Agregado"/>
                // </div>}
                header={header}
            >
                <Column key="fantasia" header="" className='white-space-nowrap text-left' body={(row_data)=>{
                    if(row_data.fantasia == "TOTAL") return(<h6 className='pl-2 pt-2'>{row_data.fantasia}</h6>)
                    return(<Button className='p-button-text pt-0 pb-0 pr-1 pl-1 ml-1 ' label={row_data.fantasia}/>)
                }}/>
                <Column alignHeader='center' key="faturamento" header="Faturamento" body={data=>this.money_body(data,"faturamento")}/>
                <Column alignHeader='center' key="compras" header="Compras" body={data=>this.money_body(data,"compras")}/>
                {this.columnComponents()}
                <Column alignHeader='center' key="impostos" header="impostos" align='right' body={data=>this.tax_body(data,"total",true)}/>
                <Column alignHeader='center' align='center' className='white-space-nowrap' key="iva" header="IVA" field="iva"/>
                <Column alignHeader='center' key="total" header="Total" body={data=>this.money_body(data,"total",true)}/>
            </DataTable>
        </div>)
    }
}