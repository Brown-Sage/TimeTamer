import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Timer from "../components/Timer";
import "../styles/Timer.css";
import { MdOutlineMenuOpen } from "react-icons/md";
import Menu from "../components/Menu";
import SpotifyFrame from "../components/SpotifyFrame";
import "../styles/SpotifyFrame.css";

function Home() {
    const navigate = useNavigate();

    const handleBreak = () => {
        // Call the break function exposed by Timer
        if (window.handleBreakTimer) {
            window.handleBreakTimer();
        }
    };

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
            <div className="spotify">
                <SpotifyFrame trackUri="7ouMYWpwJ422jRcDASZB7P" />
            </div>
            <div className="Maintimer">
                <div className="Options">
                    <button onClick = {Timer} className="child1">Focus</button>
                    <button onClick={handleBreak} className="child1">Break</button>
                    <button className="child1">Long Break</button>
                </div>
                <Timer />
            </div>
            <Menu />
        </div>
    );
}

export default Home;