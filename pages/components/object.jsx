import React from 'react'
import { Button } from "primereact/button";
import { SlideMenu } from 'primereact/slidemenu';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'next/router'
import { auth, get_token, get_user, readRealtimeData, writeRealtimeData } from '../api/firebase';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { isDeepEqual, openFullscreen } from '../utils/util';
import UserIcon from './user_icon';
import { ProgressSpinner } from 'primereact/progressspinner';

export default withRouter(class ObjectView extends React.Component {
	constructor(props) {
		super(props);
		var new_position = {
			X:0,
			y:0, 
			scroll:{x:0,y:0}
		}
		this.state = {
			fullSreen:false,
			currentUser:null,
			cursor_position:new_position,
			last_save:new_position,
			room:null,
			redirect:false
		};
		this.change_room = (path_to)=>{
			this.setState({redirect:true},()=>{
				writeRealtimeData("rooms"+this.props.router.asPath+"/"+this.state.currentUser.uid, null)
				.then(()=>{
					this.props.router.push(path_to).then(()=>{
						this.setState({redirect:false})
					});
				})
			})
		}
		this.items = [
			{
				label:'Perfil',
				icon:'pi pi-fw pi-user',
				command:(()=>{
					this.change_room('/');
				})
			},
			{
				label:'Vendas',
				icon:'pi pi-fw pi-shopping-cart',
				command:(()=>{
					this.change_room('/sales');
				})
			},
			{
				label:'Administração',
				icon:'pi pi-fw pi-briefcase',
				command:(()=>{
				  	this.change_room('/admin');
				})
			},
			{
			  label:'Database',
			  icon:'pi pi-fw pi-server',
			  command:(()=>{
				this.change_room('/restapi');
			  })
			},
			{
			  label:'Arquivos',
			  icon:'pi pi-fw pi-folder',
			  command:(()=>{
				this.change_room('/upload');
			  })
			},
			// {
			// 	label:'Arquivos',
			// 	icon:'pi pi-fw pi-folder',
			// 	command:(()=>{
			// 		this.props.router.push('/files');
			// 	})
			// }
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

		this.setState({currentUser:this.props.user})
		this.props.onLoad?.(this)
		this.props.onMount?.(this)

		this.interval = setInterval(()=>{

			readRealtimeData("rooms"+this.props.router.asPath).then((room_data)=>{
				if(room_data != null){
					// room_data.forEach((user)=>{
					// 	console.log(user)
					// })
					// console.log(room_data)
					this.setState({room:room_data})
				}
			})

			if(this.state.currentUser && this.state.cursor_position && isDeepEqual(this.state.last_save, this.state.cursor_position) == false) {
				// console.log(this.state.cursor_position)
				writeRealtimeData("rooms"+this.props.router.asPath+"/"+this.state.currentUser.uid+"/position", this.state.cursor_position)
				this.setState({last_save:this.state.cursor_position})
			}
		},1000)

		this.onMouseMove = (event)=>{
			// if(this.state.currentUser){
			// 	var _currentUser = {...this.state.currentUser}
			var	cursor_position = {
				time: Date.now(),
				x:event.clientX,
				y:event.clientY,
				scroll: { 
					x:window.scrollX, 
					y:window.scrollY 
				},
			}
			// }
			event.preventDefault();
			event.stopPropagation();
			// console.log(cursor_position)
			this.setState({cursor_position})
		}

		document.addEventListener("mousemove", this.onMouseMove );
	}
	componentWillUnmount(){
		clearInterval(this.interval)
		document.removeEventListener("mousemove", this.onMouseMove );
	}
	componentDidUpdate(){

	}
	render () {
		if(this.state.redirect == true){
			return(<div style={{position:"absolute", width:"100vw", height:"100vh"}} className='flex justify-content-center align-items-center'>
				<ProgressSpinner />
			</div>)
		}
		var users_in_room = []
		if(this.state.room != null){
			users_in_room = Object.keys(this.state.room)
		}
		return (
			<div>
				{users_in_room.length > 0 && 
				<div style={{position:"absolute", zIndex:100000}}>
					{users_in_room.map((user)=>{
						if(user == this.state.currentUser.uid) return(<></>)
						var user_position = this.state.room[user].position
						if(!user_position || Date.now() - user_position.time > 60000) return(<></>)
						var p_x = user_position.x + user_position.scroll.x
						var p_y = user_position.y + user_position.scroll.y
						// console.log(user_position)
						if(p_x < window.innerWidth && p_y < window.innerHeight){
							return(<div key={user} style={{
								zIndex:100000,
								position:"absolute",
								top:p_y+"px",
								left:p_x+"px",
							}}><UserIcon uid={user} pointer style={{color:"var(--text)"}} /></div>)
						}else{
							return(<></>)
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
							color:"var(--text)",
							background:"var(--primary)",
							border:"5px",
							borderRadius:"0px",
							borderColor:"var(--primary-b)",
							// paddingTop:"20px",
							zIndex:2
						}}
						left={
							<div className='flex align-items-center m-0 p-0'>
								<div style={{position:"absolute"}}>
									<Button className='p-button-rounded notification_button'
										icon="pi pi-bell"
										onClick={(event)=>{
											// this.capture();
											get_token()
										}}
									/>
								</div>

								<div className='flex align-items-center'>
									<div style={{
										display: "flex",
										justifyContent: "center"
									}}>
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
										this.change_room('/')
									}}
									onContextMenu={(event)=>{
										event.stopPropagation()
										event.preventDefault()
										this.menu.toggle(event)
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