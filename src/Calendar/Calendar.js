import React, {useEffect, useState} from 'react';
import './Calendar.css';
import Button from 'react-bootstrap/Button';
import {db} from '../firebase';
import Popup from '../CalendarPopup/Popup';

function Calendar(){
    const currentDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthDays = [31,28,31,30,31,30,31,31,30,31,30,31];


    const [viewPopup, setViewPopup] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [isCurrentMonth, setIsCurrentMonth] = useState(true);
    const [dayArray, setDayArray] = useState([]);
    const [selectedDay, setSelectedDay] = useState();
    const [selectedAvailability, setAvailability] = useState([]);
    const [isNewData, setIsNewData] = useState(false)
    const [monthsOff, setMonthsOff] = useState(0);

    const changeMonth = (isUp) => {
        var newMonth = selectedMonth;
        var newYear = selectedYear;
        if(isUp){
            newMonth += 1;
            if(newMonth >= 12){
                newMonth = 0;
                newYear++;
                setSelectedYear(newYear);
            }
            setSelectedMonth(newMonth);
            setMonthsOff(monthsOff + 1);

            if(newMonth !== currentDate.getMonth()){
                setIsCurrentMonth(false);
            }
        } else {
            newMonth -= 1;
            if(newMonth < 0){
                newMonth = 11;
                newYear -= 1;
                setSelectedYear(newYear);
            }
            setSelectedMonth(newMonth);
            setMonthsOff(monthsOff - 1);

            if(newMonth === currentDate.getMonth() && newYear === currentDate.getFullYear()){
                setIsCurrentMonth(true);
            }
        }

        fillDays(newMonth, newYear);
        
    }

    const fillDays = (month, year) => {
        var newDateString = months[month] + " 1, " + year + " 10:10:10";
        var firstDay = new Date(newDateString);
        var fillDays = firstDay.getDay();
        var monthLength = monthDays[month];
        var extraDays = (monthLength + fillDays) % 7;
        if(extraDays !== 0){
            extraDays = 7 - extraDays;
        }
        var newMonthArray = [];
        var key=0;
        for(var i=0; i<fillDays; i++){
            newMonthArray.push({
                isEmpty: true,
                num: 0,
                key:key++,
                availability: false
            })
        }
        for(var j=1; j<=monthLength; j++){
            newMonthArray.push({
                isEmpty: false,
                num: j,
                key:key++,
                availability: true,
            })
        }
        for(var k=0; k<extraDays; k++){
            newMonthArray.push({
                isEmpty: true,
                num: 0,
                key:key++,
                availability: false
            })
        }
        fillAvailability(month, year, monthLength, fillDays, newMonthArray)
    }

    const fillAvailability = async (monthNum, year, totalDays, fillDays, newMonthArray) => {

        var baseSlots = [0,0,0,0,0,0,0];

        var document = db.collection("defaults").doc("1");
        document.get().then((doc) => {
            if(doc.exists){
                var monday = doc.data().monday;
                var tuesday = doc.data().tuesday;
                var wednesday = doc.data().wednesday;
                var thursday = doc.data().thursday;
                var friday = doc.data().friday;
                var saturday = doc.data().saturday;
                var sunday = doc.data().sunday;
    
                for(var i=0; i<monday.length; i++){
                    if(monday[i] === 1){
                        baseSlots[1]++;
                    }
                    if(tuesday[i] === 1){
                        baseSlots[2]++;
                    }
                    if(wednesday[i] === 1){
                        baseSlots[3]++;
                    }
                    if(thursday[i] === 1){
                        baseSlots[4]++;
                    }
                    if(friday[i] === 1){
                        baseSlots[5]++;
                    }
                    if(saturday[i] === 1){
                        baseSlots[6]++;
                    }
                    if(sunday[i] === 1){
                        baseSlots[0]++;
                    }
                }

                var monthyear = "";
                var m = monthNum + 1;
                if(m < 10){
                    monthyear = "0";
                }
                monthyear += m;
                monthyear += year;

                var monthSlots = [];
                for(var z=0; z<totalDays; z++){
                    var weekDayNum = (z + fillDays)%7
                    monthSlots[z] = baseSlots[weekDayNum]
                }

                var monthData = db.collection("months").doc(monthyear);
                monthData.get().then((data)=>{
                    if(data.exists){
                        getMonthData(monthNum, year, monthSlots, newMonthArray, fillDays, monthyear);
                    } else {
                        showAvailability(monthNum, year, monthSlots, newMonthArray, fillDays);
                    }
                })
            } 
        })
    }

    const getMonthData = async (monthNum, year, monthSlots, newMonthArray, fillDays, monthyear) => {
        var monthData = db.collection("months").doc(monthyear).collection("Days");
        await monthData.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                var day = doc.id;
                var numApps = doc.data().Appointments.length;
                day = "" + day;
                if(day[0] === "0"){
                    day = day[1];
                }
                monthSlots[day-1] -= numApps;
            });
        });
        showAvailability(monthNum, year, monthSlots, newMonthArray, fillDays);
    }

    const showAvailability = (monthNum, year, monthSlots, newMonthArray, fillDays) => {

        for(var i=0; i<monthSlots.length; i++){
            var noSlots = (monthSlots[i] <= 0);
            var isPast = checkIsPast(monthNum, year, i);
            if(noSlots || isPast){
                newMonthArray[fillDays+i].availability = false;
            }
        }
        setDayArray(newMonthArray);
        setIsNewData(false);
    }

    const checkIsPast = (monthSelected, yearSelected, daySelected) => {
        var today = new Date();
        var dayCurrent = today.getDate() - 1;
        var monthCurrent = today.getMonth();
        var yearCurrent = today.getFullYear();

        if(yearSelected > yearCurrent){
            return false;
        } else if(monthSelected > monthCurrent){
            return false;
        } else if (daySelected >= dayCurrent){
            return false;
        }
        return true;
    }



    const getTimes = (key, day, availability) => {
        if(availability){
            var monthNum = selectedMonth;
            var year = selectedYear;
            var document = db.collection("defaults").doc("1");
            document.get().then((doc) => {
                if(doc.exists){
                    var weekDay = (key-1) % 7;
                    var availability = [];
                    if(weekDay === 0){
                        availability = doc.data().monday;
                    } else if(weekDay === 1){
                        availability = doc.data().tuesday;
                    } else if(weekDay === 2){
                        availability = doc.data().wednesday;
                    } else if(weekDay === 3){
                        availability = doc.data().thursday;
                    } else if(weekDay === 4){
                        availability = doc.data().friday;
                    } else if(weekDay === 5){
                        availability = doc.data().saturday;
                    } else if(weekDay === 6){
                        availability = doc.data().sunday;
                    }

                    var monthyear = "";
                    var m = monthNum + 1;
                    if(m < 10){
                        monthyear = "0";
                    }
                    monthyear += m;
                    monthyear += year;

                    var dayID = "";
                    if(day < 10){
                        dayID = "0";
                    }
                    dayID += day;
                    var dayData = db.collection("months").doc(monthyear).collection("Days").doc(dayID);
                    dayData.get().then(function(doc2) {
                        if(doc2.exists){
                            var apps = doc2.data().Appointments;
                            for(var a =0; a<apps.length; a++){
                                var timeString = apps[a].Time;
                                var time = timeString.substring(0,timeString.length-2);
                                if(time[0] === "0"){
                                    time = time[1]
                                }
                                var timeIndex;
                                if(time > 4){
                                    timeIndex = time - 8;
                                } else {
                                    timeIndex = parseInt(time) + 4;
                                }
                                availability[timeIndex] = 0;
                            }
                        }
                        setSelectedDay(day);
                        setAvailability(availability);
                        setViewPopup(true);
                    }).catch(function(error) {
                        console.log("Error getting document:", error);
                    });

                } else {
                }
            })
        }
    } 

    const setNewData = () => {
        setIsNewData(true);
    }

    useEffect(() => {
        if(isNewData){
            fillDays(currentDate.getMonth(), currentDate.getFullYear());
        }
    }, [isNewData]);


    useEffect(() => {
        fillDays(currentDate.getMonth(), currentDate.getFullYear());
    }, []);



    return(
        <div id="calendarPage">
            <div id="calendarContent">
                <div id="headerText">
                    Schedule an Appointment
                </div>
                <div className="month">
                    <div className="prev">
                        <Button id="buttonDown" variant="outline-success" disabled={isCurrentMonth} onClick={() => changeMonth(false)}>
                            &#10094;
                        </Button>
                    </div>
                    <div className="monthData">
                        <span id="monthName">{months[selectedMonth]}</span> <span id="yearNum">{selectedYear}</span>
                    </div>
                    <div className="next">
                        <Button id="buttonUp" variant="outline-success" disabled={monthsOff > 1}onClick={() => changeMonth(true)}>
                                &#10095;
                        </Button>
                    </div>
                </div>
                        
                <ul className="weekdays" id="weekdayList">
                    <li>Sun</li>
                    <li>Mon</li>
                    <li>Tue</li>
                    <li>Wed</li>
                    <li>Thu</li>
                    <li>Fri</li>
                    <li>Sat</li>
                </ul>

                <div id="dayList" className="days">
                    {dayArray.map((day) => {
                        if(!day.isEmpty){
                            var column = (day.num % 7);
                            return <div id={"day" + day.key} className={day.availability ? "day available" : "day full"} key={day.key} onClick={() => getTimes(day.key, day.num, day.availability)}>{day.num}<span id={"day" + day.num}>{day.availability ? "click to schedule" : "no times available"}</span></div>
                        }else{
                            return <div id={"day" + day.key} className="day empty" key={day.key}></div>
                        }
                    })}
                </div>
            </div>

            {viewPopup && <Popup
                visible={viewPopup}
                day={selectedDay}
                month={selectedMonth}
                year={selectedYear}
                availability={selectedAvailability}
                view={() => setViewPopup()}
                newData={() => setNewData()}
            ></Popup> }
        </div>
    )
}

export default Calendar;