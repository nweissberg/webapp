import React, { useState, useReducer, useEffect } from 'react';
import undo from './undo';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { var_get, var_set } from '../pages/utils/util';

function editObject(object, key, value) {
	const newObj = { ...object };
	newObj[key] = value;
	return newObj;
}

function loadObject(object, value) {
	const newObj = { ...object };
    console.log(newObj, value)
	// newObj = value;
	return newObj;
}

function UndoableEditor({uid = 'undo_history', object, setObject, showHistory, editor = false }) {
    const [show, setShow] = useState(showHistory)
	const [state, dispatch] = useReducer(undo((state, action) => {
		switch (action.type) {
			case 'edit': {
				const { key, value } = action.payload;
				return editObject(state, key, value);
			}
            case 'load': {
				return loadObject(state, action.payload);
            }
			default: {
				return state;
			}
		}
	}), object);

	const [currentKey, setCurrentKey] = useState('');
	const [currentValue, setCurrentValue] = useState('');

    useEffect(()=>{
        handleReload()
    },[uid])

    useEffect(()=>{
        if(!state) return
        var_set(uid, JSON.stringify(state),{compress:true})
        var _object = {...state}
        delete _object.history
        delete _object.actions
        delete _object.index
        setObject(_object)
    },[state, setObject])
    
    const handleReload = () => {
        var_get(uid,{decompress:true}).then((value)=>{
            if(!value) return
            const loaded = JSON.parse(value)
            dispatch({
                type: 'load',
                payload: loaded,
            });
            setObject(loaded)
        })
    }

	const handleKeyChange = (event) => {
		setCurrentKey(event.target.value);
	};

	const handleValueChange = (event) => {
		setCurrentValue(event.target.value);
	};

	const handleEdit = () => {
		if (currentKey !== '' && currentValue !== '') {
			dispatch({
				type: 'edit',
				payload: {
					key: currentKey,
					value: currentValue,
                    time: new Date().getTime()
				},
			});
			setCurrentKey('');
			setCurrentValue('');
		}
	};

	const handleUndo = () => {
		dispatch({ type: 'undo' });
	};

	const handleRedo = () => {
		dispatch({ type: 'redo' });
	};
    
    if(!editor)return(<></>)
	return (
		<div className='sticky z-0 flex w-screen h-max bottom-0 left-0 flex-wrap justify-content-center'>
            {show && <pre className={"text-green-300 flex col-12"}>
                {JSON.stringify(state, null, 4)}
            </pre>}
			<div className='grid w-full p-4 sticky bottom-0 bg-glass-c bg-blur-1 justify-content-between'>
                
				<Button className='col-2 flex p-button-outlined p-button-rounded px-3 border-2 shadow-neon text-bluegray-300 hover:text-white bg-glass-b md:icon-only w-auto' onClick={handleEdit} label='APLICAR' icon='pi pi-check text-green-300'/>
				<InputText className='col-3 flex' type="text" placeholder="Key" value={currentKey} onChange={handleKeyChange} />
				<InputText className='col-3 flex' type="text" placeholder="Value" value={currentValue} onChange={handleValueChange} />

                <div className='col-4 flex'>
                    {/* <Button className='p-button-text shadow-none text-purple-300 md:icon-only w-auto' onClick={()=>setShow(!show)} icon='pi pi-history' label='Histórico'/> */}
                    <Button disabled={state?.index < 0} className=' p-button-text shadow-none md:icon-only w-auto' onClick={handleUndo} icon='pi pi-undo' label='Desfazer'/>
                    <Button disabled={state?.index == state.history?.length-1} className=' p-button-text shadow-none md:icon-only w-auto' onClick={handleRedo} icon='pi pi-refresh' label='Refazer' iconPos='right'/>
                </div>
			</div>
		</div>
	);
}

export default UndoableEditor
