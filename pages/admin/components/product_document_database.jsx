import React from "react";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { DataScroller } from "primereact/datascroller";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { get_all_data, get_paginated_data } from "../../api/firebase";
import { moneyMask } from "../../utils/util";

export default class ProductDatabase extends React.Component {
  constructor(props) {
    super(props);
    this.default = {
      items: null,
      selected: [null, null, null],
      filter: [null, null, null],
    };
    this.state = { ...this.default };
    this.itemTemplate = this.itemTemplate.bind(this);
    this.filteredValue = this.filteredValue.bind(this);
  }

  componentDidMount() {
    get_paginated_data("products","ID",10000).then((items) => {
      if (!items) return null;
      var _docs = [];
      items.forEach((doc) => {
        var doc_data = doc.data();
        _docs.push(doc_data);
      });

      this.setState({
        items: _docs,
        selected: [_docs[0].ID, ...this.state.selected.slice(1)],
      });
      // console.log(_docs)
    });
  }
  itemTemplate(item, index) {
    return (
      <Button
        className={
          "w-full flex " +
          (this.state?.selected[index] === item.ID
            ? "p-button"
            : "p-button-text")
        }
        label={item.ID}
        onClick={() => {
          this.setState({
            selected: [item.ID, null,null],
          });
        }}
      />
    );
  }
  filteredValue() {
    if (this.state.filter[0] === null) return this.state.items;

    let filtered = this.state.items.filter((item) => {
      if (!this.state.filter[0]) return item;
      if (item.ID == this.state.filter[0]) return item;
    });
    if (filtered.length == 1)
      this.setState({
        selected: [filtered[0].ID, ...this.state.selected.slice(1)],
      });
    return filtered;
  }
  render() {
    if (!this.state.items || this.state.items == null)
      return (
        <div>
          <ProgressBar mode="indeterminate" />
        </div>
      );
    return (
      <div className="flex">
        <div className="w-15rem">
          <DataScroller
            value={(() => {
              return this.filteredValue();
            })()}
            itemTemplate={(item) => {
              return this.itemTemplate(item, 0);
            }}
            rows={20}
            inline
            scrollHeight="500px"
            header={
              <Dropdown
                className="flex w-full"
                value={this.state.selected}
                // options={sortUsers()}
                // onChange={onUsersChange}
                optionLabel="ID"
                filter
                showClear
                filterBy="ID"
                // placeholder={'Encontre uma pessoa...'}
                // valueTemplate={selectedusersTemplate}
                // itemTemplate={usersOptionTemplate}
              />
            }
          />
        </div>
        <div className="w-20rem mt-7 flex">
          {this.state.selected[0] && (
            <div className="w-full ">
              {(() => {
                const item = this.state.items.find(
                  (item) => item.ID == this.state.selected[0]
                );
                return Object.keys(item).map((key) => {
                  if (!item[key]) return <div key={key}></div>;
                  return (
                    <div
                      key={key}
                      className="flex w-full justify-content-between gap-3"
                    >
                      <h5 className="text-gray-500">{key}</h5>
                      <p className="text-right">
                        {typeof item[key] === "object"
                          ? item[key].map((arr,index) => (
                              <p key={index} className="text-right">
                                {key === "PRECOS"
                                  ? <Button label={moneyMask(arr.VALOR)} className={
																		"w-full flex " +
																		(this.state?.selected[1] === index
																			? "p-button"
																			: "p-button-text")
																	}onClick={() => {
																		this.setState({
																			selected: [this.state.selected[0],index,null],
																		});
																	}}/>
                                  : JSON.stringify(arr)}
                              </p>
                            ))
                          : item[key]}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }
}
