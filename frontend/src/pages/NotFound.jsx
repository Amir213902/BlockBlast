import React from "react";
import { useNavigate } from "react-router-dom";
import { HOME_ROUTE } from "../utils/consts";
import "./pages-styles/NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="not-found">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title">404</h1>
          <p className="not-found-subtitle">Страница не найдена</p>
          <p className="not-found-text">
            К сожалению, страница, которую вы ищете, не существует.
          </p>
          <button
            className="not-found-button"
            onClick={() => navigate(HOME_ROUTE)}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
