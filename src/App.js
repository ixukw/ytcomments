import React, { useState, useReducer, useRef } from 'react';
import './App.css';
import VideoList from './components/VideoList/VideoList';
import Help from './components/Help/Help';
import Log from './components/Log/Log';
import logReducer from './logReducer.js';

function App() {
  const [playlistID, setPlaylistID] = useState(null);
  const [apiKey, setAPIKey] = useState(null);
  const [videos, setVideos] = useState([]);
  const [outputData, setOutputData] = useState(null);
  const [videoIds, setVideoIds] = useState([]);
  
  const downloadRef = useRef();
  const [log, dispatch] = useReducer(logReducer, []);

  /**
   * Updates the history log
   * 
   * @param {String} text 
   */
  function updateLog(text) {
    dispatch({
      type: 'add',
      text: text
    });
  } 

  /**
   * 
   * Fetches all video information from the playlist.
   * 
   * @param {String} id 
   * @returns {Object[]}
   */
  async function getVideosFromPlaylist(id) {
    let videos = [];
    let videoIds = [];
    let nextToken = "";
    updateLog("Fetching video info from playlist");

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
        alert(err);
        console.log(err);
      }
    } while (nextToken);

    // Get comment count of each video
    const stats = await getStatsFromVideoIds(videoIds);
    stats.map(v => videos.find(x => x.id === v.id).statistics = v.statistics);

    setVideos([...videos]);
    return [videos, videoIds];
  }

  /**
   * 
   * Fetches video information from a set of video IDs
   * 
   * @param {String[]} ids 
   * @returns {Object[]} An Object array of video informations
   */
  async function getStatsFromVideoIds(ids) {
    let nextToken = "";
    let videoStats = [];
    for (let c = 0; c * 50 < ids.length; c++) { // maximum results per query is 50, in the case of more than 50 ids this will fetch them all
      do {
        const response = await fetch('https://youtube.googleapis.com/youtube/v3/videos?' + new URLSearchParams({
          key: apiKey,
          id: ids.slice(c * 50, 50 * (c+1)),
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
  
  /**
   * Fetches all comments from a given video ID
   * @param {String} id 
   * @returns {String[][]}
   */
  async function getCommentsFromVideo(id) {
    let comments = [];
    let nextToken = "";
    const vidName = videos.find(x => x.id === id).snippet.title;
    updateLog(`Starting fetch for "${vidName}"`);

    do {
      try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?' + new URLSearchParams({
          key: apiKey,
          videoId: id,
          part: 'snippet,replies',
          pageToken: nextToken,
          maxResults: 100
        }));

        const data = await response.json();
        nextToken = data.nextPageToken;
        
        if (data.items) {
          data.items.forEach(comment => {
            // top-level comment
            comments.push([
              comment.id,                                                     // comment_id
              'top',                                                          // type
              'N/A',                                                          // parent_id
              comment.snippet.topLevelComment.snippet.authorDisplayName,      // author_display_name
              comment.snippet.topLevelComment.snippet.authorChannelId.value,  // author_id
              comment.snippet.topLevelComment.snippet.likeCount,              // like_count
              comment.snippet.totalReplyCount,                                // reply_count
              comment.snippet.topLevelComment.snippet.publishedAt,            // published_at
              comment.snippet.topLevelComment.snippet.updatedAt,              // updated_at
              comment.snippet.topLevelComment.snippet.textDisplay,            // comment
            ]);

            // comment replies
            if (comment.replies) {
              comment.replies.comments.forEach(reply => {
                comments.push([
                  reply.id,                             // comment_id
                  'reply',                              // type
                  reply.snippet.parentId,               // parent_id
                  reply.snippet.authorDisplayName,      // author_display_name
                  reply.snippet.authorChannelId.value,  // author_id
                  reply.snippet.likeCount,              // like_count
                  0,                                    // reply_count
                  reply.snippet.publishedAt,            // published_at
                  reply.snippet.updatedAt,              // updated_at
                  reply.snippet.textDisplay,            // comment
                ]);
              });
            }
          });
        }
        updateLog(`Found ${comments.length} comments for ${vidName}.`);
      } catch (err) {
        alert(err);
        updateLog(err);
      }
    } while (nextToken);
    return comments;
  }

  /**
   * Handles the onClick of the fetch video button
   */
  async function handleFetchVids() {
    if (!playlistID || !apiKey) {
      alert("Missing API Key or Playlist ID");
      return;
    }
    const [vids, ids] = await getVideosFromPlaylist(playlistID);
    console.log(vids);
    setVideoIds(ids);
  }

  /**
   * Fetch all top level comments from given video ID
   */
  async function downloadSelected(ids) {
    setOutputData(null);
    let jsonblock = [];
    for (const id of ids) {
      const output = await getCommentsFromVideo(id);
      jsonblock = [...jsonblock, ['comment_id', 'type', 'parent_id', 'author_display_name', 'author_id', 'like_count', 'reply_count', 'published_at', 'updated_at', 'comment'], output];
    }
    setOutputData(jsonblock); 
    updateLog("Done!");
  }

  /**
   * Generates and downloads the csv
   */
  function generateDownloadCSV() {
    if (outputData) {
      let csvContent = [];
      outputData.forEach(row => {
        csvContent.push(row.join(','));
      });
      const csvString = csvContent.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8,'});
      const objUrl = URL.createObjectURL(blob);
      
      downloadRef.current.href = objUrl;
      downloadRef.current.download = 'file.csv';
      downloadRef.current.click();

      updateLog("Generated CSV.");
    } else {
      alert("No output data found");
    }
  }

  return (
    <div className="App">
      <Help />
      <div className="header">
        <h1>Get YouTube Comments from Playlist</h1>
      </div>

      <div className="main-content">
        <div className="left-column-container">
          <div>
            Playlist URL: <input type="text" onChange={(e) => {setPlaylistID(e.target.value.substring(e.target.value.indexOf('?list=')+6))}} placeholder="URL" spellCheck="false"/>
          </div>
          <div>
            API Key: <input type="password" onChange={(e) => {setAPIKey(e.target.value)}} placeholder="API Key" spellCheck="false"/>
          </div>
          {videos.length > 0 &&
          <div className="video-list-container">
            <div className="video-list-header">
              <h3>Found {videos.length} Videos.</h3>
            </div>
            <VideoList videos={videos} />
          </div>}
        </div>
      
        <div className="right-column-container">
          <Log content={log}/>
          <div className="action-button-container">
            <button onClick={handleFetchVids}>Fetch Video Information</button>
            <button className={videoIds.length > 0 ? '' : 'disabled'} onClick={() => {downloadSelected(videoIds)}}>Fetch Comments From Selected Videos</button>
            <button className={outputData ? '' : 'disabled'} onClick={generateDownloadCSV}>Download Comments</button>
            <div className={downloadRef.current && downloadRef.current.download ? '' : 'hidden'}>
              Download didn't start? <a href="." ref={downloadRef}>Manual Link</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
