import { GAME_ROUTE, HOME_ROUTE } from "./utils/consts";
import Home from "./pages/Home"
import Game from "./pages/Game";
export const PublicRoutes = [
    {
        path: HOME_ROUTE,
        element: Home,
    },
    {
        path: GAME_ROUTE,
        element: Game
    }
]