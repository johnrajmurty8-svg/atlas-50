import App from '../components/App';
import destinations from '../data/destinations.json';
import type { Destination } from '../lib/types';

export default function IndexPage() {
  return <App destinations={destinations as Destination[]} />;
}
