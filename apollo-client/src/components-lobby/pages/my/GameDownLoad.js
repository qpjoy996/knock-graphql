import React, { Component } from 'react';

class GameDownLoad extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount () {
    let downLoad = decodeURIComponent(this.props.location.search);
    let saveArray = downLoad.replace('?id=', '').split('&');
    // console.log(saveArray);
    this.saveSmap(saveArray);
  }

  saveSmap = (saveArray) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", saveArray[2]);
    xhr.responseType = "blob";
    xhr.onload = function () {
      const blob = xhr.response;
      const a = document.createElement("a");
      a.download = `${decodeURIComponent(saveArray[0]) + "-" + saveArray[1]}.smap`;
      a.href = window.URL.createObjectURL(blob);
      a.click();
    };
    xhr.onerror = function () {
      console.error("could not download file");
    };
    xhr.send();
  }

  render () {
    return (
      <div className="game-down-load"></div>
    )
  }
}

export default GameDownLoad;
