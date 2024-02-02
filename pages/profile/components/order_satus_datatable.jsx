import React from "react";
import {
  format_mask,
  moneyMask,
  normalize,
  sqlDateToString,
  time_ago,
  var_set,
} from "../../utils/util";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { ConfirmPopup } from "primereact/confirmpopup";
import { ProgressBar } from "primereact/progressbar";
import { withRouter } from "next/router";
import { get_vendedor } from "../../api/firebase";
import { get_data_api } from "../../api/connect";
import { InputText } from "primereact/inputtext";
import DateRangeMenu from "../../components/dateRangeMenu";
import localForage from "localforage";
import ProductIcon from "./product_photo";

const vendedores_db = localForage.createInstance({
  name: "pilarpapeis_db",
  storeName: "vendedores",
});

export default withRouter(
  class OrderStatusDatatable extends React.Component {
    constructor(props) {
      super(props);
      this.original = {
        items_filtered: [],
        display_filters: false,
        data_items: [],
        FINALIZADO: true,
        ORCAMENTO: true,
        PAGAMENTO: [],
        LANCAMENTO: [],
        DATE_RANGE: [],
        search: "",
      };
      this.state = { ...this.original };
    }
    header_button =
      "sm:icon-only p-button-glass-dark border-none shadow-none h-3rem ";
    componentDidMount() {
      get_vendedor(this.props.user.email).then((vendedor) => {
        if (vendedor) {
          get_data_api({
            query: "czNf3SZGTGt7sHgP3S4m",
            keys: [
              { key: "Filial", type: "STRING", value: vendedor.EMPRESA },
              { key: "Cliente", type: "NULL", value: null },
              { key: "Vendedor", type: "NULL", value: null },
              { key: "Status", type: "NULL", value: null },
            ],
          }).then((items) => {
            if (!items) return;
            var _items = items.map((item, index) => {
              item.view_cart = false;
              item.cart = [];
              item.index = index;
              return item;
            });
            // console.log(_items)
            this.setState({ data_items: _items, items_filtered: _items });
          });
        }
      });
      // get_vendedor().then((vendedor)=>{
      // 	if(vendedor){
      // 		console.log(vendedor)
      // 	}
      // })
    }

    actionHeader(rowData) {
      return (
        <Button
          className="p-button-rounded p-button-secondary p-button-outlined"
          // label={this.state.display_filters?"Fechar":"Buscar"}
          icon={this.state.display_filters ? "pi pi-times" : "pi pi-search"}
          onClick={(event) => {
            this.setState({ display_filters: !this.state.display_filters });
            // scrollToBottom()
          }}
        />
      );
    }

    testOnChange(data) {
      // console.log(data)
      // var_set('items_filtered', data.map(c=>c.id))
      // if(this.state.items_filtered.length!=data.length)this.setState({items_filtered:data})
    }
    onViewFilter() {
      if (!this.state.data_items) return;
      var _items_filtered = [...this.state.data_items];
      if(!this.state.FINALIZADO){ _items_filtered = _items_filtered.filter(c=>c.FINALIZADO!=3)}
      // if(!this.state.ORCAMENTO){ _items_filtered = _items_filtered.filter(c=>c.STATUS!=1)}
      // console.log(this.state.search)
      if (this.state.PAGAMENTO.length > 0) {
        _items_filtered = _items_filtered.filter((c) => {
          return this.state.PAGAMENTO.map((c) => c?.code).includes(
            c.ID_PAGAMENTO
          );
        });
      }
      if (this.state.LANCAMENTO.length > 0) {
        _items_filtered = _items_filtered.filter((c) => {
          return this.state.LANCAMENTO.map((c) => c?.code).includes(c.STATUS);
        });
      }
      if (this.state.DATE_RANGE.length > 0) {
        // console.log(this.state.DATE_RANGE)
        _items_filtered = _items_filtered.filter((c) => {
          return (
            new Date(c.EMISSAO) >= this.state.DATE_RANGE[0] &&
            new Date(c.EMISSAO) <= this.state.DATE_RANGE[1]
          );
        });
      }
      if (this.state.search != "") {
        // console.log("---> "+this.state.search)
        // _items_filtered = _items_filtered.filter(c=>{
        // 	return (c.CLIENTE.toLowerCase())
        // })
        var search = this.state.search.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
        var _search_result = {};
        // console.log(search, _items_filtered)
        var search_array = search.split(" ");
        search_array.map((term, index) => {
          _items_filtered.map((item) => {
            if (!item) return;
            if (item.TELEFONE_CLIENTE == undefined) return;
            if (item.TELEFONE_CLIENTE.toString().indexOf(term) == 0) {
              // console.log(item)
              _search_result[item.ID_PEDIDO] = {
                data: item,
                score: search_array.length,
              };
            }
          });
          _items_filtered.map((item) => {
            if (!item) return;
            // console.log(term)
            if (item.DOC_CLIENTE.toString().indexOf(term) == 0) {
              _search_result[item.ID_PEDIDO] = {
                data: item,
                score: search_array.length,
              };
              if (_search_result[item.ID_PEDIDO]) {
                _search_result[item.ID_PEDIDO].score += 1;
              }
            }

            var name_index =
              item.CLIENTE &&
              normalize(item.CLIENTE)
                .toLowerCase()
                .indexOf(normalize(term).toLowerCase());
            if (name_index != -1) {
              _search_result[item.ID_PEDIDO] = {
                data: item,
                score: search_array.length - index,
              };
              if (
                normalize(item.CLIENTE)
                  .toLowerCase()
                  .indexOf(normalize(search).toLowerCase()) != -1
              ) {
                _search_result[item.ID_PEDIDO].score += 1;
              }
            }

            var vendedor_index =
              item.VENDEDOR &&
              normalize(item.VENDEDOR)
                .toLowerCase()
                .indexOf(normalize(term).toLowerCase());
            if (vendedor_index != -1) {
              _search_result[item.ID_PEDIDO] = {
                data: item,
                score: search_array.length - index,
              };
              if (
                normalize(item.VENDEDOR)
                  .toLowerCase()
                  .indexOf(normalize(search).toLowerCase()) != -1
              ) {
                _search_result[item.ID_PEDIDO].score += 1;
              }
            }
          });
        });
        // console.log(_search_result)
        var keysSorted = Object.entries(_search_result);
        keysSorted.sort(function (a, b) {
          return b[1].score - a[1].score;
        });
        if (!keysSorted[0]?.[1]) return [];
        var maxScore = keysSorted[0][1].score;
        const _search_array = keysSorted.map((key) => {
          if (key[1].score < maxScore) {
            return null;
          } else {
            return key[1].data;
          }
        });
        // console.log(_search_array)
        this.setState({ items_filtered: _search_array.filter((i) => i) });
      } else {
        this.setState({ items_filtered: _items_filtered });
      }
    }
    editItem(item, key, value, callback = this.onViewFilter) {
      var _items = [...this.state.data_items];
      var _item = { ...item };
      _item[key] = value;
      let index = _items.findIndex((o) => o.ID_PEDIDO == _item.ID_PEDIDO);
      _items[index] = _item;
      this.setState({ data_items: _items }, callback);
    }
    orderListView() {
      if (this.state.items_filtered) {
        if (this.state.data_items?.length > 0) {
          return (
            <>
              {this.state.items_filtered
                .sort((a, b) => b.ID_PEDIDO - a.ID_PEDIDO)
                .slice(0, 50)
                .map((rowData, i) => {
                  return (
                    <div
                      key={rowData.id + "_" + i}
                      className="flex-wrap hover:border-blue-600 border-2 border-indigo-700 flex w-screen text-white bg-glass-a p-3 hover:bg-black-alpha-50"
                    >
                      <div className="gap-3 flex flex-wrap w-screen h-full align-items-center justify-content-between">
                        <div className="flex h-full w-min flex-wrap justify-content-center gap-2">
                          <Button
                            className="shadow-none p-button-outlined p-button-rounded text-purple-200 border-2 bg-black-alpha-70"
                            disabled={!rowData.ID_DOCUMENTO}
                            icon={
                              rowData.view_cart == "load"
                                ? "pi pi-spin pi-spinner"
                                : rowData.view_cart
                                ? "pi pi-eye-slash"
                                : "pi pi-eye"
                            }
                            label={rowData.ID_PEDIDO}
                            onClick={(e) => {
                              if (rowData.view_cart == "load") return;
                              if (rowData.cart.length > 0) {
                                this.editItem(
                                  rowData,
                                  "view_cart",
                                  !rowData.view_cart
                                );
                                // return
                              } else {
                                this.editItem(rowData, "view_cart", "load");
                                get_data_api({
                                  query: "0tPRw4nOqYil3P9lm38T",
                                  keys: [
                                    {
                                      key: "EMPRESA_ID",
                                      value: rowData.ID_FILIAL,
                                      type: "STRING",
                                    },
                                    {
                                      key: "CLIENTE_ID",
                                      value: rowData.ID_CLIENTE,
                                      type: "STRING",
                                    },
                                    {
                                      key: "NFE",
                                      value: rowData.ID_DOCUMENTO,
                                      type: "STRING",
                                    },
                                  ],
                                }).then((order_data) => {
                                  var _rowData = { ...rowData };
                                  _rowData.cart = order_data;
                                  this.editItem(_rowData, "view_cart", true);
                                  // return(order_data)
                                });
                              }
                            }}
                          />
                          <div className="font-bold">
                            {sqlDateToString(rowData.EMISSAO)}
                          </div>
                          <div>{time_ago(rowData.EMISSAO)}</div>
                        </div>

                        <div className="flex-grow-1 ">
                          <Button
                            className="flex shadow-none gap-2 text-gray-200 cursor-pointer align-items-center p-button-text"
                            tooltip="Filtrar Cliente"
                            onClick={(e) => {
                              this.setState(
                                { search: rowData.DOC_CLIENTE },
                                this.onViewFilter
                              );
                            }}
                          >
                            <h5 className="text-white max-w-50 h-auto">
                              {rowData.CLIENTE}
                            </h5>
                            {(() => {
                              if (rowData.DOC_CLIENTE.length == 14) {
                                return format_mask(
                                  rowData.DOC_CLIENTE,
                                  "##.###.###/####-##"
                                );
                              } else if (rowData.DOC_CLIENTE.length == 11) {
                                return format_mask(
                                  rowData.DOC_CLIENTE,
                                  "###.###.###-##"
                                );
                              } else {
                                return rowData.DOC_CLIENTE;
                              }
                            })()}
                          </Button>
                          <div className="flex w-full justify-content-start gap-2">
                            {rowData.EMAIL_CLIENTE &&
                              rowData.EMAIL_CLIENTE != "---" && (
                                <Button
                                  className="p-button-warning p-1 flex flex-wrap p-button-text gap-3 text-left"
                                  icon="pi pi-envelope"
                                >
                                  {rowData.EMAIL_CLIENTE.split(".,")
                                    .join(";")
                                    .split(",")
                                    .join(";")
                                    .split(";")
                                    .map((email) => {
                                      return (
                                        <>
                                          {email.toLowerCase()}
                                          <br />
                                        </>
                                      );
                                    })}
                                </Button>
                              )}
                            {rowData.WHATSAPP_CLIENTE && (
                              <Button
                                className="p-button-text p-button-success"
                                icon="pi pi-whatsapp"
                                label={
                                  rowData.WHATSAPP_CLIENTE.length == 10
                                    ? format_mask(
                                        rowData.WHATSAPP_CLIENTE,
                                        "(##) ####-####"
                                      )
                                    : format_mask(
                                        rowData.WHATSAPP_CLIENTE,
                                        "(##) #####-####"
                                      )
                                }
                              />
                            )}
                            {rowData.TELEFONE_CLIENTE && (
                              <Button
                                className="p-button-text p-1"
                                icon="pi pi-phone"
                                label={
                                  rowData.TELEFONE_CLIENTE.length < 10
                                    ? format_mask(
                                        rowData.TELEFONE_CLIENTE,
                                        "####-####"
                                      )
                                    : rowData.TELEFONE_CLIENTE.length == 10
                                    ? format_mask(
                                        rowData.TELEFONE_CLIENTE,
                                        "(##) ####-####"
                                      )
                                    : format_mask(
                                        rowData.TELEFONE_CLIENTE,
                                        "(##) #####-####"
                                      )
                                }
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex-wrap max-w-20rem text-gray-200">
                          {rowData.OBSERVACAO}
                        </div>
                        <div className="justify-content-end text-right flex-grow-1">
                          {rowData.ID_DOCUMENTO && (
                            <div className="font-bold text-green-300">
                              Documento: {rowData.ID_DOCUMENTO}
                            </div>
                          )}
                          <div>{rowData.PAGAMENTO}</div>
                          <div>{rowData.LANCAMENTO}</div>
						  <Button
                            className="shadow-none text-cyan-300 hover:text-cyan-100 cursor-pointer align-items-center p-button-text"
                            tooltip="Filtrar Vendedor"
							tooltipOptions={{position:"left"}}
                            onClick={(e) => {
                              this.setState(
                                { search: rowData.VENDEDOR },
                                this.onViewFilter
                              );
                            }}
                          >
                          	<div className="font-bold">{rowData.VENDEDOR}</div>
						  </Button>
                        </div>
                        {rowData.view_cart == "load" && (
                          <div
                            className="flex flex-wrap w-full"
                            style={{ height: "4px" }}
                          >
                            <ProgressBar
                              className="w-full h-full"
                              mode="indeterminate"
                            />
                          </div>
                        )}
                      </div>

                      {rowData.view_cart && rowData.cart.length > 0 && (
                        <div className="flex flex-wrap w-screen">
                          {rowData.cart.length &&
                            rowData.cart.map((item, index) => {
                              return (
                                <div
                                  className="grid bg-black-alpha-70 flex flex-wrap w-full max-w-screen m-1 align-items-center justify-content-between"
                                  key={index + "_" + item.produto_id}
                                >
                                  <div className="flex  flex-wrap align-items-center gap-2 col-8">
                                    <ProductIcon
                                      size={4}
                                      item={item.produto_id}
                                    />
                                    <h5>{item.nome_produto}</h5>
                                  </div>
                                  <h6 className="text-right col-4 flex-grow-1 text-right justify-content-end">
                                    Quantidade: {item.quantidade}
                                    <br />
                                    Valor: {moneyMask(item.valor_unitario)}{" "}
									<br />
                                    Total: {moneyMask(item.valor_unitario*item.quantidade)}{" "}
                                  </h6>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </>
          );
        }
      }
      // this.state.data_items?.length > 0?
      // <div className="flex w-full h-6rem justify-content-center align-items-center">
      // 	<h4 className="text-center" ><i style={{'fontSize': '2em'}} className="pi pi-exclamation-triangle mb-2"/><br />Pedido não encontrado</h4>
      // </div>
      // :
      // <div className=" w-full h-full">
      // 	<ProgressBar mode="indeterminate" />
      // </div>
      // return(<>
      // 	{this.state.items_filtered.map(rowData=>{
      // 		return(rowData.ID_PEDIDO)
      // 	})}
      // </>)
    }
    render() {
      return (
        <div className="flex w-full gap-3 left-0">
          <ConfirmPopup className="max-w-1rem" />
          <div className="w-full">
            <div className="gap-3 p-3 flex w-full h-auto mb-2 justify-content-center align-items-center">
              <DateRangeMenu
                setDate={async (date_range) => {
                  this.setState({ DATE_RANGE: date_range }, this.onViewFilter);
                }}
              />
              <span className="flex w-full h-full p-input-icon-left p-float-label search-field">
                <i className="pi pi-search text-white pl-2" />
                <InputText
                  value={this.state.search}
                  className={this.header_button + " w-full pl-6"}
                  // placeholder='Buscar material por "Nome","ID" ou "Etiqueta"'
                  id="search_bar"
                  icon="pi pi-search"
                  onChange={(event) => {
                    this.setState(
                      { search: event.target.value },
                      this.onViewFilter
                    );
                  }}
                  onKeyDown={(event) => {
                    if (event.keyCode == 13) {
                      // console.log("ENTER")
                      event.target.setSelectionRange(
                        0,
                        event.target.value.length
                      );
                      // this.props.addItemToCart()
                    }
                    // this.get_search()
                  }}
                  onFocus={(event) => {
                    // console.log(event)
                    // this.props.search_focus(event)
                  }}
                  onBlur={(event) => {
                    // this.props.search_blur(event)
                  }}
                />
                <label
                  className="hidden md:flex w-auto h-auto pl-2 ml-3 justify-content-center white-space-nowrap overflow-hidden text-overflow-clip"
                  htmlFor="search_bar"
                >
                  Buscar CLIENTE por <span className="mx-1">Nome</span>,
                  <span className="mx-1">CNPJ</span> ou{" "}
                  <span className="mx-1">Telefone</span>
                </label>

                {/* <label className="block md:hidden flex w-auto h-auto pl-2 ml-3 justify-content-center white-space-nowrap overflow-hidden text-overflow-clip" htmlFor="search_bar">
						Buscar...
					</label> */}
              </span>
              <MultiSelect
                className="p-column-filter text-white h-full flex p-1 rounded"
                maxSelectedLabels={3}
                value={this.state.PAGAMENTO}
                options={
                  this.state.data_items?.reduce(
                    (acc, item) => {
                      if (!acc.codes.has(item.ID_PAGAMENTO)) {
                        acc.codes.add(item.ID_PAGAMENTO);
                        acc.result.push({
                          name: item.PAGAMENTO,
                          code: item.ID_PAGAMENTO,
                        });
                      }
                      return acc;
                    },
                    { codes: new Set(), result: [] }
                  ).result
                }
                // itemTemplate={this.representativesItemTemplate}
                onChange={(e) => {
                  console.log(e.value);
                  // options.filterCallback(e.value)
                  // this.setState({PAGAMENTO:e.value})
                  // if(e.value.length!=0)
                  this.setState({ PAGAMENTO: e.value }, this.onViewFilter);
                }}
                optionLabel="name"
                placeholder="Formas de Pagamento"
              />

              <MultiSelect
                className="p-column-filter text-white h-full flex p-1 rounded"
                maxSelectedLabels={3}
                value={this.state.LANCAMENTO}
                options={
                  this.state.data_items?.reduce(
                    (acc, item) => {
                      if (!acc.codes.has(item.STATUS)) {
                        acc.codes.add(item.STATUS);
                        acc.result.push({
                          name: item.LANCAMENTO,
                          code: item.STATUS,
                        });
                      }
                      return acc;
                    },
                    { codes: new Set(), result: [] }
                  ).result
                }
                // itemTemplate={this.representativesItemTemplate}
                onChange={(e) => {
                  console.log(e.value);
                  // options.filterCallback(e.value)
                  // this.setState({LANCAMENTO:e.value})
                  // if(e.value.length!=0)
                  this.setState({ LANCAMENTO: e.value }, this.onViewFilter);
                }}
                optionLabel="name"
                placeholder="Status do pedido"
              />
              {/* <ToggleButton
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
				/> */}
            </div>

            {this.state.data_items?.length == 0 && (
              <ProgressBar mode="indeterminate" />
            )}
            {this.orderListView()}
            {/* <DataTable
					className="w-max"
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
						<Column key="emissao" field="EMISSAO" header="Emissão" filter filterPlaceholder="Buscar por data..." showFilterMenu={false} sortable body={(rowData)=>{
							return(time_ago(rowData.EMISSAO) +" "+ sqlDateToString(rowData.EMISSAO))
						}}></Column>
						

						<Column filterField="ID_PAGAMENTO" filterElement={this.pagamentoFilterTemplate} key="code" field="ID_PAGAMENTO" header="Pagamento" filter showFilterMenu={false} sortable body={(rowData)=>{
							return(rowData.PAGAMENTO)
						}}></Column>

						<Column key="OBSERVACAO" field="OBSERVACAO" header="Observação"></Column>
						<Column key="LANCAMENTO" field="LANCAMENTO" header="Status"></Column>
						<Column key="ID_VENDEDOR" field="ID_VENDEDOR" header="Vendedor" body={(rowData)=>{
							return(rowData.VENDEDOR +" ("+ rowData.ID_VENDEDOR+")")
						}}></Column>
						<Column style={{ maxWidth: '30em' }} key="name" field="CLIENTE" header="Cliente" filter filterPlaceholder="Buscar por nome..." showFilterMenu={false} sortable></Column>
						
						
						<Column style={{ minWidth: '12em' }} key="DOC_CLIENTE" field="DOC_CLIENTE" body={(rowData)=>{
							if(rowData.DOC_CLIENTE.length == 14){
								return(format_mask(rowData.DOC_CLIENTE,"##.###.###/####-##"))
							}else if(rowData.DOC_CLIENTE.length == 11){
								return(format_mask(rowData.DOC_CLIENTE,"###.###.###-##"))
							}else{
								return(rowData.DOC_CLIENTE)
							}
						}} header="Documento" filter filterPlaceholder="Buscar por documento..." showFilterMenu={false}></Column>
						<Column key="EMAIL_CLIENTE" field="EMAIL_CLIENTE" className="lowercase" header="Email" body={(rowData)=>{
							if(rowData.EMAIL_CLIENTE){
								return(rowData.EMAIL_CLIENTE.split('.,').join(' '))
							}else{
								return('') 
							}
						}}></Column>
						<Column style={{ minWidth: '11em' }} key="TELEFONE_CLIENTE" field="TELEFONE_CLIENTE" body={(rowData)=>{
							if(!rowData?.TELEFONE_CLIENTE){
								return("")
							}else if(rowData.TELEFONE_CLIENTE.length == 10){
								return(format_mask(rowData.TELEFONE_CLIENTE,"(##) ####-####"))
							}else if(rowData.TELEFONE_CLIENTE.length == 11){
								return(format_mask(rowData.TELEFONE_CLIENTE,"(##) #####-####"))
							}else{
								return(rowData.TELEFONE_CLIENTE)
							}
						}} header="Telefone" filter filterPlaceholder="Buscar por telefone..." showFilterMenu={false}></Column>

						<Column style={{ minWidth: '11em' }} key="WHATSAPP_CLIENTE" field="WHATSAPP_CLIENTE" body={(rowData)=>{
							if(!rowData?.WHATSAPP_CLIENTE){
								return("")
							}else if(rowData.WHATSAPP_CLIENTE.length == 10){
								return(format_mask(rowData.WHATSAPP_CLIENTE,"(##) ####-####"))
							}else if(rowData.WHATSAPP_CLIENTE.length == 11){
								return(format_mask(rowData.WHATSAPP_CLIENTE,"(##) #####-####"))
							}else{
								return(rowData.WHATSAPP_CLIENTE)
							}
						}} header="Whatsapp" filter filterPlaceholder="Buscar por whatsapp..." showFilterMenu={false}></Column>

					
				</DataTable> */}
          </div>
        </div>
      );
    }
  }
);
