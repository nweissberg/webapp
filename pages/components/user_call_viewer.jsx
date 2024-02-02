import React from 'react';
import { query_data } from '../api/firebase';
import { shorten, time_ago } from '../utils/util';
import { Button } from 'primereact/button';
import UserIcon from './user_icon';

export default class UserCalls extends React.Component{
    constructor(props){
        super(props)
        this.default={}
        this.state={...this.default}
		this.channels = {
			"WHATS":"Whatsapp",
			"CALL":"Telefone",
			"EMAIL":"Email",
			"APP":"Mensagem",
			"FACE":"Facebook",
			"INSTA":"Instagram",
			"LOCAL":"Visita",
			"WEB":"Site Cliente"
		}
		this.footer_button = "flex w-auto p-4 h-full pt-1 pb-1 m-0 pl-2 pr-2 shadow-none p-button-lg p-button-rounded "
    }
	
    componentDidMount(){
		this.get_calls()
    }

	get_calls(){
		query_data('calls',this.props.query).then(data => {
			var promises = []
			var _docs = []
			data.forEach((doc)=>{
				var doc_data = doc.data()
				doc_data.call_return_date = doc_data.call_return_date.toDate()
				doc_data.enviado = doc_data.enviado.toDate()
				// promises.push(clients_db.getItem(doc_data.client.toString()).then(data=>{
					// 	doc_data.client=data
					// }))
				doc_data.expandir = [false,false]
				_docs.push(doc_data)
			})
			// this.setState({calls:_docs})
			// Promise.all(promises).then(e=>{
			// })
			// console.log(_docs)
			this.setState({client_calls:_docs})
		})
	}

    render(){
		if(!this.state.client_calls)return(<></>)
        return(<div className='flex overflow-hidden flex w-full p-2 h-full pb-2'>
			<div className="align-items-start flex h-auto text-white gap-2 justify-content-start w-full">
			{this.state.client_calls.map((call,i)=>{
				if(i>2)return<></>
				return(<div key={'call_'+i}
					// style={{width:'100%', maxWidth:"33vw"}}
					style={{minWidth:"max(min(100%, 400px), 33vw)"}}
					className="flex flex-wrap p-3 borde r-2 border-blue-700 bg-glass-b border-round-md h-full">
					<div className=" w-full h-full align-content-between">
						
						{/* <ClientIcon client={call.client}/> */}
						<h4 className='w-full justify-content-center flex text-center'>{call.enviado.toLocaleDateString('pt-BR', { day: "2-digit", month: 'long', year: "numeric"})}</h4>
						<UserIcon
							currentUser={this.props.currentUser}
							uid={call.user_uid}
							size="50"
							inline
							className='my-4'
						/>
						<div className="flex justify-content-between align-items-end col-12">
							<h5>O contato{call.enviado?' ':' não '}foi realizado</h5><h5 className="text-sm text-green-500 text-right font-bold">Via {this.channels[call.selectedChannel]} {time_ago(call.enviado)}</h5>
						</div>
						<label className="col-12 line-height-4 text-justify">{call.expandir[0]?call.call_description:shorten(call.call_description, 30, false)}
						{call.call_description.split(' ').length > 30 &&
						<Button label={call.expandir[0]?'Ler Menos':'Ler Mais'}
							icon={call.expandir[0]?'pi pi-minus':'pi pi-plus'}
							className='p-button-text py-0 shadow-none p-button-rounded'
							onClick={(e)=>{
								var _client_calls = this.state.client_calls
								_client_calls[i].expandir[0] = !_client_calls[i].expandir[0]
								this.setState({client_calls:_client_calls})
							}}
						/>}
						</label>
						{/* <div className="flex justify-content-between align-items-start col-12">
							<h5 className="font-bold">Retornar { time_until(call.call_return_date).toLowerCase() }</h5>
							<span className="text-right">
								{call.call_return_date - Date.now() < 0 && <h6 className="underline">Atrasado {time_ago(call.call_return_date).toLocaleLowerCase()}</h6>}
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
						</div> */}
						
						{call.help_description && call.help_user?.uid != this.props.currentUser.uid &&
							<label className="col-12 line-height-4 text-justify">Foi solicitada a ajuda de <span className="font-bold ">{call.help_user?.name}</span>: {call.expandir[1]?call.help_description:shorten(call.help_description, 30, false)}
							{call.help_description.split(' ').length > 30 &&
							<Button label={call.expandir[1]?'Ler Menos':'Ler Mais'}
								icon={call.expandir[1]?'pi pi-minus':'pi pi-plus'}
								className='p-button-text py-0 shadow-none p-button-rounded'
								onClick={(e)=>{
									var _client_calls = this.state.client_calls
									_client_calls[i].expandir[1] = !_client_calls[i].expandir[1]
									this.setState({client_calls:_client_calls})
								}}
							/>}
							</label>}
						{call.help_user?.uid == this.props.currentUser.uid && <label className="col-12 line-height-4 text-justify"><span className="font-bold"><span className="text-purple-300">Você</span> foi solicitado para ajudar:</span> {call.expandir[1]?call.help_description:shorten(call.help_description, 30, false)}</label>}
						{call.help_user && <UserIcon
							currentUser={this.props.currentUser}
							uid={call.help_user?.uid}
							size="50"
							inline
							// role
						/>}
					</div>
					{/* {(call.help_user?.uid == this.props.currentUser.uid || call.user_uid == this.props.currentUser.uid) && <div className='bottom-0'>
						<Button label='Retornar'
							className={this.footer_button}
							icon='pi pi-phone'
							iconPos="right"
							onClick={(e)=>{
								// this.setState({all_channels:!this.state.all_channels})
							}}
						/>
					</div>} */}
				</div>)
			})}
		</div>
	</div>)
    }
}