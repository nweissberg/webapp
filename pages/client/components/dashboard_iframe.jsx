import React, { Component } from 'react';
// import '../../../styles/dashboard.css'

class ClientDashboardIframe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: 7131,
    };
  }

  generateIframeUrl = () => {
	// https://lookerstudio.google.com/u/0/reporting/d2b30d1d-e60d-4eea-843a-55e20311f44f/page/Qw8WD?params=%7B%22df10%22:%22include%25EE%2580%25801%25EE%2580%2580IN%25EE%2580%25807131%22%7D
    const baseUrl = 'https://lookerstudio.google.com/u/0/reporting/d2b30d1d-e60d-4eea-843a-55e20311f44f/page/Qw8WD';
    const params = {
      df10: `include\u00801\u0080\u0080IN\u0080${this.state.clientId}`,
    };

    const queryParams = new URLSearchParams(params);
    // queryParams.set('client_ID', this.state.clientId);

    return `${baseUrl}?params=${encodeURIComponent(queryParams.toString())}`;
  };

  render() {
    // const iframeUrl = this.generateIframeUrl();

    return (
      <div className='w-full h-full flex'>
        <iframe src={`https://lookerstudio.google.com/embed/reporting/d2b30d1d-e60d-4eea-843a-55e20311f44f/page/Qw8WD?params=%7B%22df10%22:%22include%25EE%2580%25801%25EE%2580%2580IN%25EE%2580%2580${this.props.clientId}%22%7D`} />
      </div>
    );
  }
}

export default ClientDashboardIframe;
