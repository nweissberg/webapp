import lodash from 'lodash'

const undo = (reducer) => (state, action) => {
	let {
		history = [],
		actions = [],
		index = -1,
		...object
	} = lodash.cloneDeep(state)
	
	switch (action.type) {
		case 'load': {
			if(!action.payload.history) break
			history = action.payload.history
			actions = action.payload.actions
			index = history.length -1
			object = reducer(action.payload, action)
			break
		}

		case 'undo': {
			if (index >= 0) {
				object = history[index]
				index--
			}
			break
		}

		case 'redo': {
			if (index < actions.length - 1) {
				index++
				object = reducer(
					object,
					actions[index]
				)
			}
			break
		}

		default: {
			index++
			history = history.slice(0, index)
			actions = actions.slice(0, index)
			history.push({ ...object })
			actions.push(action)
			object = reducer(object, action)
		}
	}
	return { ...object, history, actions, index }
}

export default undo
