import React, { useState, useEffect } from 'react';

const Timer = ({ initialDays = 10, initialHours = 0, initialMinutes = 0, initialSeconds = 0 }) => {
    const [days, setDays] = useState(initialDays);
    const [hours, setHours] = useState(initialHours);
    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        let interval;

        if (days > 0 || hours > 0 || minutes > 0 || seconds > 0) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else if (hours > 0) {
                    setHours(hours - 1);
                    setMinutes(59);
                    setSeconds(59);
                } else if (days > 0) {
                    setDays(days - 1);
                    setHours(23);
                    setMinutes(59);
                    setSeconds(59);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [days, hours, minutes, seconds]);

    return (
        <div className="tracking-widest pt-3 flex justify-center w-full rounded-md ">
            <span className="text-4xl font-bold text-white">{String(days).padStart(2, '0')}d</span>
            <span className="text-4xl font-bold text-white mx-2">{String(hours).padStart(2, '0')}h</span>
            <span className="text-4xl font-bold text-white">{String(minutes).padStart(2, '0')}m</span>
            <span className="text-4xl font-bold text-white mx-2">{String(seconds).padStart(2, '0')}s</span>
        </div>
    );
};

export default Timer;
