const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const zoomKey = require('./zCreds.json');
const gCreds = require('./gCreds.json');
const zoom = require('zoomus')({
  'key': zoomKey.key,
  'secret': zoomKey.secret
});

const app = express();
app.use(bodyParser.json());

/* Dashboard type 2 is past, 1 is live meetings. */
let dashboard = {
  type: 2,
  from: moment().format('YYYY-MM-DD'),
  to: moment().format('YYYY-MM-DD'),
}

/* Placeholder CB, replace with CB to Google Sheet */
const testCB = (username) => {
  return username + ' sent';
}

/* Accepts array of meeting IDs generated by getMeetings() */
const getDetail = (ids) => {
  console.log('Getting meeting participants...');
  /* Iterates over ids array and updates dashboard for each one with meeting_id: id */
  ids.forEach((id, i) => {
    setTimeout(() => {
      dashboard = {
        meeting_id: id,
        type: 2
      }
      zoom.dashboard.meeting(dashboard, (res) => {
        let thisGroup = [];
        if (res.error) console.log('error on getDetail');
        let meetingDetail = res.participants;
        if (meetingDetail !== undefined) {
          /* Pass each user_name to CB and push result to thisGroup */
          meetingDetail.forEach((person) => {
            thisGroup.push(testCB(person.user_name));
          })
        }
        /* logs list of participants in thisGroup array, sorted alphabetically (case-sensitive) */
        console.log(thisGroup.sort());
      })
    }, 5000);
  })
}

/* Sends request with default dashboard defined above and gets all meetings of type in dashboard range */
const getMeetings = () => {
  console.log('getting meeting details...');
  zoom.dashboard.meetings(dashboard, (res) => {
    if (res.error) console.log('error');
    let ids = [];
    /* Can I send meetings one at a time to getDetail instead of creating an array? */
    res.meetings.forEach((meeting) => ids.push(meeting.uuid));
    console.log('Getting details for '+ids.length+' meetings...');
    getDetail(ids);
  })
}

getMeetings();
