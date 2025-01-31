import "../styles/Home.css";
import Timer from "../components/Timer";
import "../styles/Timer.css";
function Home() {
    return (
        <div className="container">
            
            <div className="MainHead">
                <div className="header-left">
                    <div style={{color:'white'}}>TimeTamer</div>                
                </div>
                <div className="header-right">
                    <button>Log In</button>
                    <button>Sign Up</button>
                    
                </div>
            </div>
            <div className="Maintimer">
                <Timer />
            </div>
            
        </div>
    )
}

export default Home;
