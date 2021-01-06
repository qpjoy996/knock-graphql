import React from 'react';
import { getCachedImg } from "utils";

class CachedImg extends React.Component {
  render() {
    const { src, alt } = this.props;
    return <img src={getCachedImg(src)} alt={alt || ""}></img>
  }
}

export default CachedImg