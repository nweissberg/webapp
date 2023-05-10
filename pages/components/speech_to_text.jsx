import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import React from 'react';
import UndoableEditor from '../../contexts/UndoableEditor';
import { deepEqual, isDeepEqual, print } from '../utils/util';

class SpeechToText extends React.Component {
    constructor(props) {
        super(props);
        this.recognition = null;
        this.text_field = null
        this.state = {
            break:"\n",
            wkSpeech:true,
            isActive:false,
            selected_all:false,
            finalTranscript: '',
            isRecognizing: false,
            interimTranscript: '',
            history:{textInput:"",state:-1},
        };
        this.undoable = null
    }

    componentDidMount() {
        
        if (!('webkitSpeechRecognition' in window)) {
            // Handle error stuff here...
            this.setState({wkSpeech:false})
            return;
        }

        this.recognition = new window.webkitSpeechRecognition();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event) => {
            var interimTranscript = '';
            var finalTranscript = this.state.finalTranscript;
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + this.state.break;
                } else {
                    interimTranscript += transcript;
                }
            }

            if(this.text_field) this.text_field.scrollTo({
                top: this.text_field.scrollHeight,
                behavior: 'smooth',
            });
            
            this.setState({ interimTranscript });
            this.update(finalTranscript)
            this.props.onUpdate?.(finalTranscript, interimTranscript)
        };

        this.recognition.onend = () => {
            if (this.state.isRecognizing) {
                // this.startRecognition();
                this.setState({isRecognizing:false})
                this.props.onPause?.()
            }
        };
        // this.props.onLoad?.(this)
    }

    componentWillUnmount() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    startRecognition = () => {
        if(this.state.isRecognizing != true){
            this.setState({ isRecognizing: true, interimTranscript: '' });
            this.recognition.start();
        }
    };

    stopRecognition = () => {
        if(this.state.isRecognizing != false){
            this.setState({ isRecognizing: false });
            this.recognition.stop();
        }
    };
    update = (text)=>{
        text = text.replace(/\s+/g, ' ');
        if(text.split(' ').at(-1) != ' ' && this.state.finalTranscript.split(' ').length != text.split(' ').length){
            print(this.state.history)
            this.undoable.onEdit("textInput",text)
        }
        this.setState({finalTranscript: text})
    }
    onChange = (e) => {
        var value = e.target.value
        this.update(value)
    
        this.props.onChange?.(value)
    }
    clear = (e) =>{
        this.setState({finalTranscript: '',interimTranscript:''})
    }
    close = (clear=false)=>{
        this.stopRecognition()
        this.setState({isActive:false})
        if(clear == true)this.clear()
    }
    
    render() {
        const outlined = " p-button-outlined bg-black-alpha-50 "
        const action_button = " p-button-lg p-2 m-0 w-full "
      
        return (<>
            {this.state.isActive && <div
                onClick={(e)=>{
                    e.stopPropagation();
                    e.preventDefault();
                    this.close()
                }}
                className='fadein animation-duration-300 animation-iteration-1 bg-glass-b fixed top-0 left-0 w-full h-full flex z-3'
            />}
            
            <div className={'flex relative flex-wrap gap-2 w-full mt-1 ' + (this.state.isActive?'z-4':'')}>
            {this.props.textArea != false && <div className='flex w-full h-full'>
                <InputTextarea
                    placeholder={this.state.isActive && this.props.disabled != true?'Digitando ou falando...':""}
                    disabled={this.props.disabled?this.props.disabled:false}
                    ref={(el)=> this.text_field = el}
                    className={'inputText '+ this.props?.className}
                    value={this.state.finalTranscript +(this.state.interimTranscript==""?"":this.state.break+ this.state.interimTranscript)}
                    // autoResize
                    onChange={this.onChange}
                    onFocus={(e)=>{
                        this.setState({isActive:true, focused:true})
                        this.update(this.state.finalTranscript)
                    }}
                    onSelect={(e)=>{
                        if( this.state.finalTranscript != '' && this.state.finalTranscript.length - (e.target.selectionEnd - e.target.selectionStart) == 0){
                            this.setState({selected_all: true})
                        }else{
                            this.setState({selected_all: null})
                        }
                    }}
                    onBlur={(e)=>{
                        this.setState({focused:false})
                        if(this.state.finalTranscript!='') this.update(this.state.finalTranscript+' ')
                        this.props.onBlur?.(this.state.finalTranscript)
                    }}
                />
                </div>}

                {this.state.isActive && this.props.disabled != true && <div className='scalein animation-duration-500 animation-iteration-1 animation-ease-out flex mt-2 h-1 w-full align-content-between p-inputgroup'>
                    
                    <Button
                        tooltip='Limpar'
                        tooltipOptions={{position:"bottom"}}
                        disabled={this.props.disabled || this.state.finalTranscript==''?true:false}
                        className={'p-button-warning' + action_button + ( (this.state.selected_all != true || this.state.finalTranscript=='') ?outlined:"")}
                        icon={"pi pi-eraser"}
                        onClick={(e)=>{
                            e.stopPropagation()
                            e.preventDefault()
                            if(this.state.isActive) this.text_field.select();
                            this.stopRecognition()
                            if(this.state.selected_all && this.state.focused == false) {
                                this.clear()
                                this.setState({selected_all:null})
                            }
                        }}
                    />

                    <Button
                        tooltip='Desfazer'
                        tooltipOptions={{position:"bottom"}}
                        disabled={this.props.disabled || this.state.history.index>=0?false:true}
                        className={"p-button-secondary" + action_button + outlined}
                        icon={"pi pi-replay"}
                        onClick={(e)=>{
                            e.stopPropagation()
                            e.preventDefault()
                            // print(this.undoable)
                            this.undoable.handleUndo()
                        }}
                    />

                    <Button
                        tooltip='Refazer'
                        tooltipOptions={{position:"bottom"}}
                        disabled={this.props.disabled || this.state.history.index >= this.state.history.length-1?true:false}
                        className={"p-button-secondary" + action_button + outlined}
                        icon={"pi pi-refresh"}
                        onClick={(e)=>{
                            e.stopPropagation()
                            e.preventDefault()
                            this.undoable.handleRedo()
                        }}
                    />

                    {this.state.wkSpeech && !this.state.isRecognizing && <Button
                        tooltip='Falar'
                        tooltipOptions={{position:"bottom"}}
                        disabled={this.props.disabled?this.props.disabled:false}
                        className={action_button + (this.state.isRecognizing?"p-button-help":"")}
                        icon={!this.state.isRecognizing?"pi pi-microphone":"pi pi-stop-circle"}
                        onClick={(e)=>{
                            this.props.onChange?.(e)
                            if(!this.state.isRecognizing){
                                this.startRecognition()
                            }else{
                                this.stopRecognition()
                            }
                        }}
                    />}

                    {this.state.wkSpeech && this.state.isRecognizing && <Button
                        tooltip='Parar'
                        tooltipOptions={{position:"bottom"}}
                        disabled={this.props.disabled?this.props.disabled:false}
                        className={action_button + outlined +"p-button-help"}
                        icon="pi pi-stop-circle"
                        onClick={(e)=>{
                            this.props.onChange?.(e)
                            if(!this.state.isRecognizing){
                                this.startRecognition()
                            }else{
                                this.stopRecognition()
                            }
                        }}
                    />}

                </div>}
            </div>
            <UndoableEditor
                uid={this.props.uid}
                onLoad={(fns)=>{this.undoable = fns}}
                object={this.state.history}
                setObject={(_history)=>{
                    this.setState({history:_history,finalTranscript: _history.textInput})
                    this.props.onChange?.(this.state.finalTranscript)
                }}
            />
        </>
        );
    }
}

export default SpeechToText;
