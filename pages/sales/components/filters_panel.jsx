import React from "react";
import { Button } from "primereact/button";
import { InputNumber } from 'primereact/inputnumber';
import { ToggleButton } from 'primereact/togglebutton';
import { MultiSelect } from 'primereact/multiselect';
import { Sidebar } from "primereact/sidebar";
import SalesDropdown from "./sales_dropdown";
import MultiStateButton from "../../components/state_button";
import { InputText } from "primereact/inputtext";
import FilterInputRange from "../../components/filter_input_range";
import { deepEqual } from "../../utils/util";

export default class FiltersPanel extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            value:props.value,
            inventory:true,
            exposition:true,
            top_products:true,
            marcas:[],
            marcas_select:[],
            all_items:[],
            items:[],
            filtered_items:[],
            selected_group:0,
            gramatura:null,
            largura:null,
            comprimento:null
        }
    }

    componentDidUpdate(props){
        // console.log(props.selected_group)
        if(this.props.selected_group.id != this.state.selected_group){
            if(this.props.visible && deepEqual(this.props.items, this.state.all_items) ==  false){
                var _marcas = [...new Set(this.props.items.map(item => item.MARCA))];
                this.setState({
                    selected_group:this.props.selected_group.id,
                    items:this.props.items,
                    all_items:this.props.items,
                    marcas_select:[],
                    marcas:_marcas.filter(i=>i).map((item,index)=>{
                        return({
                            nome:item,
                            id:index
                        })
                    }),
                })
            }
        }
    }

    updateValue(value){
        this.setState({value})
    }
    filterTemplate = (options) => {
        let {filterOptions} = options;
    
        return (
            <div className="flex gap-2">
                <InputText value={filterValue} ref={filterInputRef} onChange={(e) => myFilterFunction(e, filterOptions)} />
                <Button label="Reset" onClick={() => myResetFunction(filterOptions)} />
            </div>
        )
    }
    myResetFunction = (options) => {
        setFilterValue('');
        options.reset();
        filterInputRef && filterInputRef.current.focus()
    }
    myFilterFunction = (event, options) => {
        let _filterValue = event.target.value;
        setFilterValue(_filterValue);
        options.filter(event);
    }
    filterItems(){
        var _items = [...this.state.items]

        if(this.state.gramatura){
            _items = _items.filter((item)=>{
                if(this.state.gramatura.selected_state == 0){
                    return(item.GRAMATURA == this.state.gramatura.min)
                }
                if(this.state.gramatura.selected_state == 1){
                    return(item.GRAMATURA >= this.state.gramatura.min)
                }
                if(this.state.gramatura.selected_state == 2){
                    return(item.GRAMATURA <= this.state.gramatura.min)
                }
                if(this.state.gramatura.selected_state == 3){
                    return(item.GRAMATURA >= this.state.gramatura.min && item.GRAMATURA <= this.state.gramatura.max)
                }
            })
        }

        if(this.state.largura){
            _items = _items.filter((item)=>{
                if(this.state.largura.selected_state == 0){
                    return(item.LARGURA == this.state.largura.min)
                }
                if(this.state.largura.selected_state == 1){
                    return(item.LARGURA >= this.state.largura.min)
                }
                if(this.state.largura.selected_state == 2){
                    return(item.LARGURA <= this.state.largura.min)
                }
                if(this.state.largura.selected_state == 3){
                    return(item.LARGURA >= this.state.largura.min && item.LARGURA <= this.state.largura.max)
                }
            })
        }
        /**** FLAG FIX Filtros não encontram o parametro, deve ser erro no SQL ****/
        if(this.state.comprimento){
            _items = _items.filter((item)=>{
                if(this.state.comprimento.selected_state == 0){
                    return(item.COMPRIMENTO == this.state.comprimento.min)
                }
                if(this.state.comprimento.selected_state == 1){
                    return(item.COMPRIMENTO >= this.state.comprimento.min)
                }
                if(this.state.comprimento.selected_state == 2){
                    return(item.COMPRIMENTO <= this.state.comprimento.min)
                }
                if(this.state.comprimento.selected_state == 3){
                    return(item.COMPRIMENTO >= this.state.comprimento.min && item.COMPRIMENTO <= this.state.comprimento.max)
                }
            })
        }

        // console.log(_items)
        var _marcas = [...new Set(_items.map(item => item.MARCA))];
        
        if(this.state.marcas_select.length > 0){
            _items = _items.filter((item)=>this.state.marcas_select.indexOf(item.MARCA) != -1)
        }

        this.setState({
            filtered_items:_items,
            marcas:_marcas.filter(i=>i).map((item,index)=>{
                return({
                    nome:item,
                    id:index
                })
            })
        })
        if(_items.length > 0)this.props.set_filter_search?.(_items)
    }
    render(){
        const customIcons = (
            <div className="flex justify-content-start w-full">
                <Button
                    style={{fontSize:"20px"}}
                    label={this.state.filtered_items.length > 0 ? this.state.filtered_items.length + " Materiais": ""}
                    className="p-button-text p-button-rounded" 
                />
            </div>
        );
        return(
            <div>
                <Sidebar
                    icons={customIcons}
                    // fullScreen
                    position="bottom"
                    visible={this.props.visible}
                    onHide={this.props.onHide}
                    style={{
                        background:"var(--glass-b)",
                        backdropFilter:"blur(10px)",
                        width:"100%",
                        // maxWidth:"250px",
                        height:"auto",
                        maxHeight:"100vh",
                        borderRadius:"1px 0px 10px 00px"
                    }}
                >
                    <div className="flex p-fluid grid formgrid gap-2">
                        <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-2">{/*flex-grow-1*/}
                            <FilterInputRange
                                label="Gramatura"
                                suffix=" g/m²"
                                value={this.state.gramatura}
                                reset={()=>{
                                    this.setState({gramatura:null},this.filterItems)
                                }}
                                onChange={(value)=>{
                                    this.setState({gramatura:value},this.filterItems)
                                }}
                            />
                        </div>

                        <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-2">{/*flex-grow-1*/}
                            <FilterInputRange
                                label="Largura"
                                suffix=" cm"
                                value={this.state.largura}
                                reset={()=>{
                                    this.setState({largura:null},this.filterItems)
                                }}
                                onChange={(value)=>{
                                    this.setState({largura:value},this.filterItems)
                                }}
                            />
                        </div>

                        <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-2">{/*flex-grow-1*/}
                            <FilterInputRange
                                label="Comprimento"
                                suffix=" cm"
                                value={this.state.comprimento}
                                reset={()=>{
                                    this.setState({comprimento:null},this.filterItems)
                                }}
                                onChange={(value)=>{
                                    this.setState({comprimento:value},this.filterItems)
                                }}
                            />
                        </div>
                        
                        {this.state.marcas.length > 1 && <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-5">{/*flex-grow-1*/}
                            <label>Marca</label>
                            <MultiSelect
                                filter
                                selectAll
                                value={this.state.marcas_select}
                                options={this.state.marcas}
                                scrollHeight={window.innerHeight>300?300:window.innerHeight}
                                optionLabel="nome"
                                optionValue="nome"
                                placeholder="Selecione..."
                                maxSelectedLabels={3}
                                panelHeaderTemplate={()=>{}}
                                selectedItemsLabel="{0} Marcas"
                                // selectedItemTemplate={this.selectedItemTemplate}
                                onChange={(event)=>{
                                    this.setState({marcas_select:event.value},this.filterItems)
                                    
                                    // console.log(event.value)
                                }}
                            />
                        </div>}

                        <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-5">
                            <label>Ofertas & Campanhas</label>
                            <SalesDropdown />
                        </div>

                        <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-2">{/*flex-grow-1*/}
                            <label>Itens sem estoque</label>
                            <div>
                                <ToggleButton
                                    checked={this.state.inventory}
                                    onChange={(e) => this.setState({inventory: e.value})}
                                    onLabel="Exposto"
                                    offLabel="Escondido"
                                    onIcon="pi pi-eye"
                                    offIcon="pi pi-eye-slash"
                                    className="w-full sm:w-10rem"
                                    aria-label="Confirmation"
                                />
                            </div>
                        </div>

                        <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-2">{/*flex-grow-1*/}
                            <label>Itens Expositivos</label>
                            <div>
                                <ToggleButton
                                    checked={this.state.exposition}
                                    onChange={(e) => this.setState({exposition: e.value})}
                                    onLabel="Exposto"
                                    offLabel="Escondido"
                                    onIcon="pi pi-eye"
                                    offIcon="pi pi-eye-slash"
                                    className="w-full sm:w-10rem"
                                    aria-label="Confirmation"
                                />
                            </div>
                        </div>

                        <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-2">{/*flex-grow-1*/}
                            <label>Itens mais vendidos</label>
                            <div>
                                <ToggleButton
                                    checked={this.state.top_products}
                                    onChange={(e) => this.setState({top_products: e.value})}
                                    onLabel="Exposto"
                                    offLabel="Escondido"
                                    onIcon="pi pi-eye"
                                    offIcon="pi pi-eye-slash"
                                    className="w-full sm:w-10rem"
                                    aria-label="Confirmation"
                                />
                            </div>
                        </div>

                    </div>
                </Sidebar>
            </div>
        )
    }
}