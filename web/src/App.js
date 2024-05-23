import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SignIn from "./page/SignIn";
import JigsawDemo from "./page/JigsawDemo";

export const Context = React.createContext("");
function App() {
  const [hasLogin, setHasLogin] = useState(false);
  const [emailId, setEmailId] = useState(null);
  const [imageId, setImageId] = useState(null);

  return (
    <Context.Provider
      value={{
        hasLogin,
        setHasLogin,
        emailId,
        setEmailId,
        imageId,
        setImageId,
      }}
    >
      <Router>
        <Route path="/" exact component={SignIn} />
        <Route path="/JigsawDemo" component={JigsawDemo} />
      </Router>
    </Context.Provider>
  );
}

export default App;
