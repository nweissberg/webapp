import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { api_call, api_get, get_data_api } from "../../api/connect";
import { capitalize, moneyMask, print, scrollToBottom, scrollToTop, shorten, sum_array, time_ago, time_until, var_get, var_set } from "../../utils/util";
import { Sidebar } from "primereact/sidebar";
// import GoogleMap from "../../components/maps";
import PieChart from "../../components/chart_pie";
import BarChart from "../../components/chart_bar";
import CallDialog from "./call_dialog";
import ProductIcon from "./product_photo";
import { ProgressSpinner } from "primereact/progressspinner";
import ClientSearch from "../../client/components/client_search";
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import ReorderDatatable from "../../components/reorder_datatable";
import { withRouter } from "next/router";
import Clients_datatable from "./clients_datatable";
import { ProgressBar } from "primereact/progressbar";
import LineChart from "../../components/chart_line";
// import { TabView, TabPanel } from 'primereact/tabview';
import ProductSidebar from "../../sales/components/product_sidebar";
import OrderCarousel from "./orders_carousel";
import GroupIcons from "../../components/groups_icons";
import ProductsViewer from "../../components/products_viewer";
import ScrollWrapper from "../../components/scroll_wrapper";
import DateRangePicker from "../../components/date_interval_filter";
import UndoableEditor from "../../../contexts/UndoableEditor";
import { add_data, get_data, query_data } from "../../api/firebase";



