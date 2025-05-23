import "../styles/smallanimations.css";
import Lottie from "lottie-react";
import cash from '../assets/animations/cash.json';
import idea from '../assets/animations/idea.json';
import streak from '../assets/animations/streak.json';
export default function SmallAnimations() {
    return (
        <div className="animcontainer">
            <div className="cash">
                <Lottie 
                    animationData={cash} 
                    loop={true} 
                    autoplay={true}
                />
                
            </div>
        
            <div className="streak">
                <Lottie 
                    animationData={streak} 
                    loop={true} 
                    autoplay={true}
                />
                0
            </div>
            <div className="idea">
                <Lottie 
                    animationData={idea} 
                    loop={true} 
                    autoplay={true}
                />
            </div> 
        </div>
    );
}