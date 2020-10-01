import React from 'react';
import './Home.css';

function Home(){

    return(
        <div id="homeContent">
            <div id="topper">
                McHenry County Small Business Accounting Practice
            </div>
            <div id="historyTopper">
                Our History:
            </div>
            <div id="paragraph">
                Over 30 years in the corporate business field, with concentrations in contract administration, contract negotiations, account management, and technical sales.
            </div>
            <div id="history">
                More than 15 years in small business accounting, including bookkeeping, payroll, tax planning, and tax return preparation.
            </div>
            <div id="services">
                <div id="servicesHeader">
                    Services Offered:
                </div>
                <ul id="servicesList">
                    <li>Business Consulting</li>
                    <li>Full Service Payroll</li>
                    <li>Quickbooks Bookkeeping (remote or on-site)</li>
                    <li>Bookkeeping Software Setup</li>
                    <li>Tax Planning</li>
                    <li>General Ledger & Financial Statement Preparation</li>
                    <li>Business Start-up Services</li>
                    <li>Sales/Use Tax Returns</li>
                </ul>
            </div>   
  
        </div>
        
    )
}

export default Home;