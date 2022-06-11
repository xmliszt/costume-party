import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Playground from "./views/Playground";
import Home from "./views/Home";
import "./App.css";
import Sound from "react-sound";
import { useState } from "react";
import {
  Button,
  Carousel,
  Image,
  Modal,
  Switch as AntSwitch,
  Typography,
} from "antd";
import { InfoCircleOutlined, SoundOutlined } from "@ant-design/icons";
import { isMobileOnly } from "react-device-detect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useThemeSwitcher } from "react-css-theme-switcher";

function App(): React.ReactElement {
  const { switcher, themes } = useThemeSwitcher();
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

  const openTutorial = () => {
    Modal.info({
      width: "calc(min(80vw, 80vh))",
      closable: true,
      okButtonProps: {
        hidden: true,
      },
      content: (
        <Carousel autoplay dotPosition="bottom">
          {[0, 1, 2, 3, 4].map((n) => (
            <Image
              src={`${process.env.PUBLIC_URL}/rules/${n}.jpg`}
              preview={true}
            ></Image>
          ))}
        </Carousel>
      ),
    });
  };

  return (
    <div className="App">
      <div className="info">
        <Button
          shape="circle"
          type="text"
          size={isMobileOnly ? "small" : "large"}
          icon={<InfoCircleOutlined />}
          onClick={openTutorial}
        >
          Help
        </Button>
      </div>
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
        url={`${process.env.PUBLIC_URL}/sounds/bg.mp3`}
        playStatus={playStatus}
        volume={50}
      />
    </div>
  );
}

export default App;
