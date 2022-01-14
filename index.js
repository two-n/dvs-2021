import App from './src/components/App';
import formattedData from './data/formattedData.json';

window.onload = () => {
  new App(formattedData).init();
};

