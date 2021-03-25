import React from "react";
import auth from "solid-auth-client";
class PlaylistItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resp: "",
    };
    this.delete = this.delete.bind(this);
  }
  delete() {
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

  render() {
    const selfId = this.props.annotation["@id"];
    const title = this.props.annotation.body[0].seconds;
    const link = this.props.annotation.body[0].value;

    return (
      <div className="rootAnno playlistItem">
        <p>{title}</p>
        <iframe
          src={link}
          title={selfId}
          frameBorder="0"
          width="400"
          height="60"
        />
        <button onClick={this.delete}>del</button>
      </div>
    );
  }
}

export default PlaylistItem;
