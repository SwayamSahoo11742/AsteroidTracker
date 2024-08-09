import React, {useState} from "react";
import "./timeline.css"
import { getCurrentD } from "../Three-JS-Render/BodyPosition";
export const Timeline = ({ viewDate, setT }) => {
    // Formatting date and time with the given date object
    // MMM YYYY, DD
    // HH:MM:SS am/pm
    const formatDate = (date) => {
        const options = { month: 'short', year: 'numeric' };
        const day = date.getDate().toString().padStart(2, '0'); // Pad single-digit day with leading zero
        const monthYear = date.toLocaleDateString('en-US', options);
        return `${monthYear} ${day}`;
    };
    const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 24-hour to 12-hour format
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
        const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
        return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
    };

    // Creating labels for timeline

    const [start, setStart] = useState(1900);
    const [end, setEnd] = useState(2100);
    var timelineYears = [];


    const addTimelineYears = (start, end ,inc) => {
        var cur = start-inc;
        while(cur !== end){
            cur += inc;
            timelineYears.push(<li key={cur}>{cur}</li>)
        }
    }
    addTimelineYears(start,end,20)

    // Updating t (time since epoch)
    const changeT = (event) =>{
        var today = getCurrentD(new Date());
        var dateTarget = event.target.value;
        setT(today- dateTarget)
    }
    return (
        <>
            <div className="flex flex-col items-center w-full">
                {formatDate(viewDate)} {formatTime(viewDate)}
                <input
                    id="timeline"
                    type="range"
                    max="36525.20833333349"
                    min="-36523.79166666651"
                    step="1"
                    value={getCurrentD(viewDate)}
                    onChange={changeT}
                    className="w-full mb-2 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" // Tailwind CSS classes
                />
            </div>
            <div className="w-full">
                <ul className="years w-full">
                    {timelineYears}
                </ul>
            </div>
        </>
    );
};
