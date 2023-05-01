import React from 'react'
import { OverlayPanel } from 'primereact/overlaypanel';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ContextMenu } from 'primereact/contextmenu';
import { Button } from "primereact/button";
import { Badge } from 'primereact/badge';
import { SlideMenu } from 'primereact/slidemenu';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'next/router'
import { auth, get_token, get_user, readRealtimeData, writeRealtimeData } from '../api/firebase';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { isDeepEqual, openFullscreen, shorten, time_ago } from '../utils/util';
import UserIcon from './user_icon';
import { ProgressSpinner } from 'primereact/progressspinner';

export async function load_notifications(user_uid,show_all=false){
	// var alert_array = []
	return readRealtimeData("notifications/"+user_uid).then((alerts_data)=>{
		// console.log(alerts_data)
		if(!alerts_data) return([])
		var alert_array = Object.keys(alerts_data).map((alert_uid)=>{
			var alert_item = alerts_data[alert_uid]
			if(alert_item.viewed != true) alert_item.viewed = false
			if(!alert_item.viewed || show_all == true){
				alert_item.uid = alert_uid
				alert_item.short = alert_item.message.length > 64
				return(alert_item)
			}return(null)
		}).filter((i)=>i!=null)
		return(alert_array.reverse())
	})
	// console.log(alert_array)
	// return(alert_array)
}
export default withRouter(class ObjectView extends React.Component {
	constructor(props) {
		super(props);
		var new_position = {
			x:0,
			y:0, 
			scroll:{x:0,y:0}
		}
		this.state = {
			fullSreen:false,
			currentUser:null,
			cursor:new_position,
			last_save:new_position,
			room:null,
			redirect:false
		};
		this.menuModel = [
            {label: 'Visualizar', icon: 'pi pi-fw pi-eye', command: () => this.viewAction(this.state.selectedAction)},
            {label: 'Deletar', icon: 'pi pi-fw pi-times', command: () => this.deleteAction(this.state.selectedAction)}
        ];

		this.viewAction = this.viewAction.bind(this);
        this.deleteAction = this.deleteAction.bind(this);
		this.state.interval = null
		this.change_room = (path_to)=>{
			this.props.router.push(path_to)
			// this.setState({redirect:true},()=>{
			// 	writeRealtimeData("rooms"+this.props.router.asPath+"/"+this.state.currentUser.uid, null)
			// 	.then((data)=>{
			// 		// console.log(data)
			// 		this.props.router.push(path_to).then(()=>{
			// 			this.setState({redirect:false})
			// 		});
			// 	})
			// })
		}
		this.items = [
			{
				key:"menu_profile",
				label:'Perfil',
				icon:'pi pi-fw pi-user',
				command:(()=>{
					this.change_room('/');
				})
			},
			{
				key:"menu_sales",
				label:'Vendas',
				icon:'pi pi-fw pi-shopping-cart',
				command:(()=>{
					this.change_room('/sales');
				})
			},
			{
				key:"menu_admin",
				label:'Administração',
				icon:'pi pi-fw pi-briefcase',
				command:(()=>{
				  	this.change_room('/admin');
				})
			},
			{
				key:"menu_clients",
				label:'Clientes',
				icon:'pi pi-fw pi-building',
				command:(()=>{
					this.change_room('/client');
				})
			},
			{
				key:"menu_restapi",
				label:'Database',
				icon:'pi pi-fw pi-server',
				command:(()=>{
					this.change_room('/restapi');
				})
			},
			{
				key:"menu_upload",
				label:'Arquivos',
				icon:'pi pi-fw pi-folder',
				command:(()=>{
					this.change_room('/upload');
				})
			},
			{
				key:"menu_tax",
				label:'Faturamento',
				icon:'pi pi-fw pi-chart-line',
				command:(()=>{
					this.props.router.push('/tax');
				})
			}
		  ];
	}
	capture = async () => {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		const video = document.createElement("video");
	  
		try {
			const captureStream = await navigator.mediaDevices.getDisplayMedia();
			video.srcObject = captureStream;
			context.drawImage(video, 0, 0, window.width, window.height);
			const frame = canvas.toDataURL("image/png");
			captureStream.getTracks().forEach(track => track.stop());
			window.location.href = frame;
		} catch (err) {
		  	console.error("Error: " + err);
		}
	};
	componentDidMount () {

		if(this.props.user != null){
			if(this.props.user.role == 0){
				this.items = this.items.slice(0,2)
			}
			if(this.props.user.role == 3){
				this.items = this.items.slice(0,3)
			}
			if(this.props.user.role == 4){
				this.items = this.items.slice(0,2)
			}
		}
		if(this.props.user){
			load_notifications(this.props.user.uid).then((alerts_data)=>{
				// console.log(alerts_data)
				if(alerts_data) this.setState({
					currentUser:this.props.user,
					alerts:alerts_data
				})
			})
		}
		this.props.onLoad?.(this)
		this.props.onMount?.(this)
		
		this.onTouch = (event) =>{
			let _cursor = {...this.state.cursor}
			let _pos = {x:event.touches[0].clientX, y:event.touches[0].clientY}
			let _time = Date.now()
			let _distance = Math.sqrt(Math.pow(_pos.x - _cursor.x, 2) + Math.pow(_pos.y - _cursor.y, 2));
			let _speed = _distance/(_time - _cursor.time)
			// console.log(_speed)

			_cursor.speed = _speed
			_cursor.time = _time
			_cursor.scroll  = { 
				x:window.scrollX, 
				y:window.scrollY 
			}
			_cursor.x = _pos.x
			
			if(_cursor.scroll.y <= 2 && _cursor.y-_pos.y < 0 && _cursor.speed > 0.5){
				event.preventDefault()
				event.stopPropagation()
				this.setState({cursor:{..._cursor, speed:0}})
				return
			}

			_cursor.y = _pos.y
			this.setState({cursor:_cursor})
			this.props.onTouch?.(this.state.cursor)
		}

		this.onScroll = (event) =>{
			var _cursor = {...this.state.cursor}
			_cursor.scroll  = { 
				x:window.scrollX, 
				y:window.scrollY 
			}
			
			this.setState({cursor:_cursor})
			this.props.onScroll?.(this.state.cursor)
		}
		this.onMouseMove = (event)=>{
			// if(this.state.currentUser){
			// 	var _currentUser = {...this.state.currentUser}
			var	cursor = {
				time: Date.now(),
				x:event.clientX,
				y:event.clientY,
				scroll: { 
					x:window.scrollX, 
					y:window.scrollY 
				},
			}
			// }
			// event.preventDefault();
			// event.stopPropagation();
			// console.log(cursor)
			this.setState({cursor})
		}

		if(this.state.interval == null){
			document.addEventListener("mousemove", this.onMouseMove );
			document.addEventListener("scroll",this.onScroll);
			document.addEventListener('touchmove', this.onTouch, { passive: false });

			this.setState({interval:setInterval(()=>{
	
				readRealtimeData("rooms"+this.props.router.asPath).then((room_data)=>{
					if(room_data != null){
						// room_data.forEach((user)=>{
						// 	console.log(user)
						// })
						// console.log(room_data)
						this.setState({room:room_data})
					}
				})
	
				if(this.state.currentUser && this.state.cursor && isDeepEqual(this.state.last_save, this.state.cursor) == false) {
					// console.log(this.state.cursor)
					writeRealtimeData("rooms"+this.props.router.asPath+"/"+this.state.currentUser.uid+"/position", this.state.cursor)
					
					this.setState({last_save:this.state.cursor})

				}
			},1000)
		})

		}

	}
	componentWillUnmount(){
		clearInterval(this.state.interval)
		document.removeEventListener("mousemove", this.onMouseMove );
		document.removeEventListener("scroll",this.onScroll);
		document.removeEventListener("touchmove",this.onTouch);
	}
	componentDidUpdate(){

	}

	viewAction(action) {
		this.op.hide();
		this.props.router.push("/"+action.url)
        // this.toast.show({severity: 'info', summary: 'Action Selected', detail: action.name});
    }

    deleteAction(alert) {
		writeRealtimeData("notifications/"+this.props.user.uid+"/"+alert.uid,null).then(()=>{
			let alerts = [...this.state.alerts];
			alerts = alerts.filter((p) => p.uid !== alert.uid);
			// this.toast.show({severity: 'error', summary: 'Action Deleted', detail: alert.name});
			this.setState({ alerts });
		})
    }

	onActionSelect(e) {
        this.setState({ selectedAction: e.value }, () => {
			var action = {...this.state.selectedAction}
			// console.log(action)
			action.viewed = true
			writeRealtimeData("notifications/"+this.props.user.uid+"/"+action.uid, action)
			.then((ret)=>{
				this.op.hide();
				this.props.router.push("/"+this.state.selectedAction.url)
			})
            // this.toast.show({severity:'info', summary: 'Action Selected', detail: this.state.selectedAction.title, life: 3000});
        });
    }

	render () {
		if(this.state.redirect == true){
			return(<div className='flex w-full h-full fixed justify-content-center align-items-center'>
				<ProgressSpinner />
			</div>)
		}
		if(this.props.noUser == true) return(<>
			<div className='flex h-6rem w-screen justify-content-center align-items-center' style={{
				background:"var(--primary)",
				border:"5px",
				borderRadius:"0px",
				borderColor:"var(--primary-b)",
			}}>
				<img
					className=''
					src='/images/logo_a.svg'
					alt={"logo"}
					style={{ height:"4rem"}}
				/>
			</div>
			<div>
				{this.props.children}
			</div>
		</>)
		var users_in_room = []
		if(this.state.room != null){
			users_in_room = Object.keys(this.state.room)
		}
		const logotipo = () =>{
			return(
				<div className={' w-full pointer-events-none h-full fixed z-2 '+ (this.state.currentUser?"animate-fadeout":"animate-fadein")}>
					<img
						className='center fixed'
						src='/images/logo_b.svg'
						alt={"logo"}
						style={{ height:"180px", filter:"blur(15px)" }}
					/>
					<img
						className='center fixed'
						src='/images/logo_a.svg'
						alt={"logo"}
						style={{ height:"156px"}}
					/>
				</div>
			)
		}

		if(!this.state.currentUser && this.props.noUser != true) return(
			logotipo()
		)
		return (
			<div style={{position:"relative", zIndex:1}}>
				{logotipo()}
				{users_in_room.length > 0 && 
				<div style={{position:"absolute", zIndex:1}}>
					{users_in_room.map((user, uindex)=>{
						if(user == this.state.currentUser.uid) return
						var user_position = this.state.room[user].position
						if(!user_position) return
						var p_x = user_position.x + user_position.scroll.x
						var p_y = user_position.y + user_position.scroll.y
						// console.log(user_position)
						var is_on = (!user_position || Date.now() - user_position.time > 60000) == false
						if(p_x < window.innerWidth && p_y < window.innerHeight){
							return(<div key={user+"_"+uindex} className='flex align-items-center justify-content-center' style={{
								zIndex:1,
								position:"absolute",
								top:p_y+"px",
								left:p_x+"px",
							}}><UserIcon key={user+"_"+uindex+"_icon"} uid={user} pointer style={{color:"var(--text)", zIndex:2}} />
							<Badge value={is_on?'ON':'OFF'} style={{scale:'0.9', transform:"translateY(25px)"}} className={'z-0 hover:visible cursor-pointer absolute shadow-8 bottom-0 text-white ' + (is_on?'bg-green-700':'bg-gray-600')}/> </div>)
						}
						
					})}
				</div>}
				{this.props?.header!= false && <div>
					<SlideMenu
						ref={(el) => this.menu = el}
						model={this.items}
						popup
						viewportHeight={48*this.items.length}
						// menuWidth={175}
					/>
					<Toolbar
						style={{
							position:"relative",
							color:"var(--text)",
							background:"var(--primary)",
							border:"5px",
							borderRadius:"0px",
							borderColor:"var(--primary-b)",
							// paddingTop:"20px",
							zIndex:100
						}}
						left={
							<div className='flex align-items-center m-0 p-0'>
								{this.props.alerts != false && this.props.user && <div style={{position:"absolute"}}>
									<i aria-haspopup
										aria-controls="overlay_panel"
										onClick={(event)=>{
											// console.log(this.op)
											this.op.toggle(event)
											load_notifications(this.props.user.uid).then((alerts_data)=>{
												this.setState({alerts:alerts_data})
											})
											// console.log(this.state.alerts)
											// this.capture();
											get_token(this.props.user)
										}}
										className="pi pi-bell p-0 m-0 p-text-secondary p-overlay-badge"
										style={{ fontSize: '2rem', cursor:"pointer" }}
									>
										{this.state.alerts?.length > 0 && <Badge value={this.state.alerts?.length} />}
									</i>
								</div>}
								
								<OverlayPanel ref={(el) => this.op = el}
									// showCloseIcon
									id="overlay_panel"
									style={{
										padding:"15px",
										minWidth:"300px",
										width: '100vw',
										maxWidth:"max-content",
									}}
									// className="overlaypanel-demo"

								>
									{this.state.alerts?.length == 0 && <div>
										<h6 className='flex justify-content-center m-2' style={{color:"var(--text-c)"}}>Nenhuma Notificação Nova</h6>
										<Button
											label="Visualizar todas"
											className='p-button-outlined p-button-rounded w-full mt-2'
											onClick={(e)=>{
												this.props.router.push("/alerts")
											}}
										/>
									</div>}
									{this.state.alerts?.length > 0 && <DataTable
										value={this.state.alerts}
										selectionMode="single"
										responsiveLayout="scroll"
										scrollHeight='400px'
										// paginator
										// rows={5}
										// scrollable
										footer={<Button
											label="Visualizar todas"
											className='p-button-text p-button-rounded p-button-secondary w-full mt-1 pt-0 pb-0 pr-1 pl-1'
											onClick={(e)=>{
												this.props.router.push("/alerts")
											}}
										/>}
										emptyMessage="Carregando..."
										breakpoint="100px"
										sortField="serverTime"
										sortOrder={-1}
										selection={this.state.selectedAction}
										onSelectionChange={(e)=>{
											this.onActionSelect(e)
										}}
										size="small"
										style={{
											maxWidth:"400px",
											
										}}
										contextMenuSelection={this.state.selectedAction}
										onContextMenuSelectionChange={e => this.setState({ selectedAction: e.value })}
										onContextMenu={e => this.cm.show(e.originalEvent)}
									>
										<Column header="Notificação" body={(row_data)=>{
											
											return(<div>
												<h5 style={{color:"var(--text-c)"}}>{row_data.title}</h5>
												<div>
													<div className='pl-1'>
														{row_data.short? shorten(row_data.message,6,false):row_data.message}
													</div>
													{row_data.message.length > 64 &&
														<Button label={row_data.short?'Ler mais':'Menos'}
															className='p-button-text p-button-rounded mt-1 pt-0 pb-0 pr-1 pl-1'
															onClick={(e)=>{
																var _alerts = [...this.state.alerts]
																_alerts = _alerts.map((item)=>{
																	if(item.uid == row_data.uid){
																		item.short = !item.short
																	}
																	return(item)
																})
																this.setState({alerts:_alerts})
															}}
														/>
													}
												</div>
											</div>)
										}} />
										<Column
											field="serverTime"
											header="Quando"
											body={(row_data)=>{
												return(time_ago(row_data.serverTime))
											}}
											sortable
										/>
									</DataTable>}

								</OverlayPanel>
								<ContextMenu model={this.menuModel} ref={el => this.cm = el} onHide={() => this.setState({ selectedAction: null })}/>

								<div className='flex align-items-center'>
									<div style={{
										display: "flex",
										justifyContent: "center",
										// cursor:"pointer"
									}}
									// onClick={(e)=>{
									// 	this.props.router.reload()
									// }}
									>
										{/* {this.state.currentUser && <span style={{position:"absolute", left:"30px", top:"32px", color:"var(--info)"}}>{this.state.currentUser.email}</span>} */}
										<img src='/images/logo_a.svg' alt={"logo"} style={{ marginLeft:"50vw", height:"60px", transform:"translateX(-50%)" }}/>
										{/* <h6 style={{ marginLeft:"10px", marginTop:"12px",color:"var(--info)"}}>{process.env.NEXT_PUBLIC_VERSION}</h6> */}
									</div>
								</div>
							</div>
						}
						right={
							<>
								{this.state.currentUser && <img className='shadow-7'
									src={'./images/avatar/'+this.state.currentUser.photo+'_icon.jpg'} width={50}
									style={{
										marginLeft:"10px",
										borderRadius:"50%",
										cursor:"pointer"
									}}
									onClick={(event) => {
										// openFullscreen(document.body)
										this.menu.toggle(event)
									}}
									onContextMenu={(event)=>{
										event.stopPropagation()
										event.preventDefault()
										this.change_room('/')
										
									}}
								/>}
								{/* {this.state.currentUser && 
								<Button
									className='p-button-outlined'
									icon="pi pi-bars"
									label={window.innerWidth > 500? "Menu": ""}
									style={{color:"var(--secondary)"}}
									onClick={(event) => this.menu.toggle(event)}
								/>} */}
							</>
						}
					/>
          
				</div>}

				<div>
					{this.props.children}
				</div>
			</div>
		)
	}
})