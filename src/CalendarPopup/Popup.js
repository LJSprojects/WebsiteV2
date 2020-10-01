import React, {useEffect, useState} from 'react';
import './Popup.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import {db} from '../firebase';
import { InputGroup } from 'react-bootstrap';
import ApiCalendar from 'react-google-calendar-api';
//import serviceAccount from '../ljsprojects-1600293937666-e2501f814630.json'

function Popup(props){
    var timeArray = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // const CLIENT_ID = '272509791466-sq3clks02im0dfbhjucqp9hs58osav7a.apps.googleusercontent.com';
    // const API_KEY = 'AIzaSyCGXctsPmIJ8je6OPsPbVGie2qTY9Ma8zc';
    // const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    // const SCOPES = "https://www.googleapis.com/auth/calendar";
    // {
    //     "clientId":"272509791466-sq3clks02im0dfbhjucqp9hs58osav7a.apps.googleusercontent.com",
    //     "apiKey":"AIzaSyCGXctsPmIJ8je6OPsPbVGie2qTY9Ma8zc",
    //     "scope": "https://www.googleapis.com/auth/calendar",
    //     "discoveryDocs": ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
    //   }
//Client ID: 272509791466-sq3clks02im0dfbhjucqp9hs58osav7a.apps.googleusercontent.com
//Client Secret: MNhQhdZE5NquqLpnWjx8BLee
//API Key: AIzaSyCGXctsPmIJ8je6OPsPbVGie2qTY9Ma8zc
//Project Number: 272509791466

//google calendar login info
//Email: ljs4240@gmail.com
//Password: Zach2017!

// https://console.developers.google.com/apis/credentials/oauthclient/$272509791466-sq3clks02im0dfbhjucqp9hs58osav7a.apps.googleusercontent.com?project=$272509791466

    // const service = serviceAccount.map( (account) => {
    //     console.log(account);
    // })

    const handleClose = () => {
        props.newData(true);
        props.view(false);
    }
    
    const pickTime = (time) => {
        document.getElementById("timeDisplay").value = time;
    }

    const confirmTime = async () => {
        //console.log("confirming time")
        var time = document.getElementById("timeDisplay").value;
        var name = document.getElementById("nameDisplay").value;
        var email = document.getElementById("emailDisplay").value;
        var index = time.indexOf(":");
        var before = time.substring(0,index);
        var after = time.substring(index+1, index+3);
        var timeString = before + after;
        if(timeString.length < 4){
            timeString = "0" + timeString;
        }

        var monthyear = "";
        var m = props.month + 1;
        if(m < 10){
            monthyear = "0";
        }
        monthyear += m;
        monthyear += props.year;

        var dayID = "";
        if(props.day < 10){
            dayID = "0";
        }
        dayID += props.day;
        if(name.length < 1 || timeString.length < 2){
            alert("You Must Enter a Time, Name and Valid Email")
        } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
            alert("You Must Enter a Time, Name and Valid Email")
        } else {
            getMonthData(monthyear, dayID, time, name, email, timeString);
        }
    }

    const getMonthData = (monthYear, dayID, time, name, email, timeString) => {
        var monthData = db.collection("months").doc(monthYear);
        monthData.get().then((monthDoc) => {
            if(monthDoc.exists){
                getDayData(monthYear, dayID, time, name, email, timeString);
            } else {
                monthData.set({
                    filler: "hi",
                })
                getMonthData(monthYear, dayID, time, name, email, timeString);
            }
        })
    }

    const getDayData = (monthYear, dayID, time, name, email, timeString) => {
        var dateString = months[props.month] + " " + props.day + ", " + props.year

        var dayData = db.collection("months").doc(monthYear).collection("Days").doc(dayID);
        dayData.get().then((dayDoc) => {
            if(dayDoc.exists){
                var apps = dayDoc.data().Appointments;
                apps.push({
                    "Time": timeString,
                    "Name": name,
                    "Email": email
                })
                dayData.update({
                    Appointments: apps,
                })
            } else {
                var apps = [];
                apps.push({
                    "Time": timeString,
                    "Name": name,
                    "Email": email
                })
                dayData.set({
                    Appointments: apps,
                })
                
            }
        })
        alert("Appointment Scheduled for " + dateString + " at " + time + ". \n Thank you for booking an appointment! If you need to make a change to your appointment status please contact us at INFO@LJSProjects.com");
        handleClose();
        //startAddingEvent(time, name, email)
    }

    useEffect(() => {
        //ApiCalendar.handleAuthClick();
    }, []);

    const startAddingEvent = (time, name, email) => {
        if(time.length > 1){
            var year = props.year;
            var month = "" + (props.month + 1);
            var day = "" + props.day;
            if(month.length === 1){
                month = "0" + month;
            }
            if(day.length === 1){
                day = "0" + day;
            }
            var timeSpace = time.indexOf(" ");
            var suffix = time.substring(timeSpace+1);
            var timeIndex = time.indexOf(":");
            var timeNum = parseInt(time.substring(0,timeIndex));
            if(suffix === "PM" && timeNum !== 12){
                timeNum += 12;
            }
            var endTime = timeNum + 1;
            if(timeNum < 10){
                timeNum = "0" + timeNum
            }
            if(endTime < 10){
                endTime = "0" + endTime
            }
            var timeStart = year + '-' + month + '-' + day + 'T' + timeNum + ":00:00-05:00"
            var timeEnd = year + '-' + month + '-' + day + 'T' + endTime + ":00:00-05:00"
            var summary = "Meeting with " + name;
            var description = "Name: " + name + ", Email: " + email;
            addGoogleEvent(timeStart, timeEnd, summary, description);
            //console.log(timeStart, timeEnd)

        }
    }

    const addGoogleEvent = (timeStart, timeEnd, summary, description) => {
        if(ApiCalendar.sign){  
            var newEvent = {
                'start': {
                    'dateTime': timeStart,//end,
                },
                'end': {
                    'dateTime': timeEnd,//start,
                },
                'summary': summary,
                'description': description,
                //'location': address
            };
            ApiCalendar.createEvent(newEvent).then((result) => {
                console.log(result)
            }).catch((error) => {
                console.log(error);
            });
        }
        handleClose();
    }




    return(
        <Modal className="popupSpace" show={props.visible} onHide={() => handleClose()}id="popupBox">
            <Modal.Header>
                <Modal.Title className="modalHeader">{props.month + "/" + props.day + "/" + props.year}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modalBody">
                <div id="dropdownSpace">
                    <Dropdown id="dropdownPick">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Pick a Time
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {props.availability.map((time, index) => {
                                if(time === 1){
                                    return <Dropdown.Item key={index} onClick={() => pickTime(timeArray[index])}>{timeArray[index]}</Dropdown.Item>
                                }
                                index++;
                            })}
                        </Dropdown.Menu>
                    </Dropdown>
                    <InputGroup id="inputTime">
                        <InputGroup.Prepend>
                            <InputGroup.Text>Time:</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            placeholder="N/A"
                            id="timeDisplay"
                            disabled={true}
                        />
                    </InputGroup>
                </div>
                <div className="inputSpace">
                    <InputGroup id="inputName">
                        <InputGroup.Prepend>
                            <InputGroup.Text>Name:</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            placeholder="Name"
                            id="nameDisplay"
                        />
                    </InputGroup>
                    <InputGroup id="inputEmail">
                        <InputGroup.Prepend>
                            <InputGroup.Text>Email:</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            placeholder="Email"
                            id="emailDisplay"
                        />
                    </InputGroup>
                </div>
            </Modal.Body>
            <Modal.Footer className="modalFooter">
                <Button variant="danger" onClick={() => handleClose()}>
                    Cancel
                </Button>
                <Button variant="success" onClick={() => confirmTime()}>
                    Confirm
                </Button>
            </Modal.Footer>

            {/* <Button id="timeConfirm" onclick={pickTime()}>Confirm</Button> */}
        </Modal>
    )
}

export default Popup;