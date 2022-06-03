import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Playground from "./views/Playground";
import Home from "./views/Home";
import "./App.css";
import Sound from "react-sound";
import { useEffect, useState } from "react";
import { Switch as AntSwitch, Typography } from "antd";
import { SoundOutlined } from "@ant-design/icons";

function App(): React.ReactElement {
  const [playStatus, setPlayStatus] = useState<
    "PLAYING" | "STOPPED" | "PAUSED"
  >("PLAYING");

  const toggleSound = (checked: boolean) => {
    if (checked) {
      setPlayStatus("PLAYING");
    } else {
      setPlayStatus("PAUSED");
    }
  };

  useEffect(() => {
    toggleSound(false);
    toggleSound(true);
  }, []);

  return (
    <div className="App">
      <div className="music-control">
        <Typography.Text style={{ color: "white" }}>BGM: </Typography.Text>
        <AntSwitch
          checkedChildren={<SoundOutlined />}
          defaultChecked
          onChange={toggleSound}
        />
      </div>
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/play">
            <Playground />
          </Route>
        </Switch>
      </Router>
      <Sound
        url={`${process.env.PUBLIC_URL}/bg.mp3`}
        playStatus={playStatus}
        playFromPosition={300}
      />
    </div>
  );
}

export default App;
