import "../styles/Home.css";
import Timer from "../components/Timer";
import "../styles/Timer.css";
import Login from "../components/Login";
function Home() {
    return (
        <div className="container">
            
            <div className="MainHead">
                <div className="header-left">
                    <div style={{ color: 'white' }}>TimeTamer</div>
                </div>
                <div className="header-right">
                    <button onClick={() => <Login />} >Log In</button>
                    <button>Sign Up</button>
                    
                </div>
            </div>
            <div className="Maintimer">
                <div>Focus</div>
                <div>Break</div>
                <div>Long Break</div>
                <Timer />
            </div>
            
        </div>
    );
}

export default Home;
