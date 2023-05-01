import React, { Component } from 'react';
import { GMap, StreetViewPanorama } from 'primereact/gmap';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { api_call } from '../api/connect';
import Script from 'next/script'
import { Skeleton } from 'primereact/skeleton';

export default class GoogleMap extends Component {

    constructor(props) {
        super(props);

        this.state = {
            googleMapsReady: false,
            dialogVisible: false,
            loading:false,
            markerTitle: '',
            draggableMarker: false,
            overlays: null,
            selectedPosition: null,
            streetViewPosition: {lat: 41.3851, lng: 2.1734},
            api_key:null
        };

        this.onMapClick = this.onMapClick.bind(this);
        this.onOverlayClick = this.onOverlayClick.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.onMapReady = this.onMapReady.bind(this);
        this.onHide = this.onHide.bind(this);
        this.addMarker = this.addMarker.bind(this);
    }

    componentDidMount() {
        if(window.loadedMaps){
            // this.setState({loading:true})
            this.get_key()
        }
    }

    // componentWillUnmount() {
    //     removeGoogleMaps();
    // }

    onMapClick(event) {
        this.setState({
            dialogVisible: true,
            selectedPosition: event.latLng
        });
    }

    onOverlayClick(event) {
        let isMarker = event.overlay.getTitle !== undefined;

        if(isMarker) {
            let title = event.overlay.getTitle();
            this.infoWindow = this.infoWindow||new google.maps.InfoWindow();
            this.infoWindow.setContent('<div>' + title + '</div>');
            this.infoWindow.open(event.map, event.overlay);
            event.map.setCenter(event.overlay.getPosition());

            this.toast.show({severity:'info', summary:'Marker Selected', detail: title});
        }
        else {
            this.toast.show({severity:'info', summary:'Shape Selected', detail: ''});
        }
    }

    handleDragEnd(event) {
        api_call('api/address', {lat:event.overlay.position.lat(),lng:event.overlay.position.lng()}).then((data)=>{
            console.log(data)
            if(data[0]){
                // console.log(data[0])
                this.props?.updateLocation(data[0])
                // parent.geoPin(data[0])
            } 
        })
        // console.log(event.overlay.position.lat(),event.overlay.position.lng())
        // this.toast.show({severity:'info', summary:'Marker Dragged', detail: event.overlay.getTitle()});
    }

    addMarker() {
        let newMarker = new google.maps.Marker({
            position: {
                lat: this.state.selectedPosition.lat(),
                lng: this.state.selectedPosition.lng()
            },
            title: this.state.markerTitle,
            draggable: this.state.draggableMarker
        });

        this.setState({
            overlays: [...this.state.overlays, newMarker],
            dialogVisible: false,
            draggableMarker: false,
            markerTitle: ''
        });
    }

    onMapReady(event) {
        this.setState({
            overlays: [
                new google.maps.Marker({
                    position: this.props?.location, title:this.props?.title, draggable:false}),
                // new google.maps.Marker({position: {lat: 36.883707, lng: 30.689216}, title:"Ataturk Park"}),
                // new google.maps.Marker({position: {lat: 36.885233, lng: 30.702323}, title:"Oldtown"}),
                // new google.maps.Polygon({paths: [
                //     {lat: 36.9177, lng: 30.7854},{lat: 36.8851, lng: 30.7802},{lat: 36.8829, lng: 30.8111},{lat: 36.9177, lng: 30.8159}
                // ], strokeOpacity: 0.5, strokeWeight: 1, fillColor: '#1976D2', fillOpacity: 0.35
                // }),
                // new google.maps.Circle({center: {lat: 36.90707, lng: 30.56533}, fillColor: '#1976D2', fillOpacity: 0.35, strokeWeight: 1, radius: 1500}),
                // new google.maps.Polyline({path: [{lat: 36.86149, lng: 30.63743},{lat: 36.86341, lng: 30.72463}], geodesic: true, strokeColor: '#FF0000', strokeOpacity: 0.5, strokeWeight: 2})
            ]
        })
    }

    onHide(event) {
        this.setState({dialogVisible: false});
    }

    onMaps(){
        
        this.setState({ googleMapsReady: true, loading:false });
    }
    get_key(){
        this.setState({loading:true})
        api_call("/api/key",{}).then((api_key)=>{
            this.setState({api_key})
            // console.warn('Got API')
            window.initializeMap = ()=>{
                console.log('Script Google Maps is Ready')
                window.loadedMaps = true
            };
        }); 
    }
    

    suspense(){
        return(<div>
            <div className={`
                gmap-container
                flex flex-grow-1
                h-max grid
                bg-white-alpha-10
                w-full bottom-0 
                min-h-20rem
                justify-content-center
                align-items-center
            `}>
                <Skeleton height='512px' width='100%'/>
            </div>
        </div>)
    }
    render() {
        const satelite_view = {
            center: this.props?.location,
            mapTypeId: 'satellite',
            zoom: 18,
        };

        const street_view = {
            streetViewControl: true,
            streetView: {
                position: this.props?.location,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            }
        }

        const footer = <div>
            <Button label="Yes" icon="pi pi-check" onClick={this.addMarker} />
            <Button label="No" icon="pi pi-times" onClick={this.onHide} />
        </div>;

        if((!this.state.api_key || !window.loadedMaps) && !this.state.loading) return(<div onClick={()=>{
            this.get_key()
        }}
        className={`
            flex border-round-md
            gmap-container bg-black-alpha-50
            w-full bottom-0 static
            min-h-20rem
            justify-content-center
            align-items-center
        `}>
            <div className='flex justify-content-center flex-wrap w-20rem'>
                <i className='text-red-500 pi pi-map-marker text-5xl mb-3' />
                <h4 className='transition-colors transition-duration-300 text-center text-gray-500 hover:text-blue-200 cursor-pointer'>
                    Toque para explorar no Mapa a Localização
                </h4>
            </div>
        </div>)

        
        if(this.state.googleMapsReady==false && !window.loadedMaps && !this.state.api_key) return(this.suspense())
        return (<>
            {this.state.api_key && <Script
                src={`https://maps.google.com/maps/api/js?key=${this.state.api_key}&callback=initializeMap`}
                onReady={()=>this.onMaps()}
                onLoad={()=>this.onMaps()}
            />}
            <div>
                {window.loadedMaps?
                    <div className='grid flex gmap-container border-round-md bg-white-alpha-10 w-full bottom-0 static min-h-20rem'>
                            
                        <GMap
                            overlays={this.state.overlays}
                            options={satelite_view}
                            className=' border-round-1rem
                            p-5 overflow-hidden flex-grow-1 flex w-full max-h-min h-12 col-12'
                            onMapReady={this.onMapReady}
                            onOverlayDragEnd={this.handleDragEnd}
                        />

                    </div>
                :
                    this.suspense()
                }
            </div>
        </>
        );
    }
}
 






