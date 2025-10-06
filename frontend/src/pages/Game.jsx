import React from "react";
import BlockBlast from "../components/BlockBlast";
import "./pages-styles/Game.css";
import iconBack from "../images/Icon_Back.svg";
import iconBest from "../images/Icon_Best Score.svg";
import iconSettings from "../images/Icon_Settings.svg";

const Game = () => {
  return (
    <>
      <section className={`game${window.innerWidth < 500 ? ' scaled' : ''}`}>
        <div className="game_navigations">
          <button className="game_navigations_go home">
            <img src={iconBack} alt="" />
          </button>

          <div className="game_navigations_indicator record">
            <img
              src={iconBest}
              alt=""
              className="game_navigations_indicator_img record"
            />

            <span id="score">0</span>
          </div>

          <button className="game_navigations_go settings" id="settings">
            <img src={iconSettings} alt="" />
          </button>
        </div>
        <div className="game_container">
          <div className="game_container_arena" id="game_container_arena"></div>

          <div className="game_container_drops" id="game_container_drops">
            <div className="game_container_drops_port first"></div>
            <div className="game_container_drops_port second"></div>
            <div className="game_container_drops_port tired"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Game;
