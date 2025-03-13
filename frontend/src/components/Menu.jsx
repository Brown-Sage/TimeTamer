import { MdQueryStats } from "react-icons/md";
import { LuListTodo } from "react-icons/lu";
import { RiGeminiFill } from "react-icons/ri";
import { MdWallpaper } from "react-icons/md";
import "../styles/Menu.css"
import { useNavigate } from "react-router-dom";
import playaudio from "./Timer";

export default function Menu() {
  const navigate = useNavigate();
  return (
    <div className="bottom">
      <div onClick={() => navigate("/stats")} className="stats">
        <LuListTodo />
        <p>Stats</p>
      </div>
      <div className="stats">
        <MdQueryStats />
        <p>Track</p>
      </div>
      <div onClick= {playaudio} className="stats">
        <RiGeminiFill />
        <p>AI</p>
      </div>
      <div className="stats">
        <MdWallpaper />
        <p>Themes</p>
      </div>
    </div>
  );
}