class ClientDashboard extends React.Component{
	constructor(props){
		super(props)
		this.models={
			chamado:{
				icon:"pi pi-comments",
				matrix:[
					["clientName"],
					["callDialog"],
				]
			},
			pedidos:{
				icon:"pi pi-shopping-cart",
				matrix:[
					["clientOrders"],
					["salesGroups"],
					["productsView"],
				]
			},
			dashboard:{
				icon:"pi pi-chart-line",
				matrix:[
					["clientProducts","pieChart"],
					["clientOrders","barChart"],
				]
			}
		}
		let _matrix =  this.props.router.query.p || "chamado"
		// console.log(_matrix)
		this.default={
			client:null,
			clients:[],
			show_dashboard:false,
			// client_credit:null,
			client_calls:[],
			history:{},
			client_orders:[],
			client_products:[],
			client_address:null,
			selected_product: null,
			selected_item:null,
			item_index:-1,
			selected_order:null,
			loading:false,
			selected_group:null,
			selected_view: _matrix,
			matrix:this.models[_matrix]?.matrix,
			search_result:[]
		}
		this.state={ ...this.default}
		
		this.undoable = null
		this.header = this.header.bind(this)
		this.reloadMatrix = this.reloadMatrix.bind(this)
		this.matrix_button = this.matrix_button.bind(this)
		this.render_dashboard = this.render_dashboard.bind(this)
		
		this.widgets = (component='empty',parent='_root')=>{
			var ret_component = null
			switch (component) {
				case 'empty':
					ret_component = <></>

					break;
				case 'clientName':
					ret_component = <div className="flex flex-grow-1 text-center flex-wrap w-full h-auto justify-content-center gap-2 align-items-center">
						<h5 className=" text-overflow-ellipsis overflow-hidden hide_on_phone" style={{color:"var(--text-c)"}}>{this.state.client?.razao_social}</h5>
						<h4 className="white-space-normal text-white">{this.state.client?.fantasia}</h4>
					</div>

					break;
				case 'vendedor':
					ret_component = <div className="flex w-full h-max justify-content-between align-items-between p-5">
						<label style={{color:"var(--text-c)"}}>Responsável:</label>
						<h6 className="white-space-normal text-right text-bluegray-300">{this.state.client?.vendedor_nome}</h6>
					</div>
					break;
				case 'creditInfo':
					ret_component = <div className="flex-grow-1 justify-items-between field w-full h-auto max-h-min justify-content-center align-items-center p-3">
						{this.credit_info()}
						{this.state.client_orders != null && this.order_info()}
					</div>
					break;
				case 'callDialog':
					ret_component = <>
						<CallDialog
							fullScreen
							client={this.state.client}
							user={this.props.user}
							all_users={this.props.all_users}
							onUpdate={(data)=>{
								// console.log(data)
								this.undoable.onEdit("call_data",data)
							}}
							onSend={(data)=>{
								// console.log(data)
								var _data = ['selectedChannel','made_contact', 'call_return_date', 'call_description']
								if(data.got_problem) _data = [ ... _data, 'help_user', 'help_description' ]
								var callData = Object.fromEntries(Object.entries(data).filter(([key]) => _data.includes(key)));
								callData['client'] = this.state.client.id
								add_data('calls', callData).then((doc_uid) => {
									console.log(doc_uid)
								})
							}}
						/>
						{this.props.client && <UndoableEditor
							uid={this.props.client.id+"_call_history"}
							onLoad={(fns)=>{this.undoable = fns}}
							object={this.state.history}
							setObject={(_history)=>{
								// print(_history.call_data)
								this.setState({history:_history, call_data: _history.call_data})
								// this.props.onChange?.(this.state.finalTranscript)
							}}
						/>}
					</>
					break;
					
				case 'barChart':
					ret_component = <div className=" flex w-max h-auto" >
						<BarChart
							ref={(el)=> this.chart_bar = el}
							orders={this.state.client_orders}
							selected_order={this.state.selected_order}
							selected_item={this.state.selected_product}
							onSelect={(_selected_order)=>{
								this.setState(()=>({selected_order:_selected_order}))
							}}
						/>
					</div>
					break;
				case 'pieChart':
					ret_component = <div className="flex w-auto h-auto">
						<PieChart
							order={this.state.selected_order}
							selection={this.state.selected_product}
							onSelect={(_item)=>{
								// this.chart_bar?.onItemSelect(_item)
								this.setState({selected_product:_item})
							}}
						/>
					</div>
					break;

				case 'clientProducts':
					ret_component = <div className=" flex gap-1 w-auto justify-content-end ">
						{this.state.client_products.map((i,key)=>{
							if(!i.PRODUTO_ID)return
							let isSelected = (this.state.selected_product?.id == i.PRODUTO_ID)
							return(<div id={"product_"+i.PRODUTO_ID}
								
								onClick={()=>{
									// console.log(i)
									var item = {...i, id:i.PRODUTO_ID}
									if(isSelected){
										this.setState({selected_item:item})
									}
									// this.chart_bar?.onItemSelect(item)
									this.setState({selected_product:item})
								}}
								
								key={"product_"+i.PRODUTO_ID+"_"+key+parent}
								className={"cursor-pointer flex mb-2 p-1 border-round-md align-content-between "+ (isSelected?"h-auto hover:bg-black-alpha-60 bg-black-alpha-20 border-2 border-blue-400 w-18rem p-2 gap-2" : " flex-wrap h-auto w-min hover:bg-white-alpha-20 bg-white-alpha-10")}>
								<div className="flex flex-wrap w-full">
									<div className={"flex gap-2 mb-2 " + (isSelected?"":"flex-wrap")}>
										<ProductIcon size={isSelected?4:7} item={i.PRODUTO_ID}/>
										<label className={"cursor-pointer flex white-space-normal text-sm mt-2 top-0 " + (isSelected?" text-blue-100 " : " text-white ")}>{isSelected?i.PRODUTO_NOME:shorten(i.PRODUTO_NOME)}</label>
									</div>
		
									{isSelected && <LineChart orders={i.ESTADOS} />}
								</div>
							</div>)
						})}
					</div>
					break;

				case 'clientLocation':
					if(!this.state.client_address)return(<></>)
					ret_component = <div className="flex flex-grow-1 align-items-start flex-wrap w-full h-auto">
						<div className="w-full h-max">
							{/* <GoogleMap
								location={this.state.client_address.location}
								title="TESTE GMAPS"
								updateLocation={(newLocation)=>{
									console.log(newLocation)
								}}
							/> */}
						</div>
						<div className={`
							grid mt-4
							flex flex-grow-1
							w-full h-min
							justify-content-between
							align-items-center
						`}>
							
							<Button 
								icon='pi pi-copy text-2xl text-green-400'
								iconPos="right"
								className={'p-button-text'}
							/>
							
							<h6 className={`
								white-space-normal
								w-10rem h-min
								flex-grow-1
								text-white
								p-2 col-8
								text-center
							`}>
								{this.state.client_address.address}
							</h6>
							
							<Button label='Abrir no Maps'
								icon='pi pi-map text-2xl'
								className={`
									col-2 md:icon-only
									flex
									p-button-outlined
									w-auto h-min p-2
									md:border-round-md
									border-3 border-red-900
									border-circle
									text-white font-bold
									white-space-nowrap
									bg-red-500
								`}
							/>
							
						</div>
					</div>
					break;
					
				case 'clientOrders':
					ret_component = <OrderCarousel
						client={true}
						currentUser={false}
						selected_product={this.state.selected_product}
						selected_order={this.state.selected_order}
						orders={this.state.all_orders}
						view={(order)=>{
						}}
						link={(data)=>{
						}}
						callback={(order)=>{
							console.log("Devolver " + order)    
						}}
						onSelect={data => {
							// console.log(data)
							// this.chart_bar?.onItemSelect?.(data)
							this.setState({ selected_product: data })
						}}
						selectOrder={(_selected_order)=>{
							this.setState(()=>({selected_order:_selected_order}) )
						}}
						delete={(name)=>{
							console.log("Delete", name)
	
						}}
					/>
					break; 
					
				case 'productsView':
					if(this.state.search_result.length == 0) ret_component = <></>
					
					ret_component = <div className="">
						<ProductsViewer
							products={this.state.search_result}
							scroll={30}
							cart={null}
							onSelect={(data)=>{
								var item = {...data, id:data.PRODUTO_ID}
								this.setState({ selected_product: item,selected_item:item })
							}}
							updateProducts={(e)=>{console.log(e)}}
							onAddProduct={(e)=>{console.log(e)}}
							onSubProduct={(e)=>{console.log(e)}}
						/>
					</div>
				
					break;

				case 'salesGroups':
					ret_component = <div className="flex flex-grow-1 w-full h-screen mt-8 align-items-start">
						<div id="" className="scrollbar-none z-0 relative left-0 overflow-scroll pt-8 mt-4 w-screen min-h-30rem" >
							<GroupIcons
								className=''
								groups={this.props.groups}
								selected={this.state.selected_group}
								client={this.props.client}
								load={this.props.load_products_group}
								load_client={this.state.client_products}
								searchGroup={(data,group)=>{
									console.log(data,group)
									// scrollToBottom()
									this.setState({
										selected_group:group,
										search_result:data,
										scroll_position:0
									})
								}}
							/>
						</div>
					</div>
					break;
				case 'salesFooter':
					if(this.state.selected_group == null){
						ret_component = <></>
						break;
					}
					ret_component = <div className="fixed w-screen bottom-0 left-0 z-1">
						<div className="flex w-full h-10rem bg-gradient-bottom absolute bottom-0 left-0 z-0"/>
						<div className="fadeindown animation-duration-300 animation-ease-out animation-iteration-1 z-1 flex w-full h-5rem bg-glass-c bg-blur-3">    
							<Button className="p-button-lg p-button-text text-blue-300" label="Grupos" icon="pi pi-chevron-left"
								onClick={(e)=>{
									this.setState({
										selected_group:null,
										search_result:[]
									})
								}}
							/>
							<div className="fadein animation-duration-500 animation-iteration-1 animation-ease-in justify-content-end w-full flex z-1 relative">
								<img className="absolute bottom-0 h-4rem sm:h-4 rem md:h-5rem lg:h-6rem w-auto border-circle mb-4 border-3 border-white shadow-3 z-2" 
									src={`images/grupos/${this.state.selected_group?.id?this.state.selected_group.id:this.state.selected_group}_foto.jpg`}>
								</img>
							</div>
						</div>
					</div>
					break;
				default:
					break;
				
			}
			return ret_component
		}
		this.widgets = this.widgets.bind(this)
	}
	componentDidMount(){
		// console.log(this.props?.client_credit)
		if(this.props?.fullScreen){
			this.load_client()
		}
	}
	
