import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  return (
    <BrowserRouter>
      <OfflineIndicator />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;