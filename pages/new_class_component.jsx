import React from 'react';

export default class NewComponent extends React.Component{
    constructor(props){
        super(props)
        this.default={}
        this.state={...this.default}
    }

    componentDidMount(){

    }

    render(){
        return(<></>)
    }
}