	componentDidUpdate(){
		// console.log(this.state.history.call_data)
		// this.chart_bar?.draw_chart()
		let item_index = this.state.client_products.findIndex(i=>i.PRODUTO_ID==this.state.selected_product?.id)
		if(this.state.selected_product && this.state.item_index != item_index){
			// console.log("index", item_index, "last",this.state.item_index)
			const divElement = document.getElementById("product_"+this.state.selected_product.id)
			// console.log(this.state.selected_product)
			if(!divElement) return
			const parentElement = divElement.parentElement.parentElement;
			// console.log(parentElement.scrollLeft)
			if(this.state.item_index < item_index && this.state.item_index != -1){
				parentElement.scrollTo(divElement.offsetLeft - 200 ,0)
			}else{
				parentElement.scrollTo(divElement.offsetLeft - 30 ,0)
			}
			this.setState({item_index:item_index})
		}   

		if(this.props.client?.id != this.state.client?.id){
			this.load_client(this.props.client)
		}
	}

	load_client(_client){
		var client = _client? _client:this.props.client
		if(!client) return
		
		this.setState({...this.default, client:client, loading:true})

		switch (this.state.selected_view?.toLowerCase()) {
			case 'chamado':
				this.get_calls(client)
				this.get_orders(client.id.toString())
			break;
			case 'pedidos':
				this.get_products(client).then((data)=>{
					if(data) this.setState({client_products:data})
					this.get_orders(client.id.toString())
				})
			break;
			case 'dashboard':
				this.get_products(client).then((data)=>{
					if(data) this.setState({client_products:data})
					this.get_orders(client.id.toString())
				})
			break;
			default:
			break;
		}
	}

