import { Provider } from 'react-redux';
import { store } from './store';
import { WidgetContainer } from './pages/widget-container/WidgetContainer';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="widget-container">
        <WidgetContainer />
      </div>
    </Provider>
  );
}

export default App;
