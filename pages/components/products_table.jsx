import React, { Component } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { moneyMask } from "../utils/util";
import { ToggleButton } from "primereact/togglebutton";
import localForage from "localforage";
import ProductIcon from "../profile/components/product_photo";
import Barcode from "../sales/components/make_barcode";

export default class ProductsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_products: [],
      products_filters: {},
      products: [],
      frozen_column: null,
    };
  }

  componentDidMount() {
    if (
      this.props.products != undefined &&
      this.state.products.length != this.props.products.length
    ) {
      var filters = {};
      Object.keys(this.props.products?.[0]).map((col, i) => {
        filters[col] = { value: "", matchMode: FilterMatchMode.STARTS_WITH };
      });
      this.setState({ products_filters: filters });
    }
  }

  render() {
    return (
      <div id="products_datatable" style={{}}>
        <DataTable
          // style={{maxWidth:"calc(100vw - 30px)"}}
          scrollHeight="70vh"
          scrollable
          // scrollDirection="both"
          // resizableColumns
          // columnResizeMode="fit"
          // showGridlines
          size="small"
          value={this.props.products}
          emptyMessage="Nenhum resultado encontrado..."
          responsiveLayout="scroll"
          paginator={this.props.products.length > 10 ? true : false}
          paginatorTemplate={
            this.props.products.length > 10
              ? "CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              : null
          }
          currentPageReportTemplate={
            this.props.products.length > 10
              ? "Exibindo {first} à {last} de {totalRecords} registros"
              : null
          }
          rows={this.props.products.length > 10 ? 10 : 0}
          rowsPerPageOptions={
            this.props.products.length > 10 ? [10, 20, 50, 100] : null
          }
          filterDisplay="row"
          filters={this.state.products_filters}
          selectionPageOnly
          selectionMode="row"
          selection={this.state.selected_products}
          onSelectionChange={(e) =>
            this.setState({ selected_products: e.value })
          }
          dataKey="PRODUTO_ID"
        >
          <Column className="p-2 h-5rem" selectionMode="multiple" />

          {this.props.products &&
            this.props.products[0] &&
            this.props.columns.map((col) => {
              if (col == "PRECO") {
                return (
                  <Column
                    sortable
                    key={col}
                    field={col}
                    header={col}
                    body={(row_data) =><div className="flex justify-content-center">
                      {moneyMask(row_data.PRECO)}
                    </div>
                    }
                  />
                );
              }
              if (col == "photo_uid") {
                return (
                  <Column
                    key={col}
                    field={col}
                    frozen
                    body={(row_data) => (
                      <ProductIcon item={row_data?.PRODUTO_ID} size="6" />
                    )}
                  />
                );
              }
              if (col == "COD_BARRA") {
                return (
                  <Column
                    key={col}
                    field={col}
                    body={(row_data) => (
                      <Barcode
                        show_code={false}
                        className="mt-2"
                        data={row_data?.COD_BARRA}
                      />
                    )}
                  />
                );
              }
              return (
                <Column
                //   style={{ minWidth: "300px" }}
                  filter
                //   filterPlaceholder={"filtrar ..."}
                  // showFilterMenu={false}
                  sortable
                  key={col}
                  field={col}
                  frozen={this.state.frozen_column == col}
                  body={(row_data) => {
                    return (
                      <div className="w-full flex text-center justify-content-center">
                        {row_data[col]}
                      </div>
                    );
                  }}
                  header={
                    <div className="flex align-items-center gap-2">
                      <ToggleButton
                        className="p-button-rounded p-2 w-3rem h-3rem"
                        checked={this.state.frozen_column == col}
                        onChange={(e) => {
                          if (e.value) {
                            this.setState({ frozen_column: col });
                          } else if (this.state.frozen_column == col) {
                            this.setState({ frozen_column: null });
                          }
                        }}
                        onIcon="pi pi-lock"
                        offIcon="pi pi-lock-open"
                        onLabel=""
                        offLabel=""
                        style={{
                          width: "50px",
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
                      <h6 className="m-auto w-full flex">{col}</h6>
                    </div>
                  }
                />
              );
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
            label={
              this.state.selected_products.length > 0
                ? this.state.selected_products.length +
                  " Item Selecionado" +
                  (this.state.selected_products.length > 1 ? "s" : "")
                : "Nenhum Selecionado"
            }
          />
        </div>
      </div>
    );
  }
}
