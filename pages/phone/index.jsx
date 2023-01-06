import { Button } from 'primereact/button';
import React from 'react';
import { get_token } from '../api/firebase';

export default class PhoneWebRTC extends React.Component {
  // Initialize the WebRTC connection when the component is mounted
  componentDidMount() {
    // this.initWebRTC();
  }

  // Initialize the WebRTC connection
  initWebRTC() {
    // Get the local audio and video tracks
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      this.localStream = stream;

      // Display the local audio track
      this.localAudio.srcObject = stream;
    });

    // Create a new RTCPeerConnection
    this.pc = new RTCPeerConnection();

    // Set up event handlers for the RTCPeerConnection
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the ICE candidate to the remote party
        sendMessage({ type: 'candidate', candidate: event.candidate });
      }
    };
    this.pc.ontrack = (event) => {
      // Display the remote audio track
      this.remoteAudio.srcObject = event.streams[0];
    };
  }

  // Call a phone number
  call(phoneNumber) {
    // Create an offer to send to the remote party
    this.pc.createOffer().then((offer) => {
      // Set the local description to the offer
      this.pc.setLocalDescription(offer);

      // Send the offer to the remote party
      sendMessage({ type: 'offer', offer: offer });
    });
  }

  // Hang up the call
  hangup() {
    // Close the RTCPeerConnection
    this.pc.close();

    // Reset the component state
    this.setState({ calling: false });
  }

  // Handle an incoming call
  handleCall(offer) {
    // Set the remote description to the offer
    this.pc.setRemoteDescription(offer);

    // Create an answer to send back to the caller
    this.pc.createAnswer().then((answer) => {
      // Set the local description to the answer
      this.pc.setLocalDescription(answer);

      // Send the answer to the caller
      sendMessage({ type: 'answer', answer: answer });
    });
  }

  // Handle an incoming ICE candidate
  handleCandidate(candidate) {
    // Add the ICE candidate to the RTCPeerConnection
    this.pc.addIceCandidate(candidate);
  }

  // Render the softphone UI
  render() {
    return (
      <div>
        {/* <audio ref={(ref) => { this.localAudio = ref; }} />
        <audio ref={(ref) => { this.remoteAudio = ref; }} />
        <button onClick={() => this.call('+5519989566778')}>Call</button>
        <button onClick={() => this.hangup()}>Hang Up</button> */}
        <Button 
            label='Get Token'
            onClick={(event)=>{
                get_token();
            }}
        />
      </div>
    );
  }
}
