import React from 'react';
import localForage from "localforage";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Calendar } from 'primereact/calendar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';

var companies_db = localForage.createInstance({
    name: "pilarpapeis_db",
    storeName: 'empresas'
});

export default class DateRangeMenu extends React.Component {
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
            calendar_mode:"all"
        }

        this.caledar_icons = {
			"day":{icon:"pi pi-tag",label:'Dia', view:'date', format:'dd M yy'},
            "single":{icon:"pi pi-calendar",label:'Mês', view:'month', format:'MM yy'},
            "range":{icon:"pi pi-arrows-h",label:'Período', view:'month', format:'MM yy'},
			"all":{icon:"pi pi-filter",label:'Tudo', view:'year', format:'yy'},
        }

        this.items = [
            {
                label: 'Modo',
                items: [
					{
                        label: this.caledar_icons.day.label,
                        icon: this.caledar_icons.day.icon,
                        command: () => {
							this.props.setDate([this.state.selected_date_start, this.state.selected_date_end]).then(()=>{
							    this.setState({
									calendar_mode:"day",
									loading:true
								})
							})
                        }
                    },
                    {
                        label: this.caledar_icons.single.label,
                        icon: this.caledar_icons.single.icon,
                        command: () => {
							let date = new Date()
							var date_rage = [
								new Date(date.getFullYear(), date.getMonth(), 1,0,0,0),
								new Date(date.getFullYear(), date.getMonth()+1, 1,0,0,0)
							]
							this.props.setDate(date_rage).then(()=>{
							    this.setState({
									calendar_mode:"single",
									selected_date_start:date_rage[0],
									selected_date_end:date_rage[1],
									loading:true
								})
							})
                        }
                    },
                    {
                        label: this.caledar_icons.range.label,
                        icon: this.caledar_icons.range.icon,
                        command: () => {
                            this.props.setDate([this.state.selected_date_start, this.state.selected_date_end]).then(()=>{
                                this.setState({
									calendar_mode:"range",
									loading:true
								})
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
							let date = new Date()
                            var date_rage = [
								new Date(date.getFullYear(), date.getMonth(), 1,0,0,0),
								new Date(date.getFullYear(), date.getMonth()+1, 1,0,0,0)
							]
							this.props.setDate(date_rage).then(()=>{
                                this.setState({
									calendar_mode:"single",
									loading:true,
									selected_date_start:date_rage[0],
									selected_date_end:date_rage[1]
								})
                            })
                        }
                    },
                    {
                        label: "Ano atual",
                        icon: this.caledar_icons.range.icon,
                        command: () => {
                            const ano = new Date().getFullYear()
							const date_rage = [new Date(ano,0,1),new Date(ano,11,31)]
                            this.props.setDate(date_rage).then(()=>{
                                this.setState({
									calendar_mode:"range",
									loading:true,
									selected_date_start:date_rage[0],
									selected_date_end:date_rage[1]
								})
                            })
                        }
                    },
					{
                        label: "Tudo",
                        icon: this.caledar_icons.all.icon,
                        command: () => {
							const date_rage = [new Date(2022,9,1),new Date()]
                            this.props.setDate(date_rage).then(()=>{
                                this.setState({
									calendar_mode:"all",
									loading:true,
									selected_date_start:date_rage[0],
									selected_date_end:date_rage[1]
								})
                            })
                        }
                    }
                ]
            }
        ];
    }

    // ... (your existing methods)

    render() {
        

        return (
            <div className='flex w-auto justify-content-between'>
                <Menu model={this.items} popup ref={el => this.menu = el} id="popup_menu" />
                
                <div className='flex gap-2'>
                    
                    {this.state.calendar_mode != "all" && <Calendar
                        minDate={new Date(2022,9,1)}
                        maxDate={['single','day'].includes(this.state.calendar_mode)?new Date():this.state.selected_date_end}
                        style={{width:"9rem"}}
                        // disabled={this.state.loading}
                        value={this.state.selected_date_start}
                        view={this.caledar_icons[this.state.calendar_mode].view}
						dateFormat={this.caledar_icons[this.state.calendar_mode].format}
                        onChange={(e)=>{
							var date = e.target.value;
							if(this.state.calendar_mode == 'day'){
								var date_rage = [
									new Date(date.getFullYear(), date.getMonth(), date.getDate(),0,0,0),
									new Date(date.getFullYear(), date.getMonth(), date.getDate(),23,59,59)
								]
								this.props.setDate(date_rage).then(()=>{
									this.setState({
										selected_date_start:date_rage[0],
										selected_date_end:date_rage[1],
										loading:true
									})
								})
							}else if(this.state.calendar_mode == 'single'){
								var date_rage = [
									new Date(date.getFullYear(), date.getMonth(), 1,0,0,0),
									new Date(date.getFullYear(), date.getMonth()+1, 1,0,0,0)
								]
								this.props.setDate(date_rage).then(()=>{
									this.setState({
										selected_date_start:date_rage[0],
										selected_date_end:date_rage[1],
										loading:true
									})
								})
							}else{
								var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1,0,0,0);
								this.props.setDate([firstDayOfMonth,this.state.selected_date_end]).then(()=>{
									this.setState({selected_date_start:firstDayOfMonth,loading:true})
								})
							}
                        }}
                    />}
                    <Button
                        icon={this.caledar_icons[this.state.calendar_mode].icon+" text-xl"}
                        // disabled={this.state.loading}
                        className='p-button-help p-button-outlined bg-black-alpha-50 w-3rem p-2'
                        onClick={(event) => this.menu.toggle(event)}
                        aria-controls="popup_menu"
                    />
                    {this.state.calendar_mode == "range" &&
                        <Calendar
                            maxDate={new Date()}
                            minDate={this.state.selected_date_start}
                            style={{width:"9rem"}}
                            value={this.state.selected_date_end}
                            view={this.caledar_icons[this.state.calendar_mode].view}
							dateFormat={this.caledar_icons[this.state.calendar_mode].format}
                            onChange={(e)=>{
                                var date = e.target.value;
                                var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0,23,59,59);
                                this.props.setDate([this.state.selected_date_start,lastDayOfMonth]).then(()=>{
                                    this.setState({selected_date_end:lastDayOfMonth,loading:true})
                                })
                            }}
                        />
                    }
                </div>
            </div>
        );
    }
}
