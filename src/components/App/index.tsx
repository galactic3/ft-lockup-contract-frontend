import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from '../../pages/About';
import Users from '../../pages/Users';
import UserLockups from '../../pages/UserLockups';
import Header from '../Header';

export default function App() {
  const [contractState, setContractState] = useState({});

  const loadAllData = () => {
    console.log('UPDATING');
    setContractState({ name: 'name' });
  };

  setTimeout(loadAllData, 5000);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<About contractState={contractState} />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:userId" element={<UserLockups />} />
      </Routes>
    </BrowserRouter>
  );
}
