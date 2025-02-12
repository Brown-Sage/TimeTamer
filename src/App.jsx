import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import SignIn from "./components/Signin";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home/:user/" element={<Home />} />
      </Routes>
      <ToastContainer
                position="top-right"
                theme="dark"
                autoClose={3000}
                closeOnClick={true}
                hideProgressBar
            />
    </Router>

  );
}

export default App;
