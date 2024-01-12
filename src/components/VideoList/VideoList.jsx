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

function VideoList({ videos, selectedVids, setSelectedVids }) {

    function updateSelected(e) {
        let state = {...selectedVids};
        state[e.target.value] = e.target.checked;
        setSelectedVids(state);
    }

    function toggleAll(value) {
        let state = {...selectedVids};
        for (const k of Object.keys(state)) {
            state[k] = value
        }
        setSelectedVids(state)
    }
    
    return (
        <div className="video-list-component">
            <button onClick={() => {toggleAll(false)}}>Deselect All</button>
            <button onClick={() => {toggleAll(true)}}>Select All</button>
            {videos.map(vid => 
            <div className="video-component" key={vid.id} >
                <input type="checkbox" id={vid.id} value={vid.id} onChange={e => updateSelected(e)} checked={selectedVids[vid.id]}/>
                <div>
                    <label htmlFor={vid.id}><strong>{vid.snippet.title}</strong></label>
                    <p>{vid.statistics ? vid.statistics.commentCount : 0} comments (id: {vid.id})</p>
                </div>
            </div>)}
        </div>
    )
}

export default VideoList;