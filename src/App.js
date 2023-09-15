import React, { useState } from 'react';
import './App.css';
import Video from './components/video';

function App() {
  const [playlistID, setPlaylistID] = useState(null);
  const [apiKey, setAPIKey] = useState("AIzaSyAtb3BRw01oW0bAKTSkNwKOFO-EfVhnq7U");
  const [videos, setVideos] = useState([]);
  const [outputJSON, setOutputJSON] = useState();
  const [videoIds, setVideoIds] = useState([]);
  const [processed, setProcessed] = useState(null);

  async function getVideosFromPlaylist(id) {
    let videos = [];
    let videoIds = [];
    let nextToken = "";
    console.log("apikey: " + apiKey);
    console.log("playlist id: " + id);

    do {
      const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?' + new URLSearchParams({
        key: apiKey,
        playlistId: id,
        maxResults: 50,
        part: 'snippet',
        pageToken: nextToken
      }));

      try {
        const data = await response.json();
        if (data.error) throw new Error(`${data.error.message}\nCode: ${data.error.code}`);
        
        data.items.forEach((video) => {
          videos.push({
            id: video.snippet.resourceId.videoId,
            snippet: video.snippet,
            processing: null,
            statistics: null
          });
          videoIds.push(video.snippet.resourceId.videoId);
        });
        console.log(videoIds);

        // Handle query again if exists
        if (!data.nextPageToken) break;
        nextToken = data.nextPageToken;
      } catch (err) {
        console.log(err);
        alert(err);
      }
    } while (nextToken);

    // Get comment count of each video
    const stats = await getStatsFromVideoIds(videoIds);
    stats.map(v => videos.find(x => x.id === v.id).statistics = v.statistics);

    setVideos([...videos]);
    return [videos, videoIds];
  }

  async function getStatsFromVideoIds(ids) {
    let nextToken = "";
    let videoStats = [];
    for (let c=0; c*50<ids.length; c++) { // maximum results per query is 50
      do {
        const response = await fetch('https://youtube.googleapis.com/youtube/v3/videos?' + new URLSearchParams({
          key: apiKey,
          id: ids.slice(c*50, 50*(c+1)),
          part: 'statistics',
          pageToken: nextToken
        }));

        const data = await response.json();
        data.items.forEach(v => videoStats.push(v));

        if (!data.nextPageToken) break;
        nextToken = data.nextPageToken;
      } while (nextToken);
    }
    return videoStats;
  }

  async function getCommentsFromVideo(id) {
    let comments = [];
    let nextToken = "";
    let done = 0;

    do {
      try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?' + new URLSearchParams({
          key: apiKey,
          videoId: id,
          part: 'snippet',
          pageToken: nextToken,
          maxResults: 50
        }));

        const data = await response.json();
        nextToken = data.nextPageToken;
        data.items.forEach(comment => {
          comments.push(comment.snippet.topLevelComment.snippet.textOriginal);//console.log([...log, comment.snippet.topLevelComment.snippet.textOriginal]);
        });
        done=comments.length;
        console.log(`fetched ${done}`);
      } catch (err) {
        console.log(err);
      }
    } while (nextToken);
    return comments;
  }

  async function handleSubmit() {
    if (!playlistID || !apiKey) {
      alert("Missing playlist ID or API key");
      return;
    }
    const [vids, ids] = await getVideosFromPlaylist(playlistID);
    console.log(vids);
    setVideoIds(ids);
    //downloadSelected(ids);
  }

  // Fetch all top level comments from given video ID
  async function downloadSelected(ids) {
    setOutputJSON(null);
    let jsonblock = [];
    for (const id of ids) {
      const output = await getCommentsFromVideo(id);
      console.log(id);
      console.log(output);
      jsonblock.push({'id':id,'comments':output});
      setProcessed(id);
    }
    console.log(jsonblock);
    setOutputJSON(jsonblock); 
  }

  // Opens the output JSON to another page
  function openRaw() {
    if (outputJSON) {
      let wnd = window.open("about:blank", "");
      wnd.document.write(JSON.stringify(outputJSON));
    } else {
      alert("Output is blank.");
    }
  }

  return (
    <div className="App">
      <div className="header">
        <h2>YouTube Comments from Playlist to JSON</h2>
        <div>
          Playlist URL:
          <input type="text" onChange={(e) => {setPlaylistID(e.target.value.substring(e.target.value.indexOf('?list=')+6))}
          } placeholder="URL" spellCheck="false"/>
        </div>
        <div>
          API Key: <input type="text" onChange={(e) => {setAPIKey(e.target.value)}} placeholder="API Key" spellCheck="false"/>
        </div>
        <div>
          <button onClick={handleSubmit}>Get Videos</button>
          {/*<button onClick={()=> {}}>Stop</button>*/}
          <button onClick={openRaw}>View Raw Output</button>
          {/*<button onClick={() => {}}>Login with Google</button>*/}
        </div>
      </div>
      {videos.length > 0 && <div className="main-content">
        <div className="queue">
          <h3>Status</h3>
            {outputJSON ? 'Ready!' : processed ? `Current Video: ${videos.find(x => x.id === processed) ? videos.find(x => x.id === processed).snippet.title : 'unknown'}` : ''}
          </div>
        <div className="selected-list">
          <div className="content-header">
            
            <h3>Found {videos.length} Videos</h3>
            <input type="checkbox"/> deselect/select All
            <button onClick={() => {downloadSelected(videoIds)}}>Get Comments</button>
          </div>
          <div>
            {
              videos.map((vid, index) => <Video /*progressState={progress.index}*/ info={{id: vid.id, title: vid.snippet.title, numComments: (vid.statistics ? vid.statistics.commentCount : 0)}}/>)
            }
          </div>
        </div>
        
      </div>}
    </div>
  );
}

export default App;
