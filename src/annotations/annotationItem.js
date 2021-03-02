/* item that contains the annotation contents, the renderSwitch function assign specific display to the specfic anntation based on its motivation*/
import React from "react";
import auth from "solid-auth-client";
import Toggle from "react-toggle";
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
      showReplyButtonContent: "Show replies",
      isVisible: false,
    };
    this.onClick = this.onClick.bind(this);
    this.grantPublic = this.grantPublic.bind(this);
    this.revokePublic = this.revokePublic.bind(this);
    this.updateDatasetAcl = this.updateDatasetAcl.bind(this);
    this.showDetails = this.showDetails.bind(this);
  }

  // deleteAnno() {
  //   auth.currentSession().then(() => {
  //     fetch(this.props.annotation["@id"], { method: "DELETE" }).then(() =>
  //       console.log("trying to delete", this.props.annotation["@id"])
  //     );
  //   });
  // }

  showDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = e.target.closest(".rootAnno");
    const details = parent.querySelector(".hiddenDetails");
    console.log(parent, " with this details ", details);
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
    console.log(replyTargetAnnos);
    /* chunk of proto code that is probably useful for the end goal */
    // const testRoot = document.querySelectorAll(".rootAnno");
    // const replyTest = document.querySelectorAll(".replyAnno");
    // const _test = [testRoot, replyTest];
    // const filterRoot = [];
    // const filterReply = [];
    // for (var i = 0; i < replyTest.length; i++) {
    //   filterReply.push(replyTest[i].dataset.replyAnnotationTarget);
    // }
    // for (var i = 0; i < testRoot.length; i++) {
    //   filterRoot.push(testRoot[i].dataset.target);
    // }
    // console.log(_test);
    // const targetCollection = testRoot.forEach(
    //   (target) => target.item.dataset.target
    // );
    // const replyTargetAnnoArray = Array.from(
    //   document.querySelector(".replyAnno")
    // );
    // const originAnno = Array.from(document.querySelector(".rootAnno"));
    // const filteredResults = filterReply.filter((target) =>
    //   filterRoot.includes(target)
    // );

    // console.log(targetCollection, "reply", replyTest);

    //////////// NEEDS TO WIPE TARGET REPLY AFTER RPELYING TO IT ALSO THE ANNOTATION TYPE HANDLING IS MESSY //////////////////

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
              showReplyButtonContent: "Hide replies",
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
              showReplyButtonContent: "Show replies",
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
          //appendichild is where the magic happens
        }
        // } else {
        //   //if only one anno has replies and the other button is clicked, hides all the replies and alerts the user
        //   // const noLongerShowing = Array.from(
        //   //   rootAnno.getElementsByClassName("showReply")
        //   // );
        //   // noLongerShowing.forEach((noReplyShowing) =>
        //   //   noReplyShowing.classList.add("hiddenReply")
        //   // );
        //   // noLongerShowing.forEach((noReplyShowing) =>
        //   //   noReplyShowing.classList.remove("showReply")
        //   // );
        //   console.warn("no replies to show for this annotation");
        // }
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
    /* determine permission state of annotation in Solid Pod */
    let permission;
    let modifyPermissionsElement;

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
        <span className="accessPermissions">
          User may <b>not</b> modify access
        </span>
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
          // <button
          //   className="changeAccess"
          //   name="changeAccess"
          //   onClick={this.revokePublic}
          // >
          //   Revoke public access
          // </button>
        );
      }
    }
    //stuff that i am carrying around: the annotation's ID you are replying to, the body (currently sits under annotation.source) and the annotation's specific ID
    const motivation = this.props.annotation.motivation;
    const bodyD = this.props.annotation.body[0].value;
    const bodyL = this.props.annotation.body[0].id;
    const bodyMedia = this.props.annotation.body[0].id;
    const target = this.props.annotation.target[0].id;
    const repTarget = this.props.annotation.target;
    const date = this.props.annotation.created;
    const creator = this.props.annotation.creator || "unknown";
    const selfId = this.props.annotation["@id"];

    // const originAnno = document.querySelectorAll("div[data-self-id]");
    // const innerBodyString = this.props.annotation.source;
    // const selfIdData = selfId.dataset.selfId;
    // const rootAnnoTargetIdData = rootAnnoTargetId.dataset.rootAnnotationId;

    switch (motivation) {
      case "describing":
        return (
          <div
            className="rootAnno annoItem"
            data-target={target}
            data-self-id={selfId}
          >
            {" "}
            <p>{bodyD}</p>
            <span className="hiddenDetails">
              {" "}
              <span className="date">
                Created on: {date}, access permissions: {permission}.
              </span>
            </span>
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
              >
                <path
                  fill="grey"
                  d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                ></path>
              </svg>
            </button>
            <p></p>
            permissions: {modifyPermissionsElement}
            <button
              className="replyButton"
              name="replyButton"
              onClick={this.onClick}
            >
              Reply
            </button>
            <button
              className="showRepliesButton"
              name="showRepliesButton"
              onClick={this.onShowReplyClick}
            >
              {this.state.showReplyButtonContent}
            </button>
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
              <span className="hiddenDetails">
                {" "}
                <span className="date">
                  Created on: {date}, access permissions: {permission}.
                </span>
              </span>
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
                >
                  <path
                    fill="grey"
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                  ></path>
                </svg>
              </button>
              <p></p>
              Set permissions: {modifyPermissionsElement}
              <button
                className="replyButton"
                name="replyButton"
                onClick={this.onClick}
              >
                Reply
              </button>
              <button
                className="showRepliesButton"
                name="showRepliesButton"
                onClick={this.onShowReplyClick}
              >
                {this.state.showReplyButtonContent}
              </button>
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
              <span className="hiddenDetails">
                {" "}
                <span className="date">
                  Created on: {date}, access permissions: {permission}.
                </span>
              </span>
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
                >
                  <path
                    fill="grey"
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                  ></path>
                </svg>
              </button>
              <p></p>
              Set permissions: {modifyPermissionsElement}
              <button
                className="replyButton"
                name="replyButton"
                onClick={this.onClick}
              >
                Reply
              </button>
              <button
                className="showRepliesButton"
                name="showRepliesButton"
                onClick={this.onShowReplyClick}
              >
                {this.state.showReplyButtonContent}
              </button>
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
            <span className="hiddenDetails">
              {" "}
              <span className="date">
                Created on: {date}, access permissions: {permission}.
              </span>
            </span>
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
              >
                <path
                  fill="grey"
                  d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                ></path>
              </svg>
            </button>
            <p></p>
            Set permissions: {modifyPermissionsElement}
            <button
              className="replyButton"
              name="replyButton"
              onClick={this.onClick}
            >
              Reply
            </button>
            <button
              className="showRepliesButton"
              name="showRepliesButton"
              onClick={this.onShowReplyClick}
            >
              {this.state.showReplyButtonContent}
            </button>
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
            <p>
              The content of this annotation is a picture, click the button to
              see a preview{" "}
              <button onClick={this.onPreviewclick}>
                {this.state.previewButtonContent}{" "}
              </button>
            </p>
            <span className="hiddenDetails">
              {" "}
              <span className="date">
                Created on: {date}, access permissions: {permission}.
              </span>
            </span>
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
              >
                <path
                  fill="grey"
                  d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                ></path>
              </svg>
            </button>
            <p></p>
            Set permissions: {modifyPermissionsElement}
            <button
              className="replyButton"
              name="replyButton"
              onClick={this.onClick}
            >
              Reply
            </button>
            <button
              className="showRepliesButton"
              name="showRepliesButton"
              onClick={this.onShowReplyClick}
            >
              {this.state.showReplyButtonContent}
            </button>
          </div>
        );
      case "replying":
        return (
          <div
            data-reply-annotation-target={repTarget}
            className="replyAnno hiddenReply"
          >
            <div className="quoteContent">
              <p>Reply: {bodyD}</p>
              <span className="date">Created on: {date}</span>
              {/* <button
                className="replyButton"
                name="replyButton"
                onClick={this.onClick}
              >
                Reply
              </button>
              <button
                className="showRepliesButton"
                name="showRepliesButton"
                onClick={this.onShowReplyClick}
              >
                {this.state.showReplyButtonContent}
              </button> */}
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
            {/* <button
              className="replyButton"
              name="replyButton"
              onClick={this.onClick}
            >
              Reply
            </button>
            <button
              className="showRepliesButton"
              name="showRepliesButton"
              onClick={this.onShowReplyClick}
            >
              Show replies
            </button> */}
          </div>
        );
    }
  };

  render() {
    return <div className="annoItemContainer">{this.renderSwitch()}</div>;
  }
}

export default AnnotationItem;
