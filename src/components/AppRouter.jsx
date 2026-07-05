import { Routes, Route } from 'react-router-dom'
import { PublicRoutes } from '../routes';
const AppRouter = () => {
    return (
        <Routes>
            {PublicRoutes.map((el, index)=>(
                <Route key={index} path={el.path} Component={el.element}/>
            ))}
        </Routes>
    );
};

export default AppRouter;
