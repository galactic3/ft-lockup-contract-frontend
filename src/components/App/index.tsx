import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Users from '../../pages/Users';
import Header from '../Header';

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Users />} />
      </Routes>
    </Router>
  );
}