	get_orders(){
		if(!this.props.pedidos_cliente) return
		var _client_orders = this.props.pedidos_cliente
		
		if(_client_orders.length == 0){
			this.setState({client_orders:null})
		}else{
			const sort_orders = _client_orders.sort((a,b)=>a.id-b.id)
			const all_orders = sort_orders.map((o,i)=>{
				o.index = i
				return o
			})
			const last_order = [...all_orders].pop()

			this.setState({
				all_orders:all_orders,
				selected_order:last_order,
				client_orders:all_orders
				// pieChartData:_pieChartData
			},()=>{
				this.chart_bar?.draw_chart(all_orders)
			})
		}
	}
 
	credit_info(){
		if(this.props.client_credit == null){
			return(
				<Skeleton height="24px" className="mb-2"/>
			)
		}else{
			if(this.props.client_credit == 0){
				return(<div className="flex align-items-start justify-content-between gap-2">
					<h5 style={{color:"var(--text-c)"}}>Não pussuí: </h5>
					<Button label="Solicitar"
						className="p-button-outlined p-button-secondary p-button-rounded pt-0 pb-0"
					/>
				</div>)
			}
			return(<div className="flex align-items-start justify-content-between gap-2">
				<h5 style={{color:"var(--text-c)"}}>Limite de Crédito: </h5>
				<h5 className="text-bluegray-300" >{moneyMask(this.props.client_credit)}</h5>
			</div>)
		}
	}

	data_line(label,data,color="var(--text)"){
		return(<div className="flex align-items-start justify-content-between gap-2">
			<h5 style={{color:"var(--text-c)", whiteSpace:"nowrap"}}>{label}</h5>
			<h5 style={{color:color}}>{data}</h5>
		</div>)
	}
	order_info(){
		if(this.state.client_orders == null){
			return(<></>)
		}
		const total_orders = this.state.client_orders.length
		if(total_orders != 0){
			var order_sum = this.state.client_orders.map((order)=>{
				return order.total
			})
			
			var orders_total = sum_array(order_sum)

			return(<div>
				{this.data_line(`${total_orders} pedidos:`,moneyMask(orders_total))}
				{total_orders > 2 && this.data_line("Maior:",moneyMask(order_sum.sort((a,b)=>b-a)[0]),"var(--success)")}
				{total_orders > 2 && this.data_line("Menor:",moneyMask(order_sum.sort((a,b)=>a-b)[0]),"var(--warn)")}
				{total_orders > 1 && this.data_line("Média:",moneyMask(orders_total/total_orders))}
			</div>)
		}else{
			return(<div>
				<Skeleton height="24px" className="mb-2"/>
				<Skeleton height="24px" className="mb-2"/>
				<Skeleton height="24px" className="mb-2"/>
				<Skeleton height="24px" className="mb-2"/>
			</div>)
		}
	}
	get_order_index(order){
		var item_index = -1
		this.state.all_orders.find((i,index)=>{if(i.id==order.id)item_index=index})
		return(item_index)
	}

