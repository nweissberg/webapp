import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

export default function PolarChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const documentStyle = getComputedStyle(document.documentElement);

    useEffect(()=>{
        const totalData = props.data.total
        console.log(totalData)
        var {total,...chartArray} = props.data
        chartArray = Object.values(chartArray)
        const data = {
            datasets: [
                {
                    data: chartArray.map((i)=>{
                        if(i.faturamento == 0) return(0)
                        var percent = (i.faturamento/totalData.faturamento)*100
                        // console.log(percent)
                        return(Math.round(percent))
                    }).filter((a)=>a!=0),
                    backgroundColor: [
                        documentStyle.getPropertyValue('--secondary-b'),
                        documentStyle.getPropertyValue('--secondary'),
                        documentStyle.getPropertyValue('--secondary-c'),
                        documentStyle.getPropertyValue('--secondary-a'),
                        documentStyle.getPropertyValue('--secondary-d'),
                    ],
                    hoverBackgroundColor: documentStyle.getPropertyValue('--secondary-e')
                }
            ],
            labels: chartArray.map((i)=>i.faturamento!=0?i.fantasia:null).filter((a)=>a!=null)
        };
        setChartData(data);

        // return(()=>{
        // console.log(props.data)
        // })
    },[props.data])

    useEffect(() => {
        // console.log(props)
        
        const textColor = documentStyle.getPropertyValue('--text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        
        

        const options = {
            maintainAspectRatio: false,
            aspectRatio: 1.0,
            // animations:false,
            responsive:true,
            cutout: '60%',
            plugins: {
                legend: {
                    position:"bottom",
                    // display:false,
                    labels: {
                        color: textColor,
                    }
                },
                tooltip:{
                    callbacks:{
                        label:(txt)=>{
                            return(txt.raw+" %")
                        }
                    }
                }
            },
            elements:{
                arc:{
                    borderColor:documentStyle.getPropertyValue('--glass-d')
                }
            },
        };

        // setChartData(data);
        setChartOptions(options);
    }, []);

    return (
        <div className={props.className?props.className:"flex justify-content-center"}>
            <Chart
                type="doughnut"
                data={chartData}
                options={chartOptions}
                style={{ position: 'relative', width: '100%', paddingInline:"15px"}}
            />
        </div>
    )
}