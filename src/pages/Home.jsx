import "./pages-styles/Home.css";
import Logo from "../images/Logo.svg";
import Decor_top from "../images/Decor-top.svg";
import Decor_bottom from "../images/Decor-bottom.svg";
import { Link } from "react-router-dom";
import { GAME_ROUTE } from "../utils/consts";

const BEST_SCORE_KEY = "block-blast-best-score";

const Home = () => {
  const bestScore = Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;

  return (
    <>
      <section className="home">
        <div className="home_gradient" aria-hidden="true" />
        <div className="home_blocks" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="home_container">
          <div className="home_logo_panel">
            <img src={Logo} alt="" className="home_logo" />
          </div>
          <div className="home_navigation">
            <Link to={GAME_ROUTE}>
              <button className="home_navigation_single_game_start">
                Играть
              </button>
            </Link>
            <div className="home_navigation_grid">
              <Link to={`${GAME_ROUTE}?settings=themes`}>
                <button className="home_navigation_secondary themes">
                  Темы
                </button>
              </Link>
              <Link to={`${GAME_ROUTE}?settings=custom`}>
                <button className="home_navigation_secondary custom">
                  Своя арена
                </button>
              </Link>
            </div>
            <div className="home_record">
              <span>Рекорд</span>
              <strong>{bestScore}</strong>
            </div>
          </div>
        </div>

        <img src={Decor_top} alt="" className="home_decor top" />
        <img src={Decor_bottom} alt="" className="home_decor bottom" />
      </section>
    </>
  );
};

export default Home;
