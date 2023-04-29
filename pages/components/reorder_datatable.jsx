import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { deepClone, deepEqual, isDeepEqual, var_get, var_set } from '../utils/util';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import { TieredMenu } from 'primereact/tieredmenu';
import ScrollWrapper from './scroll_wrapper';
import ResponsiveWrapper from './responsive_wrapper';

export default class ReorderDatatable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns:[],
            rows: [],
            selectedPosition:[],
            col_order:['move',0],
            selectedCell:null,
            editMode:false
        };


        this.items = [
            
            {
                label:'Nome',
                icon:'pi pi-fw pi-building',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"clientName"
                    })
                    // console.log(this.state.selectedPosition)
                }
            },
            {
                label:'Chamado',
                icon:'pi pi-fw pi-comment',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"callDialog"
                    })
                }
            },
            {
                label:'Situação',
                icon:'pi pi-fw pi-credit-card',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"creditInfo"
                    })
                }
            },
            {
                label:'Pedidos',
                icon:'pi pi-fw pi-chart-bar',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"barChart"
                    })
                }
            },
            {
                label:'Pedido',
                icon:'pi pi-fw pi-chart-pie',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"pieChart"
                    })
                }
            },
            {
                label:'Carrinho',
                icon:'pi pi-fw pi-shopping-cart',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"clientOrder"
                    })
                }
            },
            {
                label:'Materiais',
                icon:'pi pi-fw pi-file',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"clientProducts"
                    })
                }
            },
            {
                label:'Vendedor',
                icon:'pi pi-fw pi-user',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"vendedor"
                    })
                }
            },
            {
                separator:true
            },
            {
                label:'Limpar',
                icon:'pi pi-fw pi-eraser',
                command:()=>{
                    this.props.updateMatrix({
                        mode:"setCell",
                        position:this.state.selectedPosition,
                        value:"empty"
                    })
                }
            }
        ];

        this.showMenu = this.showMenu.bind(this);
        this.changeCell = this.changeCell.bind(this);
        this.deleteProduct = this.deleteProduct.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onColReorder = this.onColReorder.bind(this)
        this.isCellSelectable = this.isCellSelectable.bind(this);
    }

    changeCell(row) {
        console.log(row)
        this.toast.show({severity: 'info', summary: 'Product Selected', detail: Object.values(row)[1]});
    }

    deleteProduct(product) {
        let products = [...this.state.products];
        products = products.filter((p) => p.id !== product.id);

        this.toast.show({severity: 'error', summary: 'Product Deleted', detail: product.name});
        this.setState({ products });
    }

    convertToMap(inputArray) {
        const outputMap = new Map();
        if(!inputArray) return(outputMap)
        const keys = Object.keys(inputArray[0]);
        
        for (let key of keys) {
            const values = inputArray.map((obj) => obj[key]);
            outputMap.set(key, values);
        }
        
        return outputMap;
    }

    convertMapToArray(map) {
        const keys = Array.from(map.keys());
        const values = Array.from(map.values());
        const result = [];
        if(!values[0]) return(result)
      
        for (let i = 0; i < values[0].length; i++) {
            const obj = {};
            for (let j = 0; j < keys.length; j++) {
                const val = values[j][i]
                obj[keys[j]] = typeof(val) == 'function'? <ScrollWrapper className='horizontal-scrollbar overflow-scroll scroll-smooth p-1 min-w-full min-h-full w-auto h-max'>{val()}</ScrollWrapper>:<div className='horizontal-scrollbar'>{val}</div>;
            }
            result.push(obj);
        }
        return result;
    }
    // componentDidUpdate(){
    //     // if(deepEqual(JSON.stringify(this.props.matrix),JSON.stringify(this.state.matrix)) == false){
    //         // console.log(this.props.matrix)
    //         // this.render();    
    //     // }
    // }
    
    componentDidMount() {
        this.draw();
    }
    
    async update(needUpdate){
        // if(!needUpdate) return
        const tabbleMap = new Map(this.convertToMap(this.state.matrix));
        var _columns = Array.from(tabbleMap.keys()).map((d,j)=>{return({field:d,id:j})})
        var _rows = this.convertMapToArray(tabbleMap)
        this.setState({
            rows:_rows,
            columns: _columns,
            matrix:this.props.matrix
        })   
    }
    async draw(update=false){
        // console.log(deepClone(this.props.matrix), this.props.matrix)
        const changed = isDeepEqual(this.props.matrix,this.state.matrix)
        if(update && changed){
            console.log(this.props.matrix,this.state.matrix)
            this.update(true)
            return
        }
        if(this.state.matrix && !changed) return
        this.setState(()=>{return{
            rows:[],
            columns: [],
            matrix:{value:null}
        }},()=>{

            // console.log("DRAW MATRIX", Date.now(), this.props.matrix)
            const tabbleMap = new Map(this.convertToMap(this.props.matrix));
            // console.log(tabbleMap)
            var _columns = Array.from(tabbleMap.keys()).map((d,j)=>{return({field:d,id:j})})
            var _rows = this.convertMapToArray(tabbleMap)
            // console.log(_columns)
            var _indexes = []
            // await var_get("dt-state-client-local-row").then((data_rows)=>{
            //     if(data_rows){
            //         var _rows_local = data_rows.split(',')
            //         if(_rows_local.length == _rows.length){
            //             _rows = _rows_local.map((i)=>{return(_rows[i])})
            //         }
            //         _indexes = _rows_local
            //     }
            // })
            // await var_get("dt-state-client-local-col").then(data_cols=>{
            //     if(data_cols){
            //         this.setState({col_order:data_cols.split(',')})
            //     }
            // })
            // await var_get("dt-state-client-local-edit").then(value=>{
            //     if(value){
            //         this.setState({editMode:value=='true'?true:false})
            //     }else{
            //         this.setState({editMode:false})
            //     }
            // })
            // console.log(_rows,_columns,_indexes)
            this.setState({
                rows:_rows,
                columns: _columns,
                matrix:this.props.matrix
            })
        })
    }
    
    onSelectionChange(e){
        var data = e.value
        var cell = e.originalEvent.target
        while (cell.role != 'cell') {
            cell = cell.parentElement
        }
        // console.log(cell, data)
        
        var _selected = {
            x:parseInt(this.state.col_order[cell.cellIndex]),
            y:data.id
        }

        this.setState({ selectedPosition: _selected })
    
    }
    onColReorder(e) {
        var _col_order = e.columns.map(c=>c.props.field)
        // console.log(this,_col_order)
        this.setState({col_order: _col_order}, () => {
            // var_set("dt-state-client-local-col",_col_order)
        })
        // this.toast.show({severity:'success', summary: 'Column Reordered', life: 3000});
    }

    onRowReorder(e) {
        this.setState({ rows: e.value }, () => {
            // var_set("dt-state-client-local-row",e.value.map((d,i)=>d.id))
        });
    }

    isSelectable(value, field) {
        let isSelectable = true;
        switch (field) {
            case 'move':
                isSelectable = false
                break;
            default:
                break;
        }
        return isSelectable;
    }

    isCellSelectable(event) {
        const data = event.data;
        return this.isSelectable(data.value, data.field);
    }

    showMenu(event){
        // const cell = event.nativeEvent.srcElement
        // console.log(cell,event.target.parentElement.role)
        // var _selected = {
        //     x:cell.cellIndex-1,
        //     y:cell.rowSpan
        // }
        // console.log(_selected)
        // this.setState({ selectedCell: _selected })
        
        // this.cm.style.top = event.clientY
        // this.cm.style.left = event.clientX
    }
    
    render() {
        const dynamicColumns = this.state.columns.map((col,i) => {
            if(col.field == 'id') return
            return <Column
                style={{maxWidth: (90/(this.state.columns.length-1))+'vw', overflowX:"scroll"}}
                headerClassName={this.state.editMode?'pointer-events-auto surface-card':'bg-1 cell-view pointer-events-none'}
                className={'align-content-start ' + (this.state.editMode?'cell-edit ':'bg-1 cell-view ')}
                key={col.field}
                columnKey={col.field}
                field={col.field}
                header={ this.state.editMode && <i className='pi pi-pause'/>}
            />;
        });
        if(!this.props.isMobile){
            return(<div className='overflow-hidden'>
                <ResponsiveWrapper className="mobile-view-matrix">
                    {this.state.rows.map((i,x)=>{
                        // console.log(i)
                        return(<div key={"i_"+x} className='flex flex-wrap text-white'>
                            {Object.keys(i).map((j,y)=>{
                                if(typeof(i[j])=="number" || j == "id")return
                                return(<div 
                                    className='w-full overflow-x-scroll p-3'
                                    key={"i_"+x+"_j_"+y} > 
                                    {i[j]}
                                </div>)
                            })}
                        </div>)
                    })}
                </ResponsiveWrapper>
            </div>)
        }
        return (
            <div className='overflow-hidden'>
                <ResponsiveWrapper className="desktop-view-matrix">
                    <div className='flex p-0 m-0 h-min w-screen ' >
                        <TieredMenu
                            ref={el => this.menu = el}
                            onHide={() => this.setState({ selectedCell: null })}
                            model={this.items}
                            popup
                            // className='absolute top-0 left-0 z-1'
                            // onShow={this.showMenu}
                            // ref={el => this.menu = el}
                            // id="overlay_tmenu"
                        />
                        <Toast ref={(el) => { this.toast = el; }}></Toast>
                        <ContextMenu
                            onShow={this.showMenu}
                            model={this.state.editMode?[
                                {
                                    label: 'Mudar Painel',
                                    icon: 'pi pi-fw pi-sync',
                                    command: (event) => this.menu.show(event.originalEvent)
                                },
                                
                                {
                                    label:'Limpar',
                                    icon:'pi pi-fw pi-eraser',
                                    command:()=>{
                                        this.props.updateMatrix({
                                            mode:"setCell",
                                            position:this.state.selectedPosition,
                                            value:"empty"
                                        })
                                    }
                                },
                                {
                                    separator:true
                                },
                                {
                                    label:"Linha",
                                    icon:'pi pi-fw pi-arrows-h',
                                    items:[{
                                        label:'Nova',
                                        icon:'pi pi-fw pi-plus',
                                        command:(e)=>{
                                            this.props.updateMatrix({mode:"addRow", position: this.state.selectedPosition})
                                        }
                                    },
                                    {
                                        label:'Excluir',
                                        icon:'pi pi-fw pi-trash',
                                        command:(e)=>{
                                            this.props.updateMatrix({mode:"delRow", position: this.state.selectedPosition})
                                        }
                                    }]
                                },
                                {
                                    label:"Coluna",
                                    icon:'pi pi-fw pi-arrows-v',
                                    items:[{
                                        label:'Nova',
                                        icon:'pi pi-fw pi-plus',
                                        command:(e)=>{
                                            this.props.updateMatrix({mode:"addColumn", position: this.state.selectedPosition})
                                        }
                                    },
                                    {
                                        label:'Excluir',
                                        icon:'pi pi-fw pi-trash',
                                        command:(e)=>{
                                            this.props.updateMatrix({mode:"delColumn", position: this.state.selectedPosition})
                                        }
                                    }]
                                },
                                {
                                    separator:true
                                },
                                {
                                    label: 'Salvar',
                                    icon: 'pi pi-fw pi-save',
                                    command: () => {
                                        this.setState({editMode:false})
                                        // var_set("dt-state-client-local-edit",false)
                                    }
                                },
                            ]:[
                                {
                                    label: 'Editar',
                                    icon: 'pi pi-fw pi-pencil',
                                    command: (e) => {
                                        this.setState({editMode:true})
                                        // var_set("dt-state-client-local-edit",true)
                                    }
                                },
                                {
                                    label: 'Copiar',
                                    icon: 'pi pi-fw pi-copy',
                                    command: (e) => {
                                        this.props.updateMatrix({mode:"save"})
                                    }
                                },
                                {
                                    separator:true
                                },
                                {
                                    label: 'Nova',
                                    icon: 'pi pi-fw pi-table',
                                    command: (e) => {
                                        this.setState({editMode:true})
                                        // var_set("dt-state-client-local-edit",true)
                                        this.props.updateMatrix({mode:"reset"})
                                    }
                                },
                            ]}
                            ref={el => this.cm = el}
                            onHide={() => this.setState({ selectedCell: null })}
                        />
                        <div className="position-relative h-min w-full">
                            {this.props.edit != false && <Button
                                icon={this.state.editMode?'pi pi-check':'pi pi-ellipsis-v'}
                                tooltip={this.state.editMode?'Salvar':'Editar'}
                                className={'position-absolute z-1 ' + (this.state.editMode?'p-button-outlined':'p-button-text p-button-secondary')}
                                onClick={(e)=>{
                                    this.setState({editMode:!this.state.editMode})
                                    // var_set("dt-state-client-local-edit",!this.state.editMode)
                                }}
                            />}
                            <DataTable
                                selectionMode={this.state.editMode?"single":false}
                                cellSelection
                                // selection={this.state.selectedCell}
                                isDataSelectable={this.state.editMode && this.isCellSelectable}
                                // onSelectionChange={this.onSelectionChange}
                                dataKey="id"
                                resizableColumns
                                columnResizeMode="fit"
                                showGridlines
                                stateStorage={false}
                                // stateKey={"dt-state-client-local-col-" + this.props.id}
                                className='p-datatable-sm p-0 m-0'
                                // style={{top:this.state.editMode?"0px":"20px"}}
                                value={this.state.rows}
                                reorderableColumns
                                reorderableRows
                                onRowReorder={(e)=>{this.onRowReorder(e)}}
                                onColReorder={this.onColReorder}
                                responsiveLayout="scroll"
                                // onContextMenuCapture={(e)=>{
                                //     console.log(e.nativeEvent)
                                // }}
                                contextMenuSelection={this.state.selectedCell}
                                onContextMenuSelectionChange={this.onSelectionChange}
                                onContextMenu={e => {
                                    // console.log(e.data)
                                    this.cm.show(e.originalEvent)
                                    
                                }}
                                >
                                {<Column
                                    rowReorder={this.state.editMode}
                                    // className='surface-card'
                                    className={this.state.editMode?'surface-card cell-edit w-1':'bg-1 cell-view pointer-events-none'}
                                    field="move"
                                    style={{width: '37px',maxWidth: '37px',minWidth: '37px'}}
                                    resizeable={false}
                                />}
                                {dynamicColumns}
                            </DataTable>
                            {this.state.editMode && <div className='surface-50'>
                                <Button
                                    tooltip='Nova Linha'
                                    className='p-button-secondary p-button-outlined'
                                    icon="pi pi-plus"
                                    onClick={(e)=>{
                                        this.props.updateMatrix({mode:"addRow"})
                                    }}
                                />
                            </div>}
                        </div>
                        {this.state.editMode && <div className='surface-50'>
                            <Button
                                tooltip='Nova Coluna'
                                tooltipOptions={{position:"left"}}
                                className='p-button-secondary p-button-outlined h-min'
                                icon="pi pi-plus"
                                onClick={(e)=>{
                                    this.props.updateMatrix({mode:"addColumn"})
                                }}
                            />
                        </div>}
                    </div>
                </ResponsiveWrapper>
            </div>
        );
    }
}