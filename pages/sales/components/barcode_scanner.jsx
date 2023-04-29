import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { Button } from 'primereact/button';
import { moneyMask } from '../../utils/util';
import localForage from "localforage";

const photos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'fotografias'
});

const BarcodeScanner = (props) => {
    const [quagga, set_quagga] = useState(Quagga)
    const firstUpdate = useRef(true);
    const [isStart, setIsStart] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [item, setItem] = useState(null)
    const [photo, setPhoto] = useState(null)
    useEffect(() => {
        return () => {
            // props.onLoad?.(this)
            if(props.startScanner){
                setIsStart(true)
            }else{
                if (isStart) stopScanner();
            }
        };
    }, []);
    
    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
            }
            
            if (isStart) startScanner();
            else stopScanner();
        }, [isStart]);
        
        const _onDetected = res => {
            // stopScanner();
            var _item = props.onDetected(res.codeResult.code)
            
            if(_item){
                // photos_db.getItem(_item.photo_uid).then((photo_data)=>{
                //     if(photo_data){
                //         const _photo ="data:image/png;base64," + new Buffer.from(photo_data.img_buffer).toString("base64")
                //         // console.log(photo_data)
                //         setPhoto(_photo)
                //     }
                //     // console.log(_item)
                // })
                setItem(_item)
                setBarcode("")
                stopScanner(true);
                setIsStart(false);
            }
            // setBarcode(res.codeResult.code);
        };
        
        const startScanner = () => {
            setItem(null)
            quagga.init(
                {
                    inputStream: {
                        type: 'LiveStream',
                        target: document.querySelector('#scanner-container'),
                        constraints: {
                            facingMode: 'environment' // or user
                        }
                    },
                    numOfWorkers: navigator.hardwareConcurrency,
                    locate: true,
                    frequency: 1,
                    debug: {
                        drawBoundingBox: true,
                        showFrequency: true,
                        drawScanline: true,
                        showPattern: true
                    },
                    multiple: false,
                    locator: {
                        halfSample: false,
                        patchSize: 'large', // x-small, small, medium, large, x-large
                        debug: {
                            showCanvas: false,
                            showPatches: false,
                            showFoundPatches: false,
                            showSkeleton: false,
                            showLabels: false,
                            showPatchLabels: false,
                            showRemainingPatchLabels: false,
                            boxFromPatches: {
                                showTransformed: false,
                                showTransformedBox: false,
                                showBB: false
                            }
                        }
                    },
                    decoder: {
                        readers: [
                            // 'code_128_reader',
                            'ean_reader',
                            // 'ean_8_reader',
                            // 'code_39_reader',
                            // 'code_39_vin_reader',
                            // 'codabar_reader',
                            // 'upc_reader',
                            // 'upc_e_reader',
                            // 'i2of5_reader',
                            // 'i2of5_reader',
                            // '2of5_reader',
                            // 'code_93_reader'
                        ]
                    }
                },
                err => {
                    if (err) {
                        return console.log(err);
                    }
                    quagga.start();
                }
                );
                quagga.onDetected(_onDetected);
        quagga.onProcessed(result => {
        let drawingCtx = quagga.canvas.ctx.overlay,
        drawingCanvas = quagga.canvas.dom.overlay;
        
        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(
                    0,
                    0,
                    parseInt(drawingCanvas.getAttribute('width')),
                    parseInt(drawingCanvas.getAttribute('height'))
                    );
                    result.boxes.filter(box => box !== result.box).forEach(box => {
                        quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                            color: 'green',
                            lineWidth: 2
                            });
                        });
                    }
                    
                    if (result.box) {
                        quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
                    }
                    
                    if (result.codeResult && result.codeResult.code) {
                        quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                        // console.log(result.codeResult)
                    }
                }
            });
        };
        
        const stopScanner = (stop) => {
            quagga.offProcessed();
            quagga.offDetected();
            if(stop == true) quagga.stop();
        };
        
        return <div className='flex w-full h-full'>
        {isStart == false && 
            <Button 
                className="sm:icon-only p-button-glass-dark border-none"
                label="Scanear"//{window.innerWidth > 650? "Scanear Etiqueta": ""}
                icon="pi pi-camera"
                iconPos='right'
                // tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }}
                tooltipOptions={{ position: 'right' }}
                onClick={() => setIsStart(prevStart => !prevStart)}
                
            />
        }
        {/* <img alt="Product Card"
            src={"images/scan_barcode.png"}
            style={{
                position:"relative",
                zIndex:0,
                width:'100%'
            }}
            />
        
    </Button> */}
        {/* <button onClick={() => setIsStart(prevStart => !prevStart)} style={{ marginBottom: 20 }}>{isStart ? 'Stop' : 'Start'}</button> */}
        {isStart && <div style={{
                zIndex:1000,
                position:"relative",
                // backdropFilter: "blur(10px)",
                backgroundColor:"var(--surface-a)",
                width:"100vw",
                height:"100vh",
                top:"-100%",
                overflow:"hidden"
            }}>
                {item != null && <div style={{textAlign:"center"}}>
                    <div style={{
                        alignItems:"center",
                        marginTop:"100px"
                    }}>
                        <img alt="Product Photo"
                            src={photo? photo : `images/grupos/${item.ID_CATEGORIA}_null.jpg`}
                            onError={(e) => e.target.src='images/sem_foto.jpg'}
                            style={{
                                width:'50vw',
                                maxWidth:"250px",
                                borderRadius:"10px",
                                marginBottom:"20px"
                            }}
                        />
                    </div>
                    
                    <h5 style={{
                        color:"var(--text)",
                        marginBottom:"10px"
                    }}>{item.PRODUTO_NOME}</h5>

                    <h3 style={{
                        color:"var(--text)",
                        marginBottom:"20px"
                    }}>{moneyMask(item.PRECO)}</h3>
              
                </div>}
            <div style={{
                textAlign:"center",
                position:"absolute",
                bottom:"20px",
                // top:"20px",
                left:"50%",
                transform:"translateX(-50%)",
                zIndex:2
            }}>
                {item != null && <div>
                    <h6 style={{
                        color:"var(--text-c)",
                        marginBottom:"10px"
                    }}>Código de barras: <br/>{barcode}</h6>
                </div>}
                <div className='flex justify-content-center flex-wrap gap-4'>
                    <Button
                        label={item?"":"Voltar"}
                        className="p-button-outlined p-button-danger"
                        icon="pi pi-times"
                        onClick={(e)=>{
                            setItem(null)
                            setBarcode("")
                            stopScanner(true);
                            setIsStart(false);
                        }}
                    />

                    {item != null && 
                    <Button
                        className="p-button-outlined p-button-success"
                        icon="pi pi-check"
                        onClick={(e)=>{
                            props.onConfirm(item)
                            setBarcode("")
                            stopScanner(true);
                            setIsStart(false);
                        }}
                    />}
                </div>
            </div>
            <div id="scanner-container" style={{
                display:item?"none":"block"
            }} />
        </div>}
    </div>
}

export default BarcodeScanner;
//