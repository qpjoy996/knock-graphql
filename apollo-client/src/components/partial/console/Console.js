import React, { useState, useContext } from 'react'
import { PlatformContext } from "states/context/PlatformContext";
import { SEARCH_GAME_LIST } from "@gql"
import { history } from 'react-router-guard'

export default function Console() {
  const [gameList, setGameList] = useState([])
  const context = useContext(PlatformContext)
  const { client } = context

  const handleSearch = async (e) => {
    const searchVal = e.target.value;
    if (searchVal.length < 4) {
      setGameList([])
    } else {
      const games = await client._query({
        query: SEARCH_GAME_LIST,
        variables: {
          skipLen: 0,
          limitLen: 9999,
          keyword: searchVal
        },
        passCondition: ['data']
      })
      if (games) {
        const {searchGameList} = games
        setGameList(searchGameList || [])
      }
    }
  }

  const goDetail = (id) => {
    history.push(`/home/games/${id}`)
  }

  return (
    <div className="console-wrapper">
      <input type="text" className="search-bar" onInput={e => handleSearch(e)} placeholder="输入至少4个字符搜索游戏" />
      <div className="console-list">
        {gameList.map(item => {
          return <div key={item.id} className="console-row" onClick={() => goDetail(item.id)}>
            <img src={item.iconURL} alt="" />
            <div className="name">{item.name}</div>
            <div>{item.version}</div>
          </div>
        })}
      </div>
    </div>
  )
}
