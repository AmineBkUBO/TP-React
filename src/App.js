import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom'
import {Login} from "./user/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from "./components/Chat";
import {Register} from "./user/Register";

function App() {

  return (
      <Routes>
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          <Route
              path="/chat"
              element= { <Chat />}
          />

      </Routes>
  );
}

export default App;
