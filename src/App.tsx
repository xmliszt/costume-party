import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Playground from "./views/Playground";
import Home from "./views/Home";
import "./App.css";
import Sound from "react-sound";
import { useState } from "react";
import { Switch as AntSwitch, Typography } from "antd";
import { SoundOutlined } from "@ant-design/icons";
import { isMobile } from "react-device-detect";

function App(): React.ReactElement {
  const [location, setLocation] = useState<string>("");
  const [playStatus, setPlayStatus] = useState<
    "PLAYING" | "STOPPED" | "PAUSED"
  >("PAUSED");

  const toggleSound = (checked: boolean) => {
    if (checked) {
      setPlayStatus("PLAYING");
    } else {
      setPlayStatus("PAUSED");
    }
  };

  const changeLocation = (location: string) => {
    setLocation(location);
  };

  return (
    <div className="App">
      <div className="music-control">
        <Typography.Text
          style={{ color: location === "home" ? "white" : "black" }}
        >
          <SoundOutlined />{" "}
        </Typography.Text>
        <AntSwitch
          size={isMobile ? "small" : "default"}
          onChange={toggleSound}
          defaultChecked={false}
        />
      </div>

      <Router>
        <Switch>
          <Route exact path="/">
            <Home changeLocation={changeLocation} />
          </Route>
          <Route path="/play">
            <Playground
              changeLocation={changeLocation}
              isMuted={playStatus === "PAUSED" || playStatus === "STOPPED"}
            />
          </Route>
        </Switch>
      </Router>
      <Sound
        url={`${process.env.PUBLIC_URL}/bg.mp3`}
        playStatus={playStatus}
        volume={50}
      />
    </div>
  );
}

export default App;
