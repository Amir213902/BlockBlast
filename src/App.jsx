import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <OfflineIndicator />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
