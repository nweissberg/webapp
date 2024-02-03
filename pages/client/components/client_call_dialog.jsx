import React from "react"
import UndoableEditor from "../../../contexts/UndoableEditor"
import CallDialog from "../../profile/components/call_dialog"
import { add_data } from "../../api/firebase"


export default class ClientCallDialog extends React.Component {
	constructor(props) {
		super(props)
		this.default = {
			client: props.client,
			history: {},
		}
		this.state = { ...this.default }
		this.undoable = null
	}
	render() {
		return <>
			<CallDialog
				fullScreen
				client={this.state.client}
				user={this.props.user}
				all_users={this.props.all_users}
				onUpdate={(data) => {
					// console.log(data)
					this.undoable.onEdit("call_data", data)
				}}
				onSend={(data) => {
					// console.log(data)
					var _data = ['selectedChannel', 'made_contact', 'call_return_date', 'call_description']
					if (data.got_problem) _data = [..._data, 'help_user', 'help_description']
					var callData = Object.fromEntries(Object.entries(data).filter(([key]) => _data.includes(key)));
					callData['client'] = {
						id: this.state.client.id,
						name: this.state.client.fantasia
					}
					add_data('calls', callData).then((doc_uid) => {
						console.log(doc_uid)
					})
				}}
			/>
			{this.props.client && <UndoableEditor
				uid={this.props.client.id + "_call_history"}
				onLoad={(fns) => { this.undoable = fns }}
				object={this.state.history}
				setObject={(_history) => {
					// print(_history.call_data)
					this.setState({ history: _history, call_data: _history.call_data })
					// this.props.onChange?.(this.state.finalTranscript)
				}}
			/>}
		</>
	}
}