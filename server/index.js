const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

let apps = [
  {
    app_id: '1',
    app_name: 'Test App',
    policy_id: 10,
    agent_js_config: '123123',
    correlations_config: '321321'
  }
];

app.post('/Face/App_List', (req, res) => {
  res.json(apps);
});

app.post('/Face/New_app', (req, res) => {
  const newApp = req.body;
  apps.push(newApp);
  res.json({ error: 0 });
});

app.post('/Face/Update_app', (req, res) => {
  const updatedApp = req.body;
  const index = apps.findIndex(app => app.app_id === updatedApp.app_id);
  if (index !== -1) {
    apps[index] = updatedApp;
    res.json({ error: 0 });
  } else {
    res.json({ error: 1 });
  }
});

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Default app added:');
  console.log(apps[0]);
});