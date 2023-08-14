import React, { useState, useEffect, useRef } from 'react';
import './video.css';
/**
 * 
 * @property 
 * 
 * @param {Object} props
 * @param {}
 */

function Video({ info }) {

    return (
        <div className="video-component" id={info.id}>
            <input type="checkbox" value={info.id} defaultChecked="true"/>
            <div>
                <strong>{info.title}</strong>
                <p>{info.numComments} comments</p>
            </div>
        </div>
    )
}

export default Video;