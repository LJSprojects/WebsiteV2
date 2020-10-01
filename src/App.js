import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './App.css';
import Home from './Home/Home';
import Calendar from './Calendar/Calendar';
import logo from './logo.jpg';
import background from './background.jpg';



function App() {

    const [viewHome, setViewHome] = useState(true); 

    const sendMail = () => {
        window.location.href = "mailto:INFO@ljsprojects.com";
    }
    
    const changeView = () => {
        var temp = !viewHome;
        setViewHome(temp);
    }

    return (
        <div id="allContent">
            <div id="leftCol">
                <img id="logo" src={logo} alt="Logo"/>
                <div id="mobileButtons">
                    <div id="contact" className="section">
                        <Button id="contactButton" className="sideButton" onClick={() => sendMail()}>Contact Me</Button>
                    </div>
                </div>
                <div id="contactInfo">
                    <div id="description" className="section">
                        Contact Information
                    </div>
                    <div id="address" className="section">
                        <div id="line1">
                            2413 W Algonquin Rd
                        </div>
                        <div id="line2">
                            Suite #206
                        </div>
                        <div id="line3">
                            Algonquin, IL 60102
                        </div>
                    </div>
                    <div id="phone" className="section" x-ms-format-detection="none">
                        (847)915<span class="notel"></span>-9200
                    </div>
                    <div id="email" className="section">
                        INFO@LJSProjects.com
                    </div>
                </div>
                <div id="buttons">
                    <div id="contact" className="section">
                        <Button id="contactButton" className="sideButton" onClick={() => sendMail()}>Contact Me</Button>
                    </div>
                    <div id="schedule">
                        <Button id="scheduleButton" className="sideButton" onClick={() => changeView()}> {viewHome ? "Schedule an Appointment" : "Back to Home"}</Button>
                    </div>
                </div>
            </div>

            { (viewHome)
                ? <Home></Home>   
                : <Calendar></Calendar>
            }

            {viewHome && <img id="background" src={background} alt="backgroud"/>}
        </div>
    );
}

export default App;