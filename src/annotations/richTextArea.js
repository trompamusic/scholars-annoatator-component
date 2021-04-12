import React from "react";
import Button from "./richTextButton";
const buttons = [
  {
    name: "bold",
    value: "<strong></strong>",
    className: "BoldButton",
    buttonContent: <strong>B</strong>,
  },
  {
    name: "italic",
    value: "<em></em>",
    className: "ItalicsButton",
    buttonContent: <em>T</em>,
  },
  {
    name: "underline",
    value: "<u></u>",
    className: "UnderlineButton",
    buttonContent: <u>U</u>,
  },
];

class RichTextArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  insertText(value) {
    let markup = value;
    this.props.onMarkupInsert(markup);
  }
  createCheckbox = (option) => (
    <Button
      data={option}
      onClick={() => this.insertText(option.value)}
      key={option.name}
    />
  );

  buildButtons = () => buttons.map(this.createCheckbox);

  render() {
    return (
      <div className="TextArea">
        <header className="TextareaHeader">
          <span className="TextAreaControls">{this.buildButtons()}</span>
          <textarea
            rows="7"
            className="textArea"
            value={this.props.value}
            placeholder={this.props.placeholder}
            onChange={this.props.onChange}
          />
        </header>
      </div>
    );
  }
}

export default RichTextArea;
