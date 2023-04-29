import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import React from 'react';

class SpeechToText extends React.Component {
    constructor(props) {
        super(props);
        this.recognition = null;
        this.text_field = null
        this.state = {
            wkSpeech:true,
            isActive:false,
            isRecognizing: false,
            interimTranscript: '',
            finalTranscript: '',
            break:"\n",
            selected_all:false
        };
    }

    componentDidMount() {
        
        if (!('webkitSpeechRecognition' in window)) {
            // Handle error stuff here...
            this.setState({wkSpeech:false})
            return;
        }

        this.recognition = new window.webkitSpeechRecognition();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = false;
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
            
            this.setState({ interimTranscript, finalTranscript });

            this.props.onUpdate?.(finalTranscript, interimTranscript)
        };

        this.recognition.onend = () => {
            if (this.state.isRecognizing) {
                this.startRecognition();
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

    onChange = (e) => {
        this.props.onChange?.(e.target.value)
        this.setState({finalTranscript: e.target.value, isRecognizing: false})
    }
    clear = (e) =>{
        this.setState({finalTranscript: '',interimTranscript:''})
    }

    render() {
      const outlined = " p-button-outlined bg-black-alpha-50 "
      const action_button = " scalein animation-duration-500 animation-iteration-1 animation-ease-out p-button-lg p-2 m-0 w-full "
      
        return (
        <div className='flex flex-wrap gap-2 w-full mt-1'>
          {this.props.textArea != false && <div className='flex w-full h-full'>
              <InputTextarea
                  placeholder={this.state.isActive && this.props.disabled != true?'Digitando ou falando...':""}
                  disabled={this.props.disabled?this.props.disabled:false}
                  ref={(el)=> this.text_field = el}
                  className='flex'
                  value={this.state.finalTranscript +(this.state.interimTranscript==""?"":this.state.break+ this.state.interimTranscript)}
                  autoResize
                  onChange={this.onChange}
                  onFocus={(e)=>{
                    console.log("Focused")
                    this.setState({isActive:true, focused:true})
                  }}
                  onSelect={(e)=>{
                    // console.log(e)
                    if( this.state.finalTranscript != '' && this.state.finalTranscript.length - (e.target.selectionEnd - e.target.selectionStart) == 0){
                      this.setState({selected_all: true})
                    }else{
                      this.setState({selected_all: null})
                    }
                    
                  }}
                  onBlur={(e)=>{
                    console.log("Blured")
                    this.setState({focused:false})
                    
                  }}
              />
            </div>}

            {this.state.isActive && this.props.disabled != true && <div className='flex mt-2 h-1 w-full align-content-between p-inputgroup'>
                
            {this.state.finalTranscript=='' && <Button
                    tooltip='Cancelar'
                    tooltipOptions={{position:"bottom"}}
                    // disabled={this.props.disabled || this.state.finalTranscript==''?true:false}
                    className={'p-button-danger'+ action_button + outlined}
                    icon={"pi pi-times"}
                    onClick={(e)=>{
                      this.stopRecognition()
                      this.setState({isActive:false})
                      this.clear()
                    }}
                />}

                
                  {this.state.finalTranscript != '' && <Button
                    tooltip='Pronto'
                    tooltipOptions={{position:"bottom"}}
                    // disabled={this.props.disabled || this.state.finalTranscript==''?true:false}
                    className={'p-button-success'+ action_button}
                    icon={"pi pi-check"}
                    onClick={(e)=>{
                      this.stopRecognition()
                      this.setState({isActive:false})
                    }}
                    on
                  />}

                <Button
                    tooltip='Desfazer'
                    tooltipOptions={{position:"bottom"}}
                    disabled={this.props.disabled || this.state.finalTranscript==''?true:false}
                    className={"p-button-secondary" + action_button + outlined}
                    icon={"pi pi-replay"}
                    onClick={(e)=>{
                    }}
                />

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
                    tooltip='Refazer'
                    tooltipOptions={{position:"bottom"}}
                    disabled={this.props.disabled || this.state.finalTranscript==''?true:false}
                    className={"p-button-secondary" + action_button + outlined}
                    icon={"pi pi-refresh"}
                    onClick={(e)=>{
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
        );
    }
}

export default SpeechToText;
