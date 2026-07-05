import { GAME_ROUTE, HOME_ROUTE } from "./utils/consts";
import Home from "./pages/Home"
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";

export const PublicRoutes = [
    {
        path: HOME_ROUTE,
        element: Home,
    },
    {
        path: GAME_ROUTE,
        element: Game
    },
    {
        path: "*",
        element: NotFound
    }
]