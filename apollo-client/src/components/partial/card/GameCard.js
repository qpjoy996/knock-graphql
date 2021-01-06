import React from 'react'
import { importAll, uniqueArray } from 'utils'

class GameCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    const webpackContext = require.context(
      'assets/img/home',
      false,
      /\.(png|jpe?g|svg)$/
    )
    const webpackContextBasic = require.context(
      'assets/img/basic',
      false,
      /\.(png|jpe?g|svg)$/
    )
    const images = importAll(webpackContext)
    const imagesBasic = importAll(webpackContextBasic)
    const { gameList, triggerTrasition, listTabKey } = this.props
    let gameLists = uniqueArray(gameList)
    return (
      <>
        {gameLists && gameLists.length ? (
          <>
            {gameLists.map((item, index) => {
              return (
                <div
                  className="game-card-item"
                  key={item.id}
                  onClick={(e) => {
                    triggerTrasition(item, e, listTabKey)
                    // getGameDetail(item, null, listTabKey, true)
                  }}
                >
                  {listTabKey === '4' ? (
                    <img
                      src={imagesBasic['icon_workshop.png']}
                      className={`card-img ${!item.iconURL ? 'imgError' : ''}`}
                      alt="workshop"
                    />
                  ) : (
                    <img
                      src={images['list_game.png']}
                      className={`card-img ${!item.iconURL ? 'imgError' : ''}`}
                      alt=""
                      imgurl={
                        item.iconURL ? item.iconURL : images['list_game.png']
                      }
                    />
                  )}
                  <div className="card-text">
                    <span>{item.name}</span>
                    <div className="card-text-count">
                      <img
                        className="text-img"
                        src={images['fire-fill.svg']}
                        alt=""
                      />
                      <span className="text-span">{item.heatValue}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        ) : null}
      </>
    )
  }
}

export default GameCard
