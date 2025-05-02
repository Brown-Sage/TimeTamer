import { MdQueryStats } from "react-icons/md";
import { LuListTodo } from "react-icons/lu";
import { RiGeminiFill } from "react-icons/ri";
import { MdWallpaper } from "react-icons/md";
import { CiClock1 } from "react-icons/ci";
import "../styles/Menu.css"
import { useNavigate } from "react-router-dom";
// import { openTimer } from "./Timer";
import Track from "./Track";

export default function Menu() {
  const navigate = useNavigate();
  const openTimer = () =>{
    document.querySelector('.Maintimer').style.display = 'flex';
}

  const handleThemeClick = () => {
    navigate("/theme");
  };

  return (
    <div className="bottom">
      <div onClick={() => navigate("/stats")} className="stats">
        <LuListTodo />
        <p>Stats</p>
      </div>
      <div onClick={() => navigate("/Track")} className="stats">
        <MdQueryStats />
        <p>Track</p>
      </div>
      <div onClick={openTimer} className="stats">
        <CiClock1 />
        <p>Pomo</p>
      </div>

      {/* <div className="stats">
        <RiGeminiFill />
        <p>AI</p>
      </div> */}
      <div onClick={handleThemeClick} className="stats theme-button">
        <MdWallpaper />
        <p>Themes</p>
      </div>
    </div>
  );
}