import React from "react";
import "./pages-styles/Home.css";
import Logo from "../images/Logo.svg";
import Decor_top from "../images/Decor-top.svg";
import Decor_bottom from "../images/Decor-bottom.svg";
import { Link } from "react-router-dom";
import { GAME_ROUTE } from "../utils/consts";

const Home = () => {
  return (
    <>
      <section className="home">
        <div className="home_container">
          <img src={Logo} alt="" className="home_logo" />
          <div className="home_navigation">
            <Link to={GAME_ROUTE}>
              <button className="home_navigation_single_game_start">
                Play
              </button>
            </Link>
          </div>
        </div>

        <img src={Decor_top} alt="" className="home_decor top" />
        <img src={Decor_bottom} alt="" className="home_decor bottom" />
      </section>
    </>
  );
};

export default Home;
