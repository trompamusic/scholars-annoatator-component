/* addAnnotation contains the submitButton component imported from the selectable score component, this handles the logic behind the POST to solid */
/* also the input field changes based on the chosen annotation motivation*/
import React from "react";
import SubmitButton from "selectable-score/lib/submit-button.js";

export class Addannotation extends React.Component {
  state = {
    value: "",
    seconds: "",
    target: [],
    buttonStatus: "disabledSubmitButton",
  };
  onChange = (e) => this.setState({ value: e.target.value });

  onTimeChange = (e) =>
    this.setState({ seconds: e.target.value }, () =>
      console.log(this.state.seconds)
    );

  wipeState() {
    this.setState({ value: "", seconds: "" });
  }

  render() {
    //packages the two states in one variable. The submithandlerArgs then are read with .value and .seconds from the submitHandler function
    let value = this.state.value;
    let seconds = this.state.seconds;
    let handlerArgs = {
      value,
      seconds,
    };

    return (
      <div>
        {this.props.annotationType === "playlist" && (
          <div>
            <input
              type="text"
              value={this.state.value}
              name="value"
              placeholder="enter link here"
              onChange={this.onChange}
              className="sizedTextBox"
            />
            <span> with title: </span>
            <input
              type="text"
              placeholder="title"
              name="seconds"
              value={this.state.seconds}
              onChange={this.onTimeChange}
              className="sizedTextBox"
            />
          </div>
        )}
        {this.props.annotationType !== "cueMedia" && (
          <textarea
            className="textArea"
            id="annotationContent"
            name="value"
            value={this.state.value}
            placeholder={this.props.placeholder}
            onChange={this.onChange}
          />
        )}
        {this.props.annotationType === "cueMedia" && (
          <div>
            <input
              type="text"
              value={this.state.value}
              name="value"
              placeholder="enter link here"
              onChange={this.onChange}
              className="sizedTextBox"
            />
            <span> jump to: </span>
            <input
              type="text"
              pattern="[0-9]"
              placeholder="seconds"
              name="seconds"
              value={this.state.seconds}
              onChange={this.onTimeChange}
              className="sizedTextBox"
            />
          </div>
        )}
        {this.state.value && (
          <button
            className="enabledSubmitButton"
            title="click to post your annotation to your solid POD"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="arrow-alt-to-top"
              className="svg-inline--fa fa-arrow-alt-to-top fa-w-12"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              width="1em"
              height="1em"
              display="inline-flex"
            >
              <path
                fill="white"
                d="M48 336h51.6v96c0 26.5 21.5 48 48 48h88.6c26.5 0 48-21.5 48-48v-96h51.6c42.6 0 64.2-51.7 33.9-81.9l-143.9-144c-18.7-18.7-49.1-18.7-67.9 0l-144 144C-16 284.2 5.3 336 48 336zm144-192l144 144h-99.7v144h-88.6V288H48l144-144zM0 68V44c0-6.6 5.4-12 12-12h360c6.6 0 12 5.4 12 12v24c0 6.6-5.4 12-12 12H12C5.4 80 0 74.6 0 68z"
              ></path>
            </svg>{" "}
            <SubmitButton
              buttonContent={this.props.buttonContent}
              submitUri={this.props.submitUri}
              submitHandler={this.props.submitHandler}
              submitHandlerArgs={handlerArgs}
              onResponse={this.props.onResponse}
            />
          </button>
        )}
        {!this.state.value && (
          <button
            className="disabledSubmitButton"
            title="click to post your annotation to your solid POD"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="file-import"
              className="svg-inline--fa fa-file-import fa-w-16"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="1em"
              height="1em"
              display="inline-flex"
            >
              <path
                fill="white"
                d="M497.83 97.98L413.94 14.1c-9-9-21.2-14.1-33.89-14.1H175.99C149.5.1 128 21.6 128 48.09v215.98H12c-6.63 0-12 5.37-12 12v24c0 6.63 5.37 12 12 12h276v48.88c0 10.71 12.97 16.05 20.52 8.45l71.77-72.31c4.95-4.99 4.95-13.04 0-18.03l-71.77-72.31c-7.55-7.6-20.52-2.26-20.52 8.45v48.88H175.99V48.09h159.97v103.98c0 13.3 10.7 23.99 24 23.99H464v287.95H175.99V360.07H128v103.94c0 26.49 21.5 47.99 47.99 47.99h287.94c26.5 0 48.07-21.5 48.07-47.99V131.97c0-12.69-5.17-24.99-14.17-33.99zm-113.88 30.09V51.99l76.09 76.08h-76.09z"
              ></path>
            </svg>{" "}
            <SubmitButton
              buttonContent="Select measures to begin"
              submitUri={this.props.submitUri}
              submitHandler={this.props.submitHandler}
              submitHandlerArgs={handlerArgs}
              onResponse={this.props.onResponse}
            />
          </button>
        )}
        <span>
          <button
            onClick={this.props.onRefreshClick}
            className="refreshButton"
            title="click to display the annotation contained in your solid POD"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="redo-alt"
              className="svg-inline--fa fa-redo-alt fa-w-16"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="1em"
              height="1em"
              display="inline-flex"
            >
              <path
                fill="white"
                d="M256.455 8c66.269.119 126.437 26.233 170.859 68.685l35.715-35.715C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.75c-30.864-28.899-70.801-44.907-113.23-45.273-92.398-.798-170.283 73.977-169.484 169.442C88.764 348.009 162.184 424 256 424c41.127 0 79.997-14.678 110.629-41.556 4.743-4.161 11.906-3.908 16.368.553l39.662 39.662c4.872 4.872 4.631 12.815-.482 17.433C378.202 479.813 319.926 504 256 504 119.034 504 8.001 392.967 8 256.002 7.999 119.193 119.646 7.755 256.455 8z"
              ></path>
            </svg>

            <span>{""} Fetch Annotations</span>
          </button>
        </span>
      </div>
    );
  }
}

export default Addannotation;

/* old */
/* <button
          style={{ padding: "5px", marginBottom: "5px" }}
          onClick={() => this.setState({ visible: !visible })}
        >
          Toggle legend
        </button>
        {this.state.visible === true && (
          <div>
            <h4>Annotation legend</h4>

            <span className="selectionLegend" />
            <span>currently selected</span>

            <span className="descriptionLegend" />
            <span>descriptive annotation</span>

            <span className="linkingLegend" />
            <span>linking annotation</span>

            <span className="cueMediaLegend" />
            <span>cue media annotation</span>

            <span className="replyLegend" />
            <span>replying annotation</span>

            <span className="focusLegend" />
            <span>highlighted annotation</span>
          </div>
        )} */
