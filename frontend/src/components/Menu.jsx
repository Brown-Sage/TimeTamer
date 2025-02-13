import { MdQueryStats } from "react-icons/md";
import { LuListTodo } from "react-icons/lu";
import { RiGeminiFill } from "react-icons/ri";
import { MdWallpaper } from "react-icons/md";
import "../styles/Menu.css"

export default function Menu() {
  return (
    <div className="bottom">
      <div className="stats">
        <LuListTodo />
        <p>Stats</p>
      </div>
      <div className="stats">
        <MdQueryStats />
        <p>Track</p>
      </div>
      <div className="stats">
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