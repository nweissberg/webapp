import { Component } from "react";
import { Dialog } from 'primereact/dialog';
import { isDeepEqual, moneyMask } from "../../utils/util";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import localForage from "localforage";

const pedidos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

export default class SaleInfo extends Component{
    constructor(props){
        super(props)
        this.state={
            sale:{...this.props.sale},
            sale_original:{...this.props.sale}
        }
    }
    componentDidUpdate(){
        if(isDeepEqual(this.state.sale_original, this.props.sale) == false){
            this.setState({sale:{...this.props.sale}, sale_original:{...this.props.sale}})
        }
    }
    render(){
        var sale_total = this.state.sale.items.length > 0 ? this.state.sale.items.map((item)=>{return((item.sale_price-(item.sale_price*(item.discount/100)))*item.quantity)}).reduce((sum,i)=> sum + i) : 0
        return(
            <Dialog
                draggable={false}
                resizable
                visible={ this.props.show }
                style={{ width: 'auto'}}
                onHide={()=>{
                    // console.log(this.state.sale_original)
                    this.props?.onHide(this.state.sale_original)
                }}
                onShow={()=>{
                    this.setState({
                        sale:this.state.sale,
                        sale_original:{...this.state.sale}
                    })
                }}
                header="Editar pedido"
                footer={
                    <div className="flex justify-content-between" style={{marginTop:"10px", width:"100%"}}>
                        <Button
                            icon="pi pi-trash"
                            className="p-button-outlined p-button-sm p-button-danger"
                            label="Excluir pedido"
                            onClick={(event)=>{
                                // this.props.removeItem(this.state.item)
                                pedidos_db.removeItem(this.props.user_uid)
                                this.props.updateSale({name:'',items:[]});
                            }}
                        />
                        <Button
                            disabled={isDeepEqual(this.state.sale_original, this.state.sale)}
                            icon="pi pi-save"
                            iconPos="right"
                            className="p-button-outlined p-button-sm"
                            label="Salvar Alterações"
                            onClick={(event)=>{
                                pedidos_db.setItem(this.props.user_uid, this.state.sale)
                                this.props.updateSale(this.state.sale);
                            }}
                        />
                    </div>
                }
            >
                <div className="p-fluid grid formgrid">
                    <div className="field col-6">
                        <label>Nome</label>
                        <InputText
                            value={this.state.sale.name}
                            onChange={(event)=>{
                                console.log(event.target.value)
                                var _sale = {...this.state.sale}
                                _sale.name = event.target.value
                                this.setState({sale:_sale})
                            }}
                        />
                    </div>
                    
                    <div className="field col-6" style={{
                        whiteSpace:"nowrap",
                        overflowX:"scroll"
                    }}>
                        <label>Total</label>
                        <h3>{moneyMask(sale_total)}</h3>
                    </div>
                </div>
            </Dialog>
        )
    }
}