import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Playground from "./views/Playground";
import Home from "./views/Home";
import "./App.css";
import Sound from "react-sound";
import { useState } from "react";
import { Switch as AntSwitch, Typography } from "antd";
import { SoundOutlined } from "@ant-design/icons";
import { isMobileOnly } from "react-device-detect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useThemeSwitcher } from "react-css-theme-switcher";

function App(): React.ReactElement {
  const { switcher, currentTheme, status, themes } = useThemeSwitcher();
  const [isDarkModeOn, setIsDarkModeOn] = useState<boolean>(false);
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

  const toggleDarkMode = (darkModeOn: boolean) => {
    setIsDarkModeOn(darkModeOn);
    switcher({ theme: darkModeOn ? themes.dark : themes.light });
  };

  const changeLocation = (location: string) => {
    setLocation(location);
  };

  return (
    <div className="App">
      <div className="music-control">
        <Typography.Text>
          <SoundOutlined />{" "}
        </Typography.Text>
        <AntSwitch
          className="sound-switch"
          size={isMobileOnly ? "small" : "default"}
          onChange={toggleSound}
          defaultChecked={false}
        />
      </div>

      <div className="dark-mode-control">
        <AntSwitch
          className="dark-mode-switch"
          size={isMobileOnly ? "small" : "default"}
          checked={isDarkModeOn}
          onChange={toggleDarkMode}
          defaultChecked={false}
          unCheckedChildren={<FontAwesomeIcon icon={["fas", "sun"]} />}
          checkedChildren={<FontAwesomeIcon icon={["fas", "moon"]} />}
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
