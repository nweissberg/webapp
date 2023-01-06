import React, { Component } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
// import { SalesService } from '../service/sales_service';

export default class SalesDropdown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: [
                {name:"Oferta",value:1},
                {name:"Mais uma Campanha",value:2},
                {name:"Campanha",value:3},
                {name:"Super Oferta",value:4},
                {name:"Natal",value:5},
                {name:"Volta as Aulas",value:4},
                {name:"Ano Novo",value:4},
            ],
            selectedCountry2: null,
            filteredCountries: null,
        };

        this.searchCountry = this.searchCountry.bind(this);
        this.itemTemplate = this.itemTemplate.bind(this);
        // this.countryservice = new SalesService();
    }

    componentDidMount() {
        // this.countryservice.getCountries().then(data => this.setState({ countries: data }));
    }

    searchCountry(event) {
        setTimeout(() => {
            let filteredCountries;
            if (!event.query.trim().length) {
                filteredCountries = [...this.state.countries];
            }
            else {
                filteredCountries = this.state.countries.filter((country) => {
                    return country.name.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }

            this.setState({ filteredCountries });
        }, 250);
    }

    itemTemplate(item) {
        return (
            <div className="country-item">
                <div>{item.name}</div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {/* <h5>Dropdown, Templating and Force Selection</h5> */}
                <AutoComplete
                    value={this.state.selectedCountry2}
                    suggestions={this.state.filteredCountries}
                    completeMethod={this.searchCountry}
                    field="name"
                    dropdown
                    forceSelection
                    itemTemplate={this.itemTemplate}
                    onChange={(e) => this.setState({ selectedCountry2: e.value })}
                    aria-label="Countries"
                />
            </div>
        )
    }
}