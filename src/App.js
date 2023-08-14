import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Video from './components/video';

const api_key = ""
const playlist_id = "PLdaz-iqxKi8DqXpAl9zPt6-I3_p6T95pX"

function App() {
  const [playlistID, setPlaylistID] = useState(null);
  const [videos, setVideos] = useState([]);
  const [vidIds, setVidIds] = useState([]);
  const [selected, setSelected] = useState([]);
  const [progress, setProgress] = useState([]);
  const [outputJSON, setOutputJSON] = useState();
  /*//const playlist_url = "https://www.youtube.com/playlist?list=PLdaz-iqxKi8DqXpAl9zPt6-I3_p6T95pX"
  

  let test = {};
  fetch(`https://www.googleapis.com/youtube/v3/playlistItems?key=${api_key}&playlistId=${playlist_id}&part=snippet`)
  .then(r => r.json()).then((data) => {
    data.items.forEach((video) => {
      //console.log(`Video: ${video.snippet.title}`)
      test[video.snippet.title] = [];
      fetch(`https://www.googleapis.com/youtube/v3/commentThreads?key=${api_key}&videoId=${video.snippet.resourceId.videoId}&part=snippet&textFormat=plainText`)
      .then(r => r.json()).then((commentData) => {
        commentData.items.forEach((commentThread) => {
          let c = commentThread.snippet.topLevelComment.snippet.textOriginal;
          test[video.snippet.title].push({c});
        });

        document.getElementById('test').innerHTML = JSON.stringify(test);
      });
    });
  });*/

  async function getVideosFromPlaylist(id) {
    let videos = [];
    let videoIds = [];
    let nextToken = "";
    do {
      const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?' + new URLSearchParams({
        key: api_key,
        playlistId: id,
        part: 'snippet',
        pageToken: nextToken
      }));

      const data = await response.json();
      nextToken = data.nextPageToken;
      
      data.items.forEach((video) => {
        videos.push({
          id: video.snippet.resourceId.videoId,
          snippet: video.snippet,
          processing: null,
          statistics: null
        });
        videoIds.push(video.snippet.resourceId.videoId);
      });
    } while (nextToken != null);

    const stats = await getStatsFromVideoIds(videoIds);
    stats.map(v => videos.find(x => x.id === v.id).statistics = v.statistics)

    setVideos([...videos]);
    setVidIds(videoIds);
    return [videos, videoIds];
  }

  async function getStatsFromVideoIds(ids) {
    let nextToken = "";
    let videoStats = [];
    do {
      const response = await fetch('https://youtube.googleapis.com/youtube/v3/videos?' + new URLSearchParams({
        key: api_key,
        id: ids,
        part: 'statistics',
        pageToken: nextToken
      }));

      const data = await response.json();
      nextToken = data.nextPageToken;
      console.log(data);
      data.items.forEach(v => videoStats.push(v));
    } while (nextToken != null);

    return videoStats;
  }

  async function getCommentsFromVideo(id) {
    let comments = [];
    let nextToken = "";
    let c = 0;
    let done = 0;
    do {
      const response = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?' + new URLSearchParams({
        key: api_key,
        videoId: id,
        part: 'snippet',
        pageToken: nextToken,
        //maxResults: 50
      }));

      const data = await response.json();
      nextToken = data.nextPageToken;
      data.items.forEach(comment => {
        comments.push(comment.snippet.topLevelComment.snippet.textOriginal);//console.log([...log, comment.snippet.topLevelComment.snippet.textOriginal]);
      });
      done += data.pageInfo.totalResults * data.pageInfo.resultsPerPage;
      console.log(`fetched ${done}`);
      c++;
    } while (nextToken != null && c < 10);
    return comments;
  }

  async function handleSubmit() {
    //setPlaylistID('PLdaz-iqxKi8DqXpAl9zPt6-I3_p6T95pX');
    const [vids, ids] = await getVideosFromPlaylist(playlist_id);
    //getCommentsFromVideo(ids[0]);
    downloadSelected(ids);
  }

  async function downloadSelected(ids) {
    let jsonblock = [];
    for (const id of ids) {
      const output = await getCommentsFromVideo(id);
      console.log(id);
      console.log(output);
      jsonblock.push({'id':id,'comments':output});
    }
    console.log(jsonblock);
    setOutputJSON(jsonblock);
  }

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
        <h2>Download YouTube Comments from Playlist as JSON</h2>
        Playlist ID: <br/>
        <div>
          <input type="text" onChange={(e) => {setPlaylistID(e.target.value)}}/>
          <button onClick={handleSubmit}>Go</button>
          <button onClick={()=> {}}>Stop</button>
          <button onClick={openRaw}>View Raw Output</button>
          <button onClick={() => {}}>Login with Google</button>
        </div>
      </div>
      {videos.length > 0 && <div className="main-content">
        <div className="selected-list">
          <div className="content-header">
            <h3>Found {videos.length} Videos:</h3>
          </div>
          <div>
            {
              videos.map((vid, index) => <Video progressState={progress.index} info={{id: vid.id, title: vid.snippet.title, numComments: vid.statistics.commentCount}}/>)
            }
          </div>
        </div>
        <div className="queue">
          <h3>Output</h3>
            {
              JSON.stringify(outputJSON)
            }
        </div>
      </div>}
      {videos.length <= 0 && playlistID &&
        <h3>Loading...</h3>
      }
    </div>
  );
}

export default App;
