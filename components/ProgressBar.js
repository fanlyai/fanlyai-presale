import React from 'react';

const ProgressBar = ({ percentage }) => {


    function progress(){
       return (percentage*50)/100
    }

    return (
        <div className="relative pt-4">
            <div className="flex mb-2 items-center justify-between">
               
                <div className="text-right w-full flex justify-between">
                    <span className="text-md font-semibold inline-block text-white">
                        {percentage}%
                    </span>
                    <span className="text-md font-semibold inline-block text-white">
                        Goal: {(percentage*50)/100} / 50 $ETH
                    </span>
                </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300">
                <div style={{ width: `${percentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-600"></div>
            </div>
        </div>
    );
};

export default ProgressBar;
