import React, { useState } from "react";
import data from "@solid/query-ldflex";

import {
  LoginButton,
  LogoutButton,
  Value,
  LoggedIn,
  LoggedOut,
  useLDflexValue,
} from "@solid/react";

import SelectableScoreApp from "./selectableScoreApp";
import Logo from "../graphics/top-bar-logo_0_0.png";

export default function SolidWrapper(props) {
  data.context.extend({
    trompa: "http://vocab.trompamusic.eu/vocab#",
  });
  const userPOD = useLDflexValue("user.storage");
  const userId = useLDflexValue("user");
  const [userInput, setUserInput] = useState("private/");
  const handleUserInput = (e) => {
    // eslint-disable-next-line
    const containerPath = e.target.value
      ? setUserInput(e.target.value)
      : "private/";
  };
  return (
    <div id="authWrapper">
      <LoggedOut>
        <div>
          <a
            href="https://trompamusic.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={Logo} alt="trompa logo" />
          </a>
          <p>
            <LoginButton className="loginButton" popup="auth-popup.html">
              Log in with Solid
            </LoginButton>
          </p>
        </div>
      </LoggedOut>
      <LoggedIn>
        <a
          href="https://trompamusic.eu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Logo} alt="trompa logo" />
        </a>
        <h2>Music scholars annotation tool</h2>
        <p>
          You are logged in as{" "}
          <a href={userId} target="_blank" rel="noopener noreferrer">
            <Value src="user.name" />
          </a>
        </p>
        <p title="close the current session and quit the app">
          <LogoutButton className="logoutButton">Log out</LogoutButton>
        </p>
        <p>Specify the annotation container path inside your Pod:</p>
        <div>
          <input
            title="enter your preferred POD folder"
            type="text"
            placeholder="private/"
            onChange={handleUserInput}
            className="sizedTextBox"
          />
        </div>
        {typeof userPOD !== "undefined" ? (
          <SelectableScoreApp
            uri={props.uri}
            //vrvOptions={props.vrvOptions}
            podUri={`${userPOD}`}
            submitUri={`${userPOD}` + userInput}
            userId={`${userId}`}
          />
        ) : (
          <div>Loading... </div>
        )}
      </LoggedIn>
    </div>
  );
}
