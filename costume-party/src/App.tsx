import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Playground from "./views/Playground";
import Home from "./views/Home";
import "./App.css";

function App(): React.ReactElement {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
