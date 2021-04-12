/* item that contains the annotation contents, the renderSwitch function assign specific display to the specfic anntation based on its motivation*/
import React from "react";
import auth from "solid-auth-client";
import Toggle from "react-toggle";
import Interweave from "interweave";
import { UrlMatcher } from "interweave-autolink";
import {
  getSolidDatasetWithAcl,
  hasResourceAcl,
  hasFallbackAcl,
  hasAccessibleAcl,
  // eslint-disable-next-line
  createAcl,
  createAclFromFallbackAcl,
  getResourceAcl,
  setAgentResourceAccess,
  setPublicResourceAccess,
  saveAclFor,
  // eslint-disable-next-line
  getSolidDataset,
  getPublicAccess,
  getAgentAccessAll,
} from "@inrupt/solid-client";

import PlayLogo from "../graphics/play-solid.svg";
class AnnotationItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isClicked: false,
      userMayModifyAccess: false,
      resourceAcl: null,
      aclModified: false,
      datasetWithAcl: null,
      userId: null,
      isPictureShowing: false,
      previewButtonContent: "Show preview",
      showRepliesButtonContent: "Toggle replies",
      isConfirmVisible: false,
      isVisible: false,
      resp: "",
    };
    this.onClick = this.onClick.bind(this);
    this.grantPublic = this.grantPublic.bind(this);
    this.revokePublic = this.revokePublic.bind(this);
    this.updateDatasetAcl = this.updateDatasetAcl.bind(this);
    this.showDetails = this.showDetails.bind(this);
    this.deleteAnno = this.deleteAnno.bind(this);
    // this.changeContent = this.changeContent.bind(this);
  }

  deleteAnno(e) {
    const parent = e.target.closest(".rootAnno");
    const testReplyRetrieval = document.querySelectorAll(".replyAnno");

    if (testReplyRetrieval) {
      testReplyRetrieval.forEach((replyTargetAnno) => {
        const replyTargetAnnoId = replyTargetAnno.dataset.replyAnnotationTarget;
        const rootAnnoTargetId = parent.dataset.selfId;
        if (replyTargetAnnoId === rootAnnoTargetId) {
          console.log("replies found: ", replyTargetAnno.dataset.selfId);
          auth
            .fetch(replyTargetAnno.dataset.selfId, { method: "DELETE" })
            .then(console.log("replies deleted"));
        }
      });
    }
    auth
      .fetch(this.props.annotation["@id"], { method: "DELETE" })
      .then(async (response) => {
        const data = await response.json();
        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }

        this.setState({ resp: "success" });
      })
      .then(this.props.onRefreshClick())
      .catch(() => {
        console.warn("Your annotation has been deleted, refreshing...");
      });
  }

  showDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = e.target.closest(".rootAnno");
    const details = parent.querySelector(".hiddenDetails");
    if (details && this.state.isVisible === false) {
      this.setState({ isVisible: true });
      details.classList.remove("hiddenDetails");
      details.classList.add("showDetails");
    } else {
      if (this.state.isVisible === true) {
        this.setState({ isVisible: false });
        const visibleDetails = parent.querySelector(".showDetails");
        visibleDetails.classList.remove("showDetails");
        visibleDetails.classList.add("hiddenDetails");
      }
    }
  };

  showReplyDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = e.target.closest(".quoteContent");
    const details = parent.querySelector(".hiddenDetails");
    if (details && this.state.isVisible === false) {
      this.setState({ isVisible: true });
      details.classList.remove("hiddenDetails");
      details.classList.add("showDetails");
    } else {
      if (this.state.isVisible === true) {
        this.setState({ isVisible: false });
        const visibleDetails = parent.querySelector(".showDetails");
        visibleDetails.classList.remove("showDetails");
        visibleDetails.classList.add("hiddenDetails");
      }
    }
  };
  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const replyTarget = this.props.annotation.target;
    const replyTargetId = this.props.annotation["@id"];
    this.props.onAnnoReplyHandler(replyTarget, replyTargetId);
    console.log("reply target id", replyTargetId);
  };
  componentDidMount() {
    this.updateDatasetAcl();
  }

  showConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = e.target.closest(".rootAnno");
    const confirmScreen = parent.querySelector(".hiddenConfirm");
    if (confirmScreen && this.state.isConfirmVisible === false) {
      this.setState({ isConfirmVisible: !this.state.isConfirmVisible });
      confirmScreen.classList.remove("hiddenConfirm");
      confirmScreen.classList.add("showConfirm");
    } else {
      if (this.state.isConfirmVisible === true) {
        this.setState({ isConfirmVisible: !this.state.isConfirmVisible });
        const visibleConfirm = parent.querySelector(".showConfirm");
        visibleConfirm.classList.remove("showConfirm");
        visibleConfirm.classList.add("hiddenConfirm");
      }
    }
  };

  updateDatasetAcl() {
    auth
      .currentSession()
      .then((s) => {
        getSolidDatasetWithAcl(this.props.annotation["@id"], {
          fetch: auth.fetch,
        })
          .then((datasetWithAcl) => {
            console.log("Got dataset: ", datasetWithAcl);
            let resourceAcl;
            if (!hasResourceAcl(datasetWithAcl)) {
              if (!hasAccessibleAcl(datasetWithAcl)) {
                console.warn(
                  "You do not have permission to modify access on ",
                  this.props.annotation["@id"]
                );
              }
              if (!hasFallbackAcl(datasetWithAcl)) {
                console.warn(
                  "You do not have permission to view access rights list on ",
                  this.props.annotation["@id"]
                );
              } else {
                resourceAcl = createAclFromFallbackAcl(datasetWithAcl);
                // ensure current user has control in the new ACL
                const userControllableResourceAcl = setAgentResourceAccess(
                  resourceAcl,
                  s.webId,
                  { read: true, append: true, write: true, control: true }
                );
                this.setState({
                  userMayModifyAccess: true,
                  datasetWithAcl,
                  resourceAcl: userControllableResourceAcl,
                  aclModified: Date.now(),
                });
                console.log("Creating ACL from fallback ACL");
              }
            } else {
              resourceAcl = getResourceAcl(datasetWithAcl);
              this.setState({
                userMayModifyAccess: true,
                datasetWithAcl,
                resourceAcl,
                aclModified: Date.now(),
              });
              console.log("Got resource ACL");
            }
          })
          .catch((e) =>
            console.error(
              "Couldn't get Solid dataset with ACL: ",
              this.props.annotation["@id"],
              e
            )
          );
      })
      .catch((e) =>
        console.error("Couldn't access the current Solid session: ", e)
      );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.aclModified !== nextState.aclModified) {
      // user has enacted an ACL change. Request a re-render accordingly.
      return true;
    }
    return false;
  }

  onPlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const bodyMedia = this.props.annotation.body[0].id;
    this.props.onMediaClick(bodyMedia);
  };

  onPreviewclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const aimAt = e.target.closest(".rootAnno");
    const _children = aimAt.children[0];

    //const aimAt = rootAnno.contains("hiddenContainer");
    if (this.state.isPictureShowing === false) {
      this.setState({
        isPictureShowing: true,
        previewButtonContent: "Hide preview",
      });
      console.log(_children);
      document
        .querySelector(".hiddenContainer")
        .addEventListener("click", function (e) {
          e.stopPropagation();
        });
      _children.classList.remove("hiddenContainer");
      _children.classList.add("showContainer");
    } else {
      document
        .querySelector(".showContainer")
        .addEventListener("click", function (e) {
          e.stopPropagation();
        });
      this.setState({
        isPictureShowing: false,
        previewButtonContent: "show preview",
      });
      _children.classList.add("hiddenContainer");
      _children.classList.remove("showContainer");
    }
  };

  onShowReplyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rootAnno = e.target.closest(".rootAnno");
    console.log("root anno", rootAnno);
    const replyTargetAnnos = document.querySelectorAll(".replyAnno");
    if (replyTargetAnnos.length) {
      replyTargetAnnos.forEach((replyTargetAnno) => {
        const replyTargetAnnoId = replyTargetAnno.dataset.replyAnnotationTarget;

        const rootAnnoTargetId = rootAnno.dataset.selfId;

        console.log("Reply target anno id: ", replyTargetAnnoId);
        if (replyTargetAnnoId === rootAnnoTargetId) {
          if (
            this.props.areRepliesVisible === false ||
            this.state.isClicked === false
          ) {
            this.setState({
              isClicked: true,
            });
            rootAnno.appendChild(replyTargetAnno);
            this.props.showReplyHandler();

            //creates an array of all the visible replies
            const noLongerShowing = Array.from(
              rootAnno.getElementsByClassName("showReply")
            );
            //hides them
            noLongerShowing.forEach((noReplyShowing) =>
              noReplyShowing.classList.add("hiddenReply")
            );
            noLongerShowing.forEach((noReplyShowing) =>
              noReplyShowing.classList.remove("showReply")
            );
            //creates an array of the hidden annotations
            const showing = Array.from(
              rootAnno.getElementsByClassName("hiddenReply")
            );
            //shows them
            showing.forEach((showingReply) =>
              showingReply.classList.add("showReply")
            );
            showing.forEach((showingReply) =>
              showingReply.classList.remove("hiddenReply")
            );
          } else {
            this.setState({
              isClicked: false,
            });
            this.props.showReplyHandler();

            const annoContainer = document.querySelector(".listContainer");
            const noLongerShowing = Array.from(
              rootAnno.getElementsByClassName("showReply")
            );
            //hides them
            noLongerShowing.forEach((noReplyShowing) => {
              noReplyShowing.classList.add("hiddenReply");
              annoContainer.appendChild(noReplyShowing);
            });
            noLongerShowing.forEach((noReplyShowing) =>
              noReplyShowing.classList.remove("showReply")
            );
          }
        }
      });
    } else console.warn("no replies to show for this annotation");
  };

  grantPublic(e) {
    e.preventDefault();
    e.stopPropagation();
    auth.currentSession().then((s) => {
      let updatedAcl = setPublicResourceAccess(this.state.resourceAcl, {
        read: true,
        append: false,
        write: false,
        control: false,
      });
      // ensure current user has control in the new ACL
      updatedAcl = setAgentResourceAccess(updatedAcl, s.webId, {
        read: true,
        append: true,
        write: true,
        control: true,
      });
      saveAclFor(this.state.datasetWithAcl, updatedAcl, { fetch: auth.fetch })
        .then(() => this.updateDatasetAcl())
        .catch((e) => console.error("Could not grant public access: ", e));
    });
  }

  revokePublic(e) {
    console.log("Revoking. Old acl: ", this.state.resourceAcl);
    e.stopPropagation();
    e.preventDefault();
    auth.currentSession().then((s) => {
      let updatedAcl = setPublicResourceAccess(this.state.resourceAcl, {
        read: false,
        append: false,
        write: false,
        control: false,
      });
      // ensure current user has control in the new ACL
      updatedAcl = setAgentResourceAccess(updatedAcl, s.webId, {
        read: true,
        append: true,
        write: true,
        control: true,
      });

      saveAclFor(this.state.datasetWithAcl, updatedAcl, { fetch: auth.fetch })
        .then(() => this.updateDatasetAcl())
        .catch((e) => console.error("Could not revoke public access: ", e));
    });
  }

  renderSwitch = () => {
    const date = this.props.annotation.created;
    let todaysDateISO = new Date().toISOString();
    let creationDate = date.split("T")[0];
    let compareDate = String(todaysDateISO.split("T")[0]);
    let permission;
    let modifyPermissionsElement;
    let replies = document.querySelectorAll(".replyAnno");
    const selfId = this.props.annotation["@id"];
    var areRepliesPresent = false;
    /* cehck to see if any available replies are present, if not the toggle replies is hidden */
    if (replies.length) {
      replies.forEach((reply) => {
        const target = reply.dataset.replyAnnotationTarget;
        if (target === selfId) {
          areRepliesPresent = true;
        }
      });
    }

    /* determine permission state of annotation in Solid Pod */
    if (this.state.datasetWithAcl) {
      if (getPublicAccess(this.state.datasetWithAcl).read)
        permission = "public";
      else if (Object.keys(getAgentAccessAll(this.state.datasetWithAcl)) > 1)
        /* declare it as shared if it has any access info for more than one (assumed to be user)
         * TODO check assumptions...
         */
        permission = "shared";
      else permission = "private";
    } else {
      permission = "unknown";
    }
    // Logic to toggle public access on and off
    // TODO allow sharing with individual agents using setAgentResourceAccess
    if (!this.state.userMayModifyAccess) {
      modifyPermissionsElement = (
        <span className="accessPermissions">No access</span>
      );
    } else {
      if (permission !== "public") {
        modifyPermissionsElement = (
          <Toggle
            checked={false}
            onChange={this.grantPublic}
            icons={{
              unchecked: (
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="lock"
                  className="svg-inline--fa fa-lock fa-w-14"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  vertical-align="middle"
                >
                  <path
                    fill="white"
                    d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"
                  ></path>
                </svg>
              ),
            }}
          />
        );
      } else if (permission === "public") {
        modifyPermissionsElement = (
          <Toggle
            checked={true}
            onChange={this.revokePublic}
            icons={{
              checked: (
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="lock-open"
                  className="svg-inline--fa fa-lock-open fa-w-18"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                >
                  <path
                    fill="white"
                    d="M423.5 0C339.5.3 272 69.5 272 153.5V224H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48h-48v-71.1c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v80c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-80C576 68 507.5-.3 423.5 0z"
                  ></path>
                </svg>
              ),
            }}
          />
        );
      }
    }
    /* shared components for all the annotations */
    let commonAnnoComponents = (
      <div>
        <div className="hiddenConfirm">
          <div>
            Delete this annotation and its replies?
            <p>
              <button className={"delteYes"} onClick={this.deleteAnno}>
                yes
              </button>
              <button className={"deleteNo"} onClick={this.showConfirm}>
                no
              </button>
            </p>
          </div>
        </div>
        <div style={{ paddingTop: "1.5%" }}>
          {compareDate === creationDate && (
            <button className="deleteButton" onClick={this.showConfirm}>
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="trash"
                className="svg-inline--fa fa-trash fa-w-14"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                width="100%"
                height="100%"
              >
                <path
                  fill="grey"
                  d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                ></path>
              </svg>
            </button>
          )}
          <button
            className="infoButton"
            onMouseEnter={this.showDetails}
            onMouseLeave={this.showDetails}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="info-circle"
              className="svg-inline--fa fa-info-circle fa-w-16"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="100%"
              height="100%"
            >
              <path
                fill="grey"
                d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
              ></path>
            </svg>
          </button>
          permissions: {modifyPermissionsElement}
        </div>
      </div>
    );
    /* cluster of buttons and stuff in the "annotation footer" */
    let replyButtonsCluster = (
      <div>
        <div className="hiddenDetails">
          {" "}
          <p className="date">
            Created on: {date}, access permissions: {permission}.
          </p>
        </div>
        <div>
          {areRepliesPresent === true && (
            <button
              className="showRepliesButton"
              name="showRepliesButton"
              onClick={this.onShowReplyClick}
            >
              {this.state.showRepliesButtonContent}
            </button>
          )}
          <button
            className="replyButton"
            name="replyButton"
            onClick={this.onClick}
          >
            Reply
          </button>
        </div>
      </div>
    );

    //stuff that i am carrying around: the annotation's ID you are replying to, the body (currently sits under annotation.source) and the annotation's specific ID
    const motivation = this.props.annotation.motivation;
    const bodyD = this.props.annotation.body[0].value;
    const bodyL = this.props.annotation.body[0].id;
    const bodyMedia = this.props.annotation.body[0].id;
    const target = this.props.annotation.target[0].id;
    const repTarget = this.props.annotation.target;
    const creator = this.props.annotation.creator || "unknown";

    switch (motivation) {
      case "describing":
        return (
          <div
            className="rootAnno annoItem"
            data-target={target}
            data-self-id={selfId}
          >
            {" "}
            {commonAnnoComponents}
            {/* <p>{bodyD}</p> */}
            <p>
              <Interweave
                content={bodyD}
                matchers={[new UrlMatcher("url")]}
                newWindow={true}
              />
            </p>
            {replyButtonsCluster}
          </div>
        );
      case "linking":
        if (bodyL.startsWith("http")) {
          return (
            <div
              className="rootAnno annoItem"
              data-target={target}
              data-self-id={selfId}
            >
              <p>
                {""}
                {commonAnnoComponents}
                {
                  <a
                    href={bodyL}
                    onClick="return false;"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {bodyL}
                  </a>
                }
              </p>
              {replyButtonsCluster}
            </div>
          );
        } else {
          const appendURL = "https://" + bodyL;
          return (
            <div
              className="rootAnno annoItem"
              data-target={target}
              data-self-id={selfId}
            >
              {commonAnnoComponents}
              <p>
                {""}
                {
                  <a
                    href={appendURL}
                    onClick="return false;"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {bodyL}
                  </a>
                }
              </p>
              {replyButtonsCluster}
            </div>
          );
        }

      case "trompa:cueMedia":
        const cleanMediaString = bodyMedia.split("#")[0];
        return (
          <div
            className="rootAnno annoItem"
            data-target={target}
            data-self-id={selfId}
          >
            {" "}
            {commonAnnoComponents}
            <p>
              {cleanMediaString}{" "}
              <button className="playButton" onClick={this.onPlayClick}>
                {" "}
                <img
                  src={PlayLogo}
                  alt=""
                  style={{
                    width: "5px",
                    alignContent: "center",
                    textAlign: "center",
                  }}
                ></img>{" "}
                play{" "}
              </button>
            </p>
            {replyButtonsCluster}
          </div>
        );
      case "trompa:cueImage":
        return (
          <div
            className="rootAnno annoItem"
            data-target={target}
            data-self-id={selfId}
          >
            {" "}
            <div className="hiddenContainer">
              <a href={bodyMedia} target="_blank" rel="noopener noreferrer">
                <img
                  title="click for full res"
                  src={bodyMedia}
                  alt="annotation"
                  style={{
                    maxWidth: "240px",
                    maxHeight: "135px",
                    marginTop: "5px",
                  }}
                />
              </a>
            </div>
            {commonAnnoComponents}
            <p>
              The content of this annotation is a picture, click the button to
              see a preview{" "}
              <button onClick={this.onPreviewclick}>
                {this.state.previewButtonContent}{" "}
              </button>
            </p>
            {replyButtonsCluster}
          </div>
        );
      case "trompa:playlist":
        return;

      case "replying":
        return (
          <div
            data-reply-annotation-target={repTarget}
            data-self-id={selfId}
            className="replyAnno hiddenReply"
          >
            <div className="quoteContent">
              <button className="deleteButton" onClick={this.deleteAnno}>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="trash"
                  className="svg-inline--fa fa-trash fa-w-14"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  width="100%"
                  height="100%"
                >
                  <path
                    fill="grey"
                    d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                  ></path>
                </svg>
              </button>
              <button
                className="infoButton"
                onMouseEnter={this.showReplyDetails}
                onMouseLeave={this.showReplyDetails}
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="far"
                  data-icon="info-circle"
                  className="svg-inline--fa fa-info-circle fa-w-16"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  width="100%"
                  height="100%"
                >
                  <path
                    fill="grey"
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                  ></path>
                </svg>
              </button>
              <p>Reply: {bodyD}</p>
              <span className="hiddenDetails">
                {" "}
                <span className="date">
                  Created on: {date}, access permissions: {permission}.
                </span>
              </span>
            </div>
          </div>
        );

      default:
        console.log(
          "no motivation provided defaulting to plain text annotation",
          motivation
        );
        return (
          <div className="annoItem" data-target={target}>
            {" "}
            <p>The plain text content of this annotation is {bodyD}</p>
            <div className="date">
              Created on: {date} by {creator} with {motivation} motivation
            </div>
          </div>
        );
    }
  };

  render() {
    return <div className="annoItemContainer">{this.renderSwitch()}</div>;
  }
}

export default AnnotationItem;
