import React/*, { useState, useEffect, useRef }*/ from 'react';
import './VideoList.css';
/**
 * @typedef {Object} videos
 * @property {String} id
 * @property {String} title
 * @property {Number} numComments
 * 
 * @param {Object[]} props
 */

function VideoList({ videos }) {
    return (
        <div className="video-list-component">
            {videos.map(vid => 
            <div className="video-component" key={vid.id} >
                <input type="checkbox" id={vid.id} value={vid.id} defaultChecked="true"/>
                <div>
                    <label htmlFor={vid.id}><strong>{vid.snippet.title}</strong></label>
                    <p>{vid.statistics ? vid.statistics.commentCount : 0} comments (id: {vid.id})</p>
                </div>
            </div>)}
        </div>
    )
}

export default VideoList;