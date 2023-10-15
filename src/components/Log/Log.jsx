import React from 'react';
import './Log.css';

/**
 * 
 * Log component for user information
 * 
 * @typedef {Object} content
 * @property {String} text
 * @property {Number[]} time
 * 
 * @param {Object[]} props
 * 
 */
function Log({content}) {
    return (
        <>
        <div className="log-component">
            <strong><u>History Log</u></strong>
            <div className="log-content">
                {content.map(x => <div key={Math.random()}>
                    [{x.time[0] > 9 ? x.time[0] : 0+String(x.time[0])}:{x.time[1] > 9 ? x.time[1] : 0+String(x.time[1])}:{x.time[2] > 9 ? x.time[2] : 0+String(x.time[2])}]:&nbsp;
                    {x.text}
                </div>)}
            </div>
        </div>
        </>
    );
}
export default Log;