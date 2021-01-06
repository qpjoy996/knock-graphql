import React from 'react';

const loadedItems = [];
class ImgLoade extends React.Component {

  getLoadedItems = (item) => {
    loadedItems.push({ userID: item.userID, iconURL: item.iconURL });
    this.props.loadedItems(loadedItems);
  }

  render () {
    const { imgItems, imgUrl } = this.props;
    // 如果imgItems中iconURL为空，默认为‘’？
    return (
      <div className="hidden-imgload">
        {
          imgUrl === undefined ? (imgItems === undefined ? null : (
            <div>
              {imgItems.map((item, i) =>
                <img src={item.iconURL} onLoad={() => { this.getLoadedItems(item) }} key={i} alt="load" />
              )}
            </div>
          ))
            : <img src={imgUrl} onLoad={() => this.props.loadedImg(imgUrl)} alt="load" />
        }
      </div>
    )
  }
}

export default ImgLoade;
