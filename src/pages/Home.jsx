import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Timer from "../components/Timer";
import "../styles/Timer.css";
import { MdOutlineMenuOpen } from "react-icons/md";
import Menu from "../components/Menu";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="container">
            <div className="MainHead">
                <div className="header-left">
                    <button><MdOutlineMenuOpen color="white" fontSize={30} /></button>
                </div>
                <div className="header-right">
                    <button onClick={() => navigate("/login")}>Log In</button>
                    <button onClick={() => navigate("/signin")}>Sign Up</button>
                </div>
            </div>
            <div className="Maintimer">
                <div className="Options">
                    <button className="child1">Focus</button>
                    <button className="child1">Break</button>
                    <button className="child1">Long Break</button>
                </div>
                <Timer />
                
            </div>
            <Menu />
        </div>
    );
}

export default Home;
