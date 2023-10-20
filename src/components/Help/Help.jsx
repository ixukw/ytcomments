import React, { useRef } from 'react';
import './Help.css';

function Help() {
    const helpToggleRef = useRef();

    return (
        <div className="help-component">
            <input type="checkbox" id="help-toggle" ref={helpToggleRef}/>
            <label className="help-toggle-open" htmlFor="help-toggle">
                Need Help?
            </label>
            <label htmlFor="help-toggle"><div className="help-overlay"></div></label>
            <div className="help-content">
                <label className="help-toggle-close" htmlFor="help-toggle">
                    <strong>X</strong>
                </label>
                <div className="help-instructions">
                    <h3>Instructions</h3>
                    <p>
                        1. Input the <strong>Playlist URL</strong> and your <strong>API key</strong>. Fetch the videos from the playlist.<br/>

                        2. Select videos and click <strong>Fetch Comments</strong>. This may take some time. <br/>

                        3. Download the comments as CSV files. Videos are separated by file. <br/>
                    </p>

                    <h3>Getting an API key</h3>
                    <p>
                        Go to your <a href="https://console.cloud.google.com/apis/">Google Cloud Console</a>, go to <strong>Enabled APIs & Services</strong> and enable <strong>YouTube Data API v3</strong>. <br/>

                        In the left menu go to <strong>Credentials</strong> and create a new API key via <strong>Create Credentials</strong>. Copy this key into the API key field. <br/>
                        
                    </p>

                    <h3>Privacy</h3>
                    <p>
                        Your API key is not copied or saved, and only requires permissions to list playlists, videos, and commentThreads. <br/>
                        
                        View the GitHub repo <a href="https://github.com/ixukw/ytcomments">here</a>.
                    </p>
                    
                    <h3>Limitations</h3>
                    <p>
                        Google Cloud Free Tier has a daily quota limit of 10,000 requests. At 10,000 requests, try again in 1 day. <br/>

                        For videos with 1M+ comments the API may not return all comments due to a hard limitation set by Google. <br/>
                    </p>
                    </div>
            </div>
        </div>
    )
}
export default Help;