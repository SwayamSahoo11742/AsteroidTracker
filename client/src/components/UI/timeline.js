import React from "react";

export const Timeline = ({ viewDate }) => {
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
    return (
        <div className="flex flex-col items-center">
            {formatDate(viewDate)} {formatTime(viewDate)}
        </div>
    );
};