	get_products(client){
		return this.props.load_products_client(client.id)
	}

	get_calls(){
		query_data('calls',{
			'client': ['==', this.props.client.id],
			"users": {
				"mode":"or",
				"user_uid": ['==', this.props.user.uid],
				"help_user.uid": ['==', this.props.user.uid]
			}
		}).then(data => {
			var _docs = []
			data.forEach((doc)=>{
				var doc_data = doc.data()
				doc_data.call_return_date = doc_data.call_return_date.toDate()
				doc_data.enviado = doc_data.enviado.toDate()
				_docs.push(doc_data)
			})
			this.setState({client_calls:_docs})
		})
	}

	reloadMatrix(_matrix,callback=()=>{}){
		this.setState({loading:true},()=>{
			this.setState({matrix:_matrix},()=>{
				this.setState({loading:false},()=>{callback()})
			})
		})
	}
	render_dashboard(){
		var channels = {
			"WHATS":"Whatsapp",
			"CALL":"Telefone",
			"EMAIL":"Email",
			"APP":"Mensagem",
			"FACE":"Facebook",
			"INSTA":"Instagram",
			"LOCAL":"Visita",
			"WEB":"Site Cliente"
		}
		const footer_button = "flex w-auto p-4 h-full bg pt-1 pb-1 m-0 pl-2 pr-2 p-button-text shadow-none p-button-lg p-button-rounded "

		switch (this.state.selected_view?.toLowerCase()) {
			case 'chamado':
				return(<div className="flex w-auto min-w-screen h-full flex-grow-1 m-0 justify-content-center align-items-start ">
					<div className="bg-glass-b min-h-30rem h-auto bg-blur-1 flex flex-wrap grid justify-content-between w-full m-0 p-0 pt-4">
						<div className=" flex flex-wrap md:col-12 lg:col-2 flex-grow-1">
							{/* {this.widgets('clientName')} */}
							{this.widgets('creditInfo')}
							{this.widgets('vendedor')}
						</div>
						<div className=" p-2 flex flex-wrap md:col-12 lg:col-6 flex-grow-1">
							{/* {this.widgets('clientLocation')} */}
							{this.widgets('callDialog')}
						</div>
						{this.state.client_calls.length>0 && <div className="align-items-start flex flex-wrap h-30rem text-white gap-2 justify-content-center w-full mb-8">
							{this.state.client_calls.map(call=>{
								return(<div className="p-3 border-2 border-blue-700 bg-glass-c border-round-md sm:w-full md:w-50 lg:w-30 max-w-30rem flex-grow-1 h-full">
										<div className=" w-full h-full align-content-between">
											<div className="flex justify-content-between align-items-end col-12">
												<h4>O contato{call.enviado?' ':' não '}foi realizado</h4><h5 className="text-sm text-green-500 text-right font-bold">Via {channels[call.selectedChannel]} {time_ago(call.enviado)}</h5>
											</div>
											<label className="col-12 line-height-4 text-justify">{call.call_description}</label>
											<div className="flex justify-content-between align-items-start col-12">
												<h5 className="font-bold">Retornar { time_until(call.call_return_date).toLowerCase() }</h5>
												<span className="text-right">
													{call.call_return_date - Date.now() < 0 && <h5 className="underline-red">Atrasado {time_ago(call.call_return_date).toLocaleLowerCase()}</h5>}
													{call.call_return_date - Date.now() > 0 && <label className="text-green-500 text-right font-bold">{
														call.call_return_date.toLocaleDateString("pt-br", {
															hour12: false,
															month: 'long',
															day: "2-digit",
															year: "numeric",
															weekday: 'long'
														})}
													</label>}
												</span>
											</div>
											{call.help_user.uid != this.props.user.uid && <label className="col-12 line-height-4 text-justify">Foi solicitada a ajuda de <span className="font-bold text-purple-300">{call.help_user.name}</span>: {call.help_description}</label>}
											{call.help_user.uid == this.props.user.uid && <label className="col-12 line-height-4 text-justify"><span className="font-bold"><span className="text-purple-300">Você</span> foi solicitado para ajudar:</span> {call.help_description}</label>}
										</div>
									<div>
										<Button label='Retornar'
											className={footer_button}
											icon='pi pi-phone'
											iconPos="right"
											onClick={(e)=>{
												// this.setState({all_channels:!this.state.all_channels})
											}}
										/>
									</div>
								</div>)
							})}
						</div>}
					</div>
				</div>)
			break;
			case 'pedidos':
				return(<div className="w-full h-auto m-0 p-0">
					{this.state.selected_group == null && this.widgets('salesGroups')}
					{/* {this.state.selected_group == 0 && <ScrollWrapper speed={100}
						className="bg flex h-20rem overflow-scroll horizontal-scrollbar col-12 flex-grow-1">
						{this.widgets('clientProducts','_pedidos')}
					</ScrollWrapper>} */}
					{this.state.selected_group == 0 && this.widgets('clientOrders')}
					{this.widgets('productsView')}
					{this.widgets('salesFooter')}
				</div>)
			break;
			
			case 'dashboard':
				return(<div className="grid w-full m-0 p-0 align-items-center">
					
					<ScrollWrapper speed={100}
						className="md:flex-order-0 sm:flex-order-3 flex h-20rem overflow-scroll horizontal-scrollbar sm:col-12 md:col-6 lg:col-6 xl:col-4 flex-grow-1">
						{this.widgets('clientProducts','_dashboard')}
					</ScrollWrapper>
					<div className="md:flex-order-1 sm:flex-order-2 h-auto sm:col-12 md:col-6 lg:col-6 xl:col-4 w-20rem flex-grow-1">
						{this.widgets('pieChart')}
					</div>
					<ScrollWrapper speed={50}
						className="md:flex-order-2 sm:flex-order-0 flex h-auto overflow-scroll horizontal-scrollbar sm:col-12 md:col-6 lg:col-6 xl:col-4 flex-grow-1">
						{this.widgets('barChart')}
					</ScrollWrapper>
					<div className="md:flex-order-3 sm:flex-order-1 h-auto sm:col-12 md:col-6 lg:col-6 xl:col-12 max-w-full flex-grow-1">
						{this.widgets('clientOrders')}
					</div>
				</div>)
			break;

			default:
				break;
		}
	}

