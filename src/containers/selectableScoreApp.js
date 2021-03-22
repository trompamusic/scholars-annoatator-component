import React, { Component } from "react";
import SelectableScore from "selectable-score/lib/selectable-score";
import NextPageButton from "selectable-score/lib/next-page-button.js";
import PrevPageButton from "selectable-score/lib/prev-page-button.js";
import AnnotationSubmitter from "../annotations/annotationSubmitter.js";
import SelectionHandler from "../annotations/selectionHandler.js";
import AnnotationList from "../annotations/annotationList.js";
import ReactPlayer from "react-player";
import Modal from "react-modal";

//Modal.setAppElement("root");
//
//const vAdjust = 26; // num. pixels to nudge down anno measureBoxes+
var scale = 50;

let viewPortHeight = window.outerHeight;
let viewPortWidth = window.outerWidth;
// prettier-ignore
var height = (viewPortHeight < 1439) ? 2000 : 2500;
// prettier-ignore
var width = (viewPortWidth > 1925) ? 2800 : 2000;

// height /= scale / 100;
// width /= scale / 100;

export default class SelectableScoreApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      annoValue: "",
      selection: [],
      annotationType: "",
      placeholder: "Add your annotation...",
      uri:
        "https://raw.githubusercontent.com/trompamusic-encodings/Mahler_Symphony_No4_Doblinger-4hands/master/Mahler_No4_1-Doblinger-4hands.mei",
      selectorString: "",
      buttonContent: "Submit to your Solid POD",
      replyAnnotationTarget: [],
      currentAnnotation: [],
      toggleAnnotationRetrieval: false,
      hasContent: true,
      isClicked: false,
      showMEIInput: true,
      currentMedia: this.props.currentMedia || "",
      seekTo: "",
      measuresToAnnotationsMap: {},
      annoToDisplay: [],
      helpWindowIsActive: false,
      replyAnnotationTargetId: "",
      areRepliesVisible: false,
      vrvOptions: {
        scale: scale,
        adjustPageHeight: 0,
        pageHeight: height,
        pageWidth: width,
        footer: "none",
        unit: 6,
      },
    };
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
    this.handleStringChange = this.handleStringChange.bind(this);
    this.onResponse = this.onResponse.bind(this);
    this.onRefreshClick = this.onRefreshClick.bind(this);
    this.onReceiveAnnotationContainerContent = this.onReceiveAnnotationContainerContent.bind(
      this
    );
    this.onSubmitMEI = this.onSubmitMEI.bind(this);
    this.onMEIInputChange = this.onMEIInputChange.bind(this);
    this.hideMEIInput = this.hideMEIInput.bind(this);
    this.onAnnoTypeChange = this.onAnnoTypeChange.bind(this);
    this.onAnnoReplyHandler = this.onAnnoReplyHandler.bind(this);
    this.convertCoords = this.convertCoords.bind(this);
    this.activateModal = this.activateModal.bind(this);
    this.deactivateModal = this.deactivateModal.bind(this);
    this.onMediaClick = this.onMediaClick.bind(this);
    this.showReplyHandler = this.showReplyHandler.bind(this);
    this.handleAnnoShowingUpdate = this.handleAnnoShowingUpdate.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.player = React.createRef();
  }

  zoomIn() {
    let step = 5;
    let initialZoom = this.state.vrvOptions.scale;
    let initialHeight = this.state.vrvOptions.pageHeight;
    let initialWidth = this.state.vrvOptions.pageWidth;
    //   vrvOptions.scale = vrvOptions.scale + step;
    //   vrvOptions.pageHeight = (pageHeight * 100) / vrvOptions.scale;
    //   vrvOptions.pageWidth = (pageWidth * 100) / vrvOptions.scale;
    //
    const newVrvOptions = Object.assign({}, this.state.vrvOptions);
    newVrvOptions.scale = initialZoom + step;
    //prettier-ignore
    newVrvOptions.pageHeight = initialHeight - (newVrvOptions.scale * 5);
    //prettier-ignore
    newVrvOptions.pageWidth = initialWidth - (newVrvOptions.scale * 2);
    if (newVrvOptions.scale < 50) {
      //prettier-ignore
      newVrvOptions.pageWidth = initialWidth - (newVrvOptions.scale * 5);
    }

    if (newVrvOptions.scale < 40) {
      //prettier-ignore
      newVrvOptions.pageHeight = initialHeight - (newVrvOptions.scale * 8);
      //prettier-ignore
      newVrvOptions.pageWidth = initialWidth - (newVrvOptions.scale * 5);
    }
    if (viewPortWidth >= 1925) {
      if (newVrvOptions.pageWidth > 3500) {
        newVrvOptions.pageWidth = 3500;
      }
    }

    if (newVrvOptions.scale >= 80) {
      console.log("max zoom reached");
      return;
    }
    // if (newVrvOptions.pageWidth >= 2380) {
    //   newVrvOptions.pageWidth = 2380;
    // }
    // if (newVrvOptions.pageWidth < 1500 || newVrvOptions.pageWidth > 1500) {
    //   newVrvOptions.pageWidth = 1500;
    // }
    // if (newVrvOptions.pageHeight < 1500 || newVrvOptions.pageHeight > 1500) {
    //   newVrvOptions.pageHeight = 1500;
    // }
    console.log(
      "ZOOM INCREASE",
      newVrvOptions.scale,
      "page w",
      newVrvOptions.pageWidth,
      "page h",
      newVrvOptions.pageHeight
    );
    this.setState({ vrvOptions: newVrvOptions });
  }

  zoomOut() {
    let step = 5;
    let initialZoom = this.state.vrvOptions.scale;
    let initialHeight = this.state.vrvOptions.pageHeight;
    let initialWidth = this.state.vrvOptions.pageWidth;
    //   vrvOptions.scale = vrvOptions.scale + step;
    //   vrvOptions.pageHeight = (pageHeight * 100) / vrvOptions.scale;
    //   vrvOptions.pageWidth = (pageWidth * 100) / vrvOptions.scale;
    //
    const newVrvOptions = Object.assign({}, this.state.vrvOptions);
    newVrvOptions.scale = initialZoom - step;
    //prettier-ignore
    newVrvOptions.pageHeight = initialHeight + (newVrvOptions.scale * 5);
    //prettier-ignore
    newVrvOptions.pageWidth = initialWidth + (newVrvOptions.scale * 2);
    if (newVrvOptions.scale < 50) {
      //prettier-ignore
      newVrvOptions.pageWidth = initialWidth + (newVrvOptions.scale * 5);
    }

    if (newVrvOptions.scale < 40) {
      //prettier-ignore
      newVrvOptions.pageHeight = initialHeight + (newVrvOptions.scale * 8);
      //prettier-ignore
      newVrvOptions.pageWidth = initialWidth + (newVrvOptions.scale * 5);
    }

    if (newVrvOptions.scale <= 25) {
      console.log("minimum zoom reached");
      return;
    }
    // if (newVrvOptions.pageWidth < 1500 || newVrvOptions.pageWidth > 1500) {
    //   newVrvOptions.pageWidth = 1500;
    // }
    // if (newVrvOptions.pageHeight < 1500 || newVrvOptions.pageHeight > 1500) {
    //   newVrvOptions.pageHeight = 1500;
    // }
    console.log(
      "ZOOM DECREASE",
      newVrvOptions.scale,
      "page w",
      newVrvOptions.pageWidth,
      "page h",
      newVrvOptions.pageHeight
    );
    this.setState({ vrvOptions: newVrvOptions });
  }
  showReplyHandler = () => {
    this.setState({ areRepliesVisible: !this.state.areRepliesVisible });
  };
  activateModal = () => {
    this.setState({ helpWindowIsActive: true });
  };

  deactivateModal = () => {
    this.setState({ helpWindowIsActive: false });
  };

  convertCoords(elem) {
    if (
      document.getElementById(elem.getAttribute("id")) &&
      elem.style.display !== "none" &&
      (elem.getBBox().x !== 0 || elem.getBBox().y !== 0)
    ) {
      const x = elem.getBBox().x;
      const width = elem.getBBox().width;
      const y = elem.getBBox().y;
      const height = elem.getBBox().height;
      const offset = elem.closest("svg").parentElement.getBoundingClientRect();
      const matrix = elem.getScreenCTM();
      return {
        x: matrix.a * x + matrix.c * y + matrix.e - offset.left,
        y: matrix.b * x + matrix.d * y + matrix.f - offset.top,
        x2: matrix.a * (x + width) + matrix.c * y + matrix.e - offset.left,
        y2: matrix.b * x + matrix.d * (y + height) + matrix.f - offset.top,
      };
    } else {
      console.warn("Element unavailable on page: ", elem.getAttribute("id"));
      return { x: 0, y: 0, x2: 0, y2: 0 };
    }
  }

  onAnnoTypeChange = (e) =>
    this.setState({
      annotationType: e.target.value,
      placeholder: e.target.placeholder,
      buttonContent: "Submit to your Solid POD",
    });

  handleStringChange(selectorString) {
    this.setState({ selectorString }, () =>
      console.log(this.state.selectorString)
    );
  }

  handleSelectionChange(selection) {
    this.setState({ selection });
    /* and anything else your app needs to do when the selection changes */
  }

  onMEIInputChange = (e) => {
    this.setState({ uri: e.target.value });
  };

  hideMEIInput() {
    this.setState({ showMEIInput: !this.state.showMEIInput });
  }
  //////////// NEEDS TO WIPE TARGET REPLY AFTER RPELYING TO IT ALSO THE ANNOTATION TYPE HANDLING IS MESSY //////////////////
  onAnnoReplyHandler(replyTarget, replyTargetId) {
    this.setState({
      annotationType: "replying",
      placeholder: "you are replying to the selected annotation",
      buttonContent: "Reply to selected Solid annotation",
      replyAnnotationTarget: replyTarget,
      replyAnnotationTargetId: replyTargetId,
    });
  }

  onSubmitMEI = () => {
    this.setState(
      {
        isClicked: true,
      },
      () => {
        this.hideMEIInput();
      }
    );
  };

  onResponse(resp) {
    console.log(resp);
    if (resp.status === 201) {
      this.setState(
        {
          toggleAnnotationRetrieval: true,
        },
        () => {
          this.setState({
            toggleAnnotationRetrieval: false,
            annotationType: "",
            replyAnnotationTarget: [],
            replyAnnotationTargetId: "",
            placeholder: "Add your annotation...",
            annoToDisplay: [],
          });
        }
      );
    } else if (resp.status === 404) {
      alert("folder not found, check your annotation container path!");
    }
  }

  onRefreshClick() {
    if (this.state.hasContent === false) {
      return;
    } else
      this.setState(
        {
          toggleAnnotationRetrieval: true,
        },
        () => {
          this.setState({
            toggleAnnotationRetrieval: false,
            annotationType: "",
            replyAnnotationTarget: [],
            replyAnnotationTargetId: "",
            placeholder: "Add your annotation...",
            annoToDisplay: [],
          });
        }
      );
  }

  onMediaClick(bodyMedia) {
    console.log("button click", bodyMedia);
    //appends http fragment to avoid partial linking error
    //const mediaCue = bodies[0]["id"];
    // TODO validate properly
    const currentMedia = bodyMedia.split("#")[0];
    const seekTo = bodyMedia.split("#")[1].replace("t=", "");
    console.log("Setting up seek to: ", currentMedia, seekTo);
    this.setState({ currentMedia }, () => this.player.current.seekTo(seekTo));
  }

  onReceiveAnnotationContainerContent(content) {
    if (!content || !content.length) {
      alert("no annotation to retrieve");
      const noLongerInFocusList = Array.from(
        document.getElementsByClassName("inFocus")
      );
      noLongerInFocusList.forEach((noFocusElement) =>
        noFocusElement.classList.remove("inFocus")
      );
      document.querySelectorAll(".measureBox").forEach((mb) => mb.remove());
      document
        .querySelectorAll(".measureBoxBackground")
        .forEach((mb) => mb.remove());
      this.setState(
        {
          hasContent: false,
        },
        () => {
          console.log(this.state.hasContent, "no content to retrieve");
          this.setState({ hasContent: true });
        }
      );
      return;
    }
    // FIXME: Validate that these are (TROMPA?) Web Annotations
    content = content.filter((c) => c["@id"].endsWith(".jsonld"));

    let measuresToAnnotationsMapList = content.map((anno) => {
      let distinctMeasures = [];
      // replying annotations don't have distinct measures since they target
      // annotations, *not* MEI elements
      if (anno.motivation !== "replying") {
        const measures = anno.target
          .map((jsonTarget) => {
            const targetId = jsonTarget.id;
            const fragment = targetId.substr(targetId.lastIndexOf("#"));
            const element = document.querySelector(fragment);
            let measure = "";
            if (element) {
              measure = element.closest(".measure");
            }
            return measure;
          })
          .filter((el) => el); // ensure element exists on screen
        distinctMeasures = [...new Set(measures)];
      }
      return { annoId: anno["@id"], measures: distinctMeasures };
    });
    let newMap = {};
    measuresToAnnotationsMapList.forEach((measureToAnnoMap) => {
      measureToAnnoMap.measures.forEach((m) => {
        const mId = m.getAttribute("id");
        if (mId in newMap) {
          newMap[mId].push(measureToAnnoMap.annoId);
        } else {
          newMap[mId] = [measureToAnnoMap.annoId];
        }
      });
    });

    this.setState(
      { currentAnnotation: content, measuresToAnnotationsMap: newMap },
      () => {
        const noLongerInFocusList = Array.from(
          document.getElementsByClassName("inFocus")
        );
        noLongerInFocusList.forEach((noFocusElement) =>
          noFocusElement.classList.remove("inFocus")
        );
        // delete any existing measure boxes so we can redraw from blank slate
        document.querySelectorAll(".measureBox").forEach((mb) => mb.remove());
        document
          .querySelectorAll(".measureBoxBackground")
          .forEach((mb) => mb.remove());
        console.log("Mapped annotaitons ", newMap);
        console.log("current annotations ", content);
        // draw bounding boxes for all measures containing annotations
        const annotatedMeasuresOnScreen = Object.keys(
          this.state.measuresToAnnotationsMap
        ).filter(
          (measureId) => document.querySelectorAll("#" + measureId).length
        );
        console.log(
          "Annotated measures on screen: ",
          annotatedMeasuresOnScreen
        );
        annotatedMeasuresOnScreen.forEach((measureId) => {
          const coords = this.convertCoords(
            document.querySelector("#" + measureId)
          );
          console.log("Coords: ", coords);
          const measureBox = document.createElement("div");
          const measureBoxBackground = document.createElement("div");

          const coordsBox = {
            left: Math.floor(coords.x),
            top: Math.floor(coords.y),
            width: Math.ceil(coords.x2 - coords.x),
            height: Math.ceil(coords.y2 - coords.y),
          };
          console.log("Coords box: ", coordsBox);
          measureBox.setAttribute("id", "measureBox-" + measureId);
          measureBox.setAttribute("class", "measureBox");
          measureBox.setAttribute(
            "style",
            "position: absolute;" +
              "background: rgba(0, 0, 0, 0);" +
              "left: " +
              coordsBox.left +
              "px;" +
              "top: " +
              coordsBox.top +
              "px;" +
              "width: " +
              coordsBox.width +
              "px;" +
              "height: " +
              coordsBox.height +
              "px;" +
              "z-index: 1"
          );

          measureBoxBackground.setAttribute(
            "id",
            "measureBoxBackground-" + measureId
          );
          measureBoxBackground.setAttribute("class", "measureBoxBackground");
          measureBoxBackground.classList.remove("isOpen");
          measureBoxBackground.classList.add("isClosed");
          measureBoxBackground.setAttribute(
            "style",
            "position: absolute;" +
              // "background: rgba(241, 145, 0, 0.25);" +
              // "border:1px solid orange;" +
              "left: " +
              coordsBox.left +
              "px;" +
              "top: " +
              coordsBox.top +
              "px;" +
              "width: " +
              coordsBox.width +
              "px;" +
              "height: " +
              coordsBox.height +
              "px;" +
              "z-index: -1"
          );
          console.log("TRYING TO DRAW", measureBox);
          document
            .querySelector(".annotationBoxesContainer")
            .appendChild(measureBox);
          document
            .querySelector(".annotationBoxesContainer")
            .appendChild(measureBoxBackground);

          // FIXME: might need to work more on the onClick interaction
          // e.preventDefault();
          // const isBoxOpen = Array.from(e.currentTarget.classList).filter((c) =>
          //   c.startsWith("measureBox")
          // );
          // if (isBoxOpen.length > 1) {
          //   console.warn("too many open boxes", e.target);
          // }
          // // remove focus off previous inFocus elements (now outdated)
          // const noLongerOpen = Array.from(
          //   document.getElementsByClassName("isOpen")
          // );
          // noLongerOpen.forEach((noFocusElement) =>
          //   noFocusElement.classList.remove("isOpen")
          // );
          // // add focus to newly inFocus elements
          // const inOpenList = Array.from(
          //   document.getElementsByClassName(isBoxOpen[0])
          // );
          // inOpenList.forEach((focusElement) =>
          //   focusElement.classList.add("isOpen")
          // );

          measureBox.onclick = (e) => {
            const noLongerInFocusList = Array.from(
              document.getElementsByClassName("inFocus")
            );
            noLongerInFocusList.forEach((noFocusElement) =>
              noFocusElement.classList.remove("inFocus")
            );
            const bgBoxes = document.querySelectorAll(".measureBoxBackground");
            const frontBox = e.target.closest(".measureBox");
            bgBoxes.forEach((box) => {
              box.classList.add("isClosed");
              box.classList.remove("isOpen");
              const bgBoxId = box.id.split("measureBoxBackground-")[1];
              const frontBoxId = frontBox.id.split("measureBox-")[1];

              if (frontBoxId === bgBoxId) {
                box.classList.remove("isClosed");
                box.classList.add("isOpen");
                // box.setAttribute(
                //   "style",
                //   "position: absolute;" +
                //     "background: rgb(255, 255, 255);" +
                //     "border:1px solid orange;" +
                //     "left: " +
                //     coordsBox.left +
                //     "px;" +
                //     "top: " +
                //     coordsBox.top +
                //     "px;" +
                //     "width: " +
                //     coordsBox.width +
                //     "px;" +
                //     "height: " +
                //     coordsBox.height +
                //     "px;" +
                //     "z-index: -1"
                // );
              }
            });

            const noLongerShowing = Array.from(
              document.getElementsByClassName("showReply")
            );
            console.log("no longer showing ", noLongerShowing);
            //hides them
            if (noLongerShowing.length) {
              //const replyHolder = document.createElement("div");
              if (this.state.areRepliesVisible === true) {
                this.setState({ areRepliesVisible: false });
              }
              const annoContainer = document.querySelector(".listContainer");
              console.log(annoContainer);
              //annoContainer.appendChild(replyHolder);
              noLongerShowing.forEach((noReplyShowing) => {
                noReplyShowing.classList.add("hiddenReply");
                annoContainer.appendChild(noReplyShowing);
              });
              noLongerShowing.forEach((noReplyShowing) =>
                noReplyShowing.classList.remove("showReply")
              );
            }
            this.handleAnnoShowingUpdate(content, measureId);
          };
        });
      }
    );
    console.log("iteration succeded");

    content.forEach((anno) => {
      if (anno.motivation !== "replying") {
        anno.target.forEach((jsonTarget) => {
          const bodies = anno.body;
          const targetId = jsonTarget.id;
          const fragment = targetId.substr(targetId.lastIndexOf("#"));
          const element = document.querySelector(fragment);
          if (!element) {
            return console.warn("no content has been found");
          }
          const annoId = anno["@id"];
          const annoIdFragment = annoId.substr(annoId.lastIndexOf("/") + 1);
          //checks what's the motivation of the target
          switch (anno.motivation) {
            case "describing":
              if (bodies.length) {
                if ("value" in bodies[0]) {
                  // const title = document.createElementNS(
                  //   "http://www.w3.org/2000/svg",
                  //   "title"
                  // );
                  // Embeds the annotation text into this title node
                  //title.innerHTML = bodies[0]["value"];
                  //element.insertBefore(title, element.firstChild);
                  //element.classList.add(anno.anno.motivation);
                  element.classList.add("focus-" + annoIdFragment);
                }
              }
              break;
            case "linking":
              if (bodies.length) {
                // make the target clickable, linking to the (first) body URI
                // element.addEventListener(
                //   "click",
                //   function () {
                //     //appends http fragment to avoid partial linking error
                //     const URL = bodies[0]["id"];
                //     if (URL.startsWith("http")) {
                //       window.open(URL, "_blank");
                //     } else {
                //       const appendURL = "https://" + URL;
                //       window.open(appendURL, "_blank");
                //     }
                //   },
                //   true
                // );
                // and turn the cursor into a pointer as a hint that it's clickable
                element.classList.add("focus-" + annoIdFragment);
                //element.classList.add(anno.anno.motivation);
                element.classList.add("focus-" + annoIdFragment);
              }
              break;
            case "trompa:cueMedia":
              if (bodies.length) {
                // make the target clickable, seeking player to the (first) body media cue
                // element.onMediaClick = () => {
                //   //appends http fragment to avoid partial linking error
                //   const mediaCue = bodies[0]["id"];
                //   // TODO validate properly
                //   const currentMedia = mediaCue.split("#")[0];
                //   const seekTo = mediaCue.split("#")[1].replace("t=", "");
                //   console.log("Setting up seek to: ", currentMedia, seekTo);
                //   this.setState({ currentMedia }, () =>
                //     this.player.current.seekTo(seekTo)
                //   );
                // };
                // and turn the cursor into a pointer as a hint that it's clickable
                element.classList.add("focus-" + annoIdFragment);
                //element.classList.add("cueMedia");
              }
              break;
            case "trompa:cueImage":
              if (bodies.length) {
                element.classList.add("focus-" + annoIdFragment);
                //element.classList.add("cueMedia");
              }
              break;
            default:
              console.log(
                "sorry, don't know what to do for this annotation boss"
              );
          }
        });
      }
    });
  }
  handleAnnoShowingUpdate(content, measureId) {
    let _annoIds = content.map((jsonIds) => {
      const annotationsIds = jsonIds["@id"];
      return annotationsIds;
    });
    let _filteredAnnoIds = this.state.measuresToAnnotationsMap[measureId];
    let compare = _annoIds.filter((anno) => _filteredAnnoIds.includes(anno));
    // compare has all annotation IDs *for our measure*
    // we want those, PLUS all replying annotations (which aren't tied to measures)
    const annotationsToDisplay = [
      ...compare,
      ...content
        .filter((anno) => anno.motivation === "replying") // get the replies
        .map((anno) => anno["@id"]), // and return their IDs
    ];
    console.log("to display: ", annotationsToDisplay);
    this.setState({
      annoToDisplay: annotationsToDisplay,
    });
  }
  handleScoreUpdate(scoreElement) {
    console.log("Received updated score DOM element: ", scoreElement);
  }

  render() {
    const modal = this.state.helpWindowIsActive ? (
      <Modal
        isOpen={this.state.helpWindowIsActive}
        onRequestClose={this.deactivateModal}
        contentLabel="my modal"
        className="mymodal"
        overlayClassName="myoverlay"
        ariaHideApp={false}
      >
        <div>
          <header className="modal-header">
            <h2 className="modal-title">This modal has a title</h2>
          </header>
          <div className="modal-body">
            <p>Subtitle</p>
            <div style={{ height: 200, overflow: "auto" }}>
              <h3>Internally Scrolling Region</h3>
              <p>
                THIS IS A DEPLOYMENT TEST Lorem ipsum dolor sit amet,
                consectetur adipisicing elit, sed do eiusmod tempor incididunt
                ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in
                voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
          <footer className="modal-footer">
            <button onClick={this.deactivateModal}>deactivate modal</button>
          </footer>
        </div>
      </Modal>
    ) : (
      false
    );
    return (
      <div>
        {this.state.isClicked === true && (
          <div>
            <div className="scoreContainer">
              <div className="annotationBoxesContainer" />
              <SelectableScore
                uri={this.state.uri}
                annotationContainerUri={this.props.submitUri}
                vrvOptions={this.state.vrvOptions}
                onSelectionChange={this.handleSelectionChange}
                selectorString={this.state.selectorString}
                onScoreUpdate={this.handleScoreUpdate}
                onReceiveAnnotationContainerContent={
                  this.onReceiveAnnotationContainerContent
                }
                toggleAnnotationRetrieval={this.state.toggleAnnotationRetrieval}
                selectionArea=".scoreContainer"
              />
            </div>
            <div className="prevPageButton">
              <PrevPageButton
                buttonContent={<span>| &lt;</span>}
                uri={this.state.uri}
              />
            </div>
            <button
              onClick={this.zoomOut}
              style={{
                marginLeft: "54%",
                position: "absolute",
                bottom: "90%",
              }}
            >
              -
            </button>
            {/* <div className="divider"></div> */}
            {/* pass anything as buttonContent that you'd like to function as a clickable next page button */}
            <button
              onClick={this.zoomIn}
              style={{
                marginLeft: "57%",
                position: "absolute",
                bottom: "90%",
              }}
            >
              +
            </button>
            <div className="nextPageButton">
              <NextPageButton
                buttonContent={<span> &gt; |</span>}
                uri={this.state.uri}
              />
            </div>
          </div>
        )}
        {this.state.showMEIInput && (
          <div>
            <p>Select your MEI file:</p>
            <input
              type="text"
              onChange={this.onMEIInputChange}
              placeholder="mahler four hands rendition..."
              className="sizedTextBox"
            />

            <input
              title="click to render the linked MEI file"
              className="MEIButton"
              type="button"
              onClick={this.onSubmitMEI}
              value="render"
            />
          </div>
        )}

        {/*selector for the component selection*/}
        <SelectionHandler
          selectorString={this.state.selectorString}
          handleStringChange={this.handleStringChange}
        />
        {/*annotation submission component*/}
        <AnnotationSubmitter
          onAnnoTypeChange={this.onAnnoTypeChange}
          uri={this.state.uri}
          submitUri={this.props.submitUri}
          selection={this.state.selection}
          onResponse={this.onResponse}
          onRefreshClick={this.onRefreshClick}
          annotationType={this.state.annotationType}
          placeholder={this.state.placeholder}
          replyAnnotationTarget={this.state.replyAnnotationTarget}
          buttonContent={this.state.buttonContent}
          creator={this.props.userId}
          selectorString={this.state.selectorString}
          replyAnnotationTargetId={this.state.replyAnnotationTargetId}
          replyAnnoBody={this.state.replyAnnoBody}
        />
        {/*as buttonContent that you'd like to function as a clickable prev page
        button */}

        <AnnotationList
          allEntries={this.state.currentAnnotation}
          filteringEntries={this.state.annoToDisplay}
          onAnnoReplyHandler={this.onAnnoReplyHandler}
          onMediaClick={this.onMediaClick}
          replyAnnotationTarget={this.state.replyAnnotationTarget}
          showReplyHandler={this.showReplyHandler}
          areRepliesVisible={this.state.areRepliesVisible}
          onRefreshClick={this.onRefreshClick}
        />
        <div>
          <button
            onClick={this.activateModal}
            style={{ padding: "5px", marginTop: "5px" }}
          >
            help
          </button>
          {modal}
        </div>
        <ReactPlayer
          width="80%"
          height="80%"
          ref={this.player}
          url={this.state.currentMedia}
          controls={true}
          onReady={() => {
            if (this.state.seekTo) {
              console.log("Seeking to: ", this.state.seekTo);
              this.player.current.seekTo(Math.floor(this.state.seekTo));
              this.setState({ seekTo: "" });
            }
          }}
        />
      </div>
    );
  }
}
