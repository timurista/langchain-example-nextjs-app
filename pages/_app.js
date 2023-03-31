import '../styles/globals.css';
import { RootProvider } from '../store/rootProvider';

function MyApp({ Component, pageProps }) {
  return (
    <RootProvider>
      <Component {...pageProps} />
    </RootProvider>
  );
}

export default MyApp;