	nextClient(){
		if(this.props.clients.length == 0 || !this.state.client)return(null)
		var index = 1
		var _client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)+index]
		if(!_client) return(null)
		while (_client.id == this.state.client.id) {
			index += 1
			_client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)+index]
		}
		return(_client)
	}

	lastClient(){
		if(this.props.clients.length == 0 || !this.state.client)return(null)
		var index = 1
		var _client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)-index]
		if(!_client) return(null)
		while (_client.id == this.state.client.id) {
			index += 1
			_client = this.props.clients[this.props.clients.findIndex(c => c?.id == this.state.client.id)-index]
		}
		return(_client)
	}

	matrix_button(k,i){
		return(<Button 
			key={i}
			label={k}//{this.props.isMobile?capitalize(k):""}
			icon={this.models[k].icon + " text-2xl"}
			// className={(k!=this.state.selected_view?"p-button-text text-gray-600 pt-0 hover:text-white ":"p-button-outlined bg-surface text-indigo-300 ")}
			className={(k!=this.state.selected_view?" text-white bg-black-alpha-30 ":" bg-primary-600 text-blue-900")+" w-auto min-w-max max-w-20rem p-button-rounded capitalize text-2xl md:icon-only p-2 lg:m-2 shadow-none border-2 border-blue-500"}
			onClick={(e)=>{
				this.props.router?.push({
					pathname: '/client',
					query: { p: k, id: this.state.client.id },
				}, undefined,{shallow:true}).then(()=>{
					this.setState({selected_view:k})
				})
			}}
		/>)
	}
	header(){
		return(<div style={{top:"-90px"}} className="sticky z-2 flex bg-4 w-full h-full justify-content-between align-items-center">
			<Button
				disabled={this.lastClient() == null}
				tooltip={this.lastClient()?.fantasia}
				className='p-button-text p-button-lg bg-1 z-1 sticky'
				style={{top:'5px'}}
				icon="pi pi-chevron-left"
				// label="Anterior"
				onClick={(e)=>{
					var _client = this.lastClient()
					this.load_client(_client)
					this.props.router?.push({
						pathname: '/client',
						query: { p: this.props.router.query.p, id: _client.id },
					})
				}}
			/>
			
			
			<div className="grid ">
				<div className="col-12 sm:col-12 md:col-5 lg:col-4 flex-grow-1 flex flex-wrap h-full min-w-30rem align-items-center justify-content-center ">
					<div className="horizontal-scrollbar flex h-full align-items-center gap-2 overflow-x-scroll mt-3 ">
						{Object.keys(this.models).map(this.matrix_button)}
					</div>
				</div>
				<div className="col-12 flex flex-grow-1 text-center justify-content-center h-auto w-full align-content-center m-0 p-0">
					<h4 className="white-space-normal text-white show_on_mobile ">{this.state.client?.fantasia}</h4>

				</div>
				<div className=" md:col-6 lg:col-5 flex flex-grow-1 text-center justify-content-between gap-2 h-min align-content-center m-0 p-0">
					<h4 className="white-space-normal text-white hide_on_mobile">{this.state.client?.fantasia}</h4>
					<h4 className=" text-overflow-ellipsis overflow-hidden hide_on_mobile " style={{color:"var(--text-c)"}}>{this.state.client?.razao_social}</h4>
					{/* <DateRangePicker /> */}
				</div>
			</div>
			<Button
				disabled={this.nextClient() == null}
				tooltip={this.nextClient()?.fantasia}
				tooltipOptions={{position:"left"}}
				className='p-button-text p-button-lg bg-1 z-1 sticky'
				style={{top:'5px'}}
				icon="pi pi-chevron-right"
				iconPos="right" 
				// label="Próximo"
				onClick={(e)=>{
					var _client = this.nextClient()
					this.load_client(_client)
					this.props.router?.push({
						pathname: '/client',
						query: { p: this.props.router.query.p, id: _client.id },
					})
				}}
			/>
		</div>)
	}
	render(){
		if(!this.state.client){
			return(<div className="flex w-full h-screen align-items-center absolute top-0 bg-blur-1">
				<ProgressSpinner/>
			</div>)
		}

		if(this.props?.fullScreen == true){
			// console.log(this.props.isMobile)
			return(<div className=" m-0 p-0">
				{(!this.props.client && this.state.loading != false) && <ProgressBar mode='indeterminate' className="mt-0"/>}
				{this.header()}
				
				{this.render_dashboard()}
				
				<Sidebar
					blockScroll
					style={{
						width:"100%",
						maxWidth:"500px",
						background:"#0000"
					}}
					position="right"
					showCloseIcon={false}
					visible={this.state.selected_item}
					onHide={(event)=>{this.setState({selected_item:null})}}
				>
				<ProductSidebar
					style={{
						paddingTop:"30px",
						top:"0px",
						width:"100%",
						backgroundColor:"var(--glass-b)",
						backdropFilter:"blur(20px)",
					}}
					sidebar={true}
					anim={false}
					close={false}
					user={this.props.user}
					check_rule={this.props.check_rule}
					groups={this.props.groups}
					item={this.state.selected_item}
					editable={false}
					onHide={(event)=>{this.setState({selected_item:null})}}
				/>

				</Sidebar>
				{/* <div className='pointer-events-none sticky bottom-0 right-0 z-4 ' style={{paddingTop:'100px', height:"100px"}}>
					<div className='overflow-scroll flex z-3 w-screen justify-content-end gap-3 align-items-end' >
						<div className='pointer-events-auto hover:bg-bluegray-800 bg flex px-3 py-3 mr-2 border-circle align-items-center gap-2 cursor-pointer'
						onClick={(e)=>{
							scrollToTop()
						}}>
						<i className='pi pi-chevron-up text-2xl text-cyan-500 p-0 m-0'/>
						</div>
					</div>
				</div> */}

			</div>)
		}
		
	}
}

export default withRouter(ClientDashboard)