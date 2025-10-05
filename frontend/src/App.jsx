import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BlockBlast from './components/BlockBlast'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <section className="game">
        <div className="game_navigations">
            <button className="game_navigations_go home">
                <img src="./assets/Icon_Back.svg" alt="" />
            </button>

            <div className="game_navigations_indicator record">
                <img src="./assets/Icon_Best Score.svg" alt="" className="game_navigations_indicator_img record" />

                <span id="score">0</span>
            </div>

            <button className="game_navigations_go settings" id="settings">
                <img src="./assets/Icon_Settings.svg" alt="" />
            </button>
        </div>
        <div className="game_container">

            <div className="game_container_arena" id="game_container_arena">
            </div>

            <div className="game_container_drops" id="game_container_drops">
                <div className="game_container_drops_port first"></div>
                <div className="game_container_drops_port second"></div>
                <div className="game_container_drops_port tired"></div>
            </div>
        </div>
    </section>
    </>
  )
}

export default App
