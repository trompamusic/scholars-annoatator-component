import React from "react";
import PlaylistItem from "./playlistItem";
class renditionsPlaylist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    let target = document.querySelector(".playlist");
    if (this.state.visible === false) {
      this.setState({ visible: !this.state.visible });
      target.classList.remove("hidden");
    } else {
      if (this.state.visible === true) {
        target.classList.add("hidden");
        this.setState({ visible: !this.state.visible });
      }
    }
  }
  render() {
    return (
      <div>
        <button className="renditionButton" onClick={this.onClick}>
          show renditions playlist
        </button>
        <div className="playlist hidden">
          {this.props.allEntries.map((anno) => {
            const motivation = anno.motivation;
            return (
              motivation === "trompa:playlist" && (
                <div key={anno["@id"]}>
                  <PlaylistItem
                    annotation={anno}
                    onRefreshClick={this.props.onRefreshClick}
                  />
                </div>
              )
            );
          })}
        </div>
      </div>
    );
  }
}

export default renditionsPlaylist;
