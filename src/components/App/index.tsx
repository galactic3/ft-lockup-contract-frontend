import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from '../../pages/About';
import Users from '../../pages/Users';
import UserLockups from '../../pages/UserLockups';
import Header from '../Header';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:userId" element={<UserLockups />} />
      </Routes>
    </BrowserRouter>
  );
}
