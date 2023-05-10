import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { getNextWeekdays } from '../utils/util';

export default function WeekdaySearch(props){
	var maxDays = Math.min((props.maxDays || 5)+1,  6);
	const [options, setOptions] = useState();
    const [selectedOption, setSelectedOption] = useState(null);

	useEffect(() => {
		sortDates();
	},[props.maxDays])

    const onOptionChange = (e) => {
        setSelectedOption(e.value);
        props.onChange?.(options.find(o => o.value == e.value).date);
    }

    const optionTemplate = (option, short = false) => {
		if(!option) return (<h6>Sem data selecionada</h6>)
		const dayString = short?option.date.toLocaleDateString("pt-br", { hour12: false })
		:option.date.toLocaleDateString("pt-br", {
			hour12: false,
			day: "2-digit",
			month: 'long',
			year: "numeric",
		})
        return (
			<div className="flex justify-content-between gap-2 overflow-hidden text-overflow-ellipsis">
				<span className={'text-lg ' + (selectedOption == option.value ? 'text-blue-300 font-bold' : 'text-white')}>
					{short?option.label:option.label.split('-')[0]}
				</span>
				<span className={selectedOption == option.value ? 'text-purple-300 font-bold': 'text-secondary'}>
					{dayString}
				</span>
			</div>
		);
    }

    function sortDates() {
        const now = Date.now();
        const nextFiveWeekdays = getNextWeekdays(maxDays,props.mode);
        if ( nextFiveWeekdays[0].date.getTime() < now + (24 * 60 * 60 * 1000)) {
            // if the first date is within the next 24 hours, add an option for "Em 24 horas"
            return [
				{...nextFiveWeekdays[0],  label: 'Em 24 horas' },
                ...nextFiveWeekdays.slice(1,-1)
            ];
        }
		setOptions(nextFiveWeekdays.slice(0,-1))
        // return nextFiveWeekdays.slice(0,-1);
    }

    return (
        <div className="flex w-full">
            <Dropdown
				ref={props?.ref}
                disabled={props?.disabled}
                className='flex w-full'
                value={selectedOption}
                options={options}
                onChange={onOptionChange}
                optionLabel="label"
                filter filterBy="label"
                valueTemplate={(option)=>optionTemplate(option,true)}
                itemTemplate={(option)=>optionTemplate(option)}
            />
        </div>
    );
}
