import React from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript'; // Or the generator of your choice
import * as Brasil from 'blockly/msg/pt-br';
import { block_object } from './create_block';

Blockly.setLocale(Brasil);

export default class BlocklyWorkspace extends React.Component {
    constructor(props){
        super(props)
        this.state={
            loading:null,
            workspace: null,
            block:null
        }
    }

    add_custom_block(data){
        // Cria o bloco novo a partir da classe block_object
        var test_obj = new block_object(data)
        // adiciona o novo bloco aos Blocks do Blockly
        Blockly.Blocks[test_obj.data.block] = test_obj
        javascriptGenerator[test_obj.data.block] = test_obj.function
    }
    componentWillUnmount(){
        if(this.state.workspace){
            this.state.workspace.clear()
            this.setState({loading:null, workspace:null})
        }
    }

    componentDidMount(){
        this.setState({loading:true},()=>{
            if(this.state.loading != false){
                
                var workspace = Blockly.inject('blocklyPreview');
                
                this.add_custom_block(this.props.block)
                
                // Add the block to the workspace at the specified coordinates
                var block = workspace.newBlock('new_block');
                block.initSvg();
                // block.setColour(310)
                block.render();
                block.moveBy(20, 20);
                this.setState({block:block})
                this.setState({ workspace: workspace, loading:false });
                this.props.onMount(this)
            }
        })
    
    }

    render() {
        return (
            <div id="blocklyPreview" style={{height: "200px", width: "100%"}}></div>
        );
    }
}
