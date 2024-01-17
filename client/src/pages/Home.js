import React from 'react';
import App from '../App';
import {Row, Col, Container} from "react-bootstrap";
import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";



import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import HeaderMobile from "../layouts/HeaderMobile";


import LineGraphCard from "../components/LineGraphCard";
import MinorLineGraphCard from "../components/MinorLineGraphCard";
import SingleStatisticCard from "../components/SingleStatisticCard";
import PercentageBarCard  from '../components/PercentageBarCard';
import GeographicMapTable from "../components/GeographicMapTable";

const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");


const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
const skinMode = currentSkin;

const userId = localStorage.getItem("userId");

const linedata_default = [[0, 38], [1, 32], [2, 31], [3, 33], [4, 34], [5, 35], [6, 38], [7, 37], [8, 39], [9, 34], [10, 33], [11, 32], [12, 34], [13, 38], [14, 42], [15, 43], [16, 45], [17, 43], [18, 45], [19, 48], [20, 45], [21, 46], [22, 44], [23, 42], [24, 46], [25, 48], [26, 55], [27, 54], [28, 58], [29, 69]];
const linedata_sinusodial = [
  [0, 13], [1, 16], [2, 19], [3, 23], [4, 26], [5, 29], [6, 33], [7, 36],
  [8, 39], [9, 43], [10, 46], [11, 49], [12, 53], [13, 56], [14, 59], [15, 63],
  [16, 66], [17, 69], [18, 73], [19, 76], [20, 79], [21, 83], [22, 86], [23, 89],
  [24, 93], [25, 96], [26, 99], [27, 103], [28, 106], [29, 109]
];
const linedata_exponential = [
  [0, 2], [1, 6], [2, 8], [3, 6], [4, 13], [5, 7], [6, 13], [7, 17], [8, 9], [9, 17],
  [10, 19], [11, 21], [12, 35], [13, 25], [14, 27], [15, 23], [16, 33], [17, 36], [18, 46],
  [19, 44], [20, 63], [21, 53], [22, 58], [23, 49], [24, 71], [25, 78], [26, 86], [27, 95], [28, 103], [29, 93], [30, 108], [31, 112], 
  [35, 127], [36, 131]
];

const linedata_linear = [[0, 36], [1, 43], [2, 48], [3, 51], [4, 52], [5, 57], [6, 59], [7, 64], [8, 57], [9, 64], [10, 70], [11, 69], [12, 77], [13, 76], [14, 78], [15, 84], [16, 84], [17, 89], [18, 89], [19, 97], [20, 99], [21, 99], [22, 100], [23, 103], [24, 112], [25, 108], [26, 116], [27, 121], [28, 126], [29, 126], [30, 128], [31, 128]]



  const totalUserDataSeries = [{
    name: 'totalUserSeries', 
    data: linedata_exponential
  }]; 

  const totalTenantDataSeries = [{
    name: 'totalTenantSeries',
    data: linedata_linear,
  }]

  const totalUserGraphOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      stacked: true,
      sparkline: { enabled: true }
    },
    colors: ['#85b6fe', '#506fd9'],
    stroke: {
      curve: 'straight',
      width: 2
    },
    yaxis: {
      min: 0,
      max: 150,
      show: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0,
      }
    },
    tooltip: { enabled: false }
  };

  const totalUserGraphDisplayTexts = {
    majorNumeric: 37420,
    majorNumericText: "Users",
    phrase: "Ensuring an enhanced security experience for our customers", 
    minorNumeric1: 3136,
    minorNumericText1: "Reports Generated",
    
    minorNumeric2: 1059,
    minorNumericText2: "Custom User Rules"
  }

  const totalTenantGraphDisplayTexts = {
    numeric: 319, 
    numericText: "Companies",
    phrase: "Growing day by day",
  }

  const userTypeDistributionGraphTexts = {
    title: "User Types",
    description: "Dynamic & customizable user access groups",
    stat1text: "End-Users",
    stat2text: "Tenant Managers",
    stat3text: "Masters"
  }

export default function Home(){
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [userTypeDistributionData, setUserTypeDistributionData] = useState([]);
  const [numTenantsStatisticDataDict, setNumTenantsStatisticDataDict] = useState({});
  const [numMasterStatisticDataDict, setNumMasterStatisticDataDict] = useState({});
  const [numUsersStatisticDataDict, setNumUsersStatisticDataDict] = useState({});
  const [totalNumberOfUsers, setTotalNumberOfUsers] = useState(0);
  const [totalNumberOfTenants, setTotalNumberOfTenants] = useState(0);
  const [totalNumberOfMasters, setTotalNumberOfMasters] = useState(0);

  const navigate = useNavigate();

  const fetchUserTypeDistributionData = async () => {
    const response = await fetchService.fetchUserTypeDistributionData(userId);
    
    if(! response.isError()){
      setUserTypeDistributionData(response.data.userTypeDistributionData);
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  }

  useEffect(() => {
    fetchTotalNumberOfUsers();
    fetchTotalNumberOfTenants();
    fetchTotalNumberOfMasters();
    fetchUserTypeDistributionData();
  }, []);


  useEffect(() => {
    setNumTenantsStatisticDataDict({
      "icon": "ri-building-line",
      "percent": {
      "color": "success",
      "amount": "+28.5%"
      },
      "value": totalNumberOfTenants,
      "label": "Tenants",
      "last": {
      "color": "success",
      "amount": "2.3%"
      }
    });

    setNumUsersStatisticDataDict({
      "icon": "ri-group-line",
      "percent": {
      "color": "success",
      "amount": "+13.8%"
      },
      "value": totalNumberOfUsers,
      "label": "Total Users",
      "last": {
      "color": "success",
      "amount": "7.1%"
      }
    })

    setNumMasterStatisticDataDict({
      "icon": "ri-group-line",
      "percent": {
      "color": "success",
      "amount": "+13.8%"
      },
      "value": totalNumberOfMasters,
      "label": "Masters",
      "last": {
      "color": "success",
      "amount": "7.1%"
      }
    })

  }, [totalNumberOfUsers, totalNumberOfTenants, totalNumberOfMasters, userTypeDistributionData]);

  const fetchTotalNumberOfMasters = async () => {
    const response = await fetchService.fetchTotalNumberOfMasters(userId);
    
    if(! response.isError()){
      setTotalNumberOfMasters(response.data.totalNumberOfMasters);
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  }

  const fetchTotalNumberOfUsers = async () => {
    const response = await fetchService.fetchTotalNumberOfUsers(userId);
    
    if(! response.isError()){
      setTotalNumberOfUsers(response.data.totalNumberOfUsers);
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  }

  const fetchTotalNumberOfTenants = async () => {
    const response = await fetchService.fetchTotalNumberOfTenants(userId);
    
    if(! response.isError()){
      setTotalNumberOfTenants(response.data.totalNumberOfTenants);
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  }

  const handleErrorResponse = (response) => {
    if (response.status === FetchStatus.UserNotFound){
      navigate("/signin");
    } 
    else if(response.status ===  FetchStatus.MasterNotFound){
        navigate("/");
    }
    else if(response.status === FetchStatus.ServerException){
        navigate("/error/500");
    }
    else if(response.status === FetchStatus.AccessDenied){
      setIsError(true);
      setErrorMessage("You do not have any tenants registered to you. Please contact your administrator.");
    }
    else if(response.status === FetchStatus.RoleNotFound){
      setIsError(true);
      setErrorMessage("You do not have any roles in any tenants. Please contact your administrator.");
    }
    else if(response.status === FetchStatus.FetchError){
      console.error("Error fetching tenants: ", response.message);
      navigate("/error/503");
    }
    else {
        navigate("/");
    }
  }  

  const checkMasterUser = async () => {
    const response = await fetchService.checkMasterUser(userId);
    if(response){
      console.log("Response: ", response);
    }

    if(response.isError()) handleErrorResponse(response);
    return ! response.isError();
  }

  return(
    <React.Fragment>
      <div className="main p-4 p-lg-5 mt-5">
          
          <Row>
            <Col md="8"  className="grid-item-large-horizontal">
              <LineGraphCard dataSeries={totalUserDataSeries} options={totalUserGraphOptions} displayTexts={totalUserGraphDisplayTexts}/>
            </Col>
          
            <Col xs={4} className="grid-item-small-vertical">
              <MinorLineGraphCard dataSeries={totalTenantDataSeries} options={totalUserGraphOptions} displayTexts={totalTenantGraphDisplayTexts}/>
            </Col>
          </Row>
          
          <Row className="mt-3">
            <Col md="4">
              <SingleStatisticCard dataDict={numTenantsStatisticDataDict}/>
            </Col>

            <Col md="4">
              <SingleStatisticCard dataDict={numUsersStatisticDataDict}/>
            </Col>

            <Col md="4">
              <SingleStatisticCard dataDict = {numMasterStatisticDataDict}/>
            </Col>          
          </Row>
          
          <Row className="mt-3">
            <Col xs={4} className="grid-item-small-vertical">
                <GeographicMapTable />
            </Col>
          
            <Col xs={8} className="grid-item-large-horizontal">
              <Row>
                {console.log("user type distribution data:", userTypeDistributionData)}
                {userTypeDistributionData && (<PercentageBarCard data={userTypeDistributionData}  texts={userTypeDistributionGraphTexts}/>)}
              </Row>
                
              <Row>

              </Row>
            </Col>
          </Row>

      </div>
    </React.Fragment>
  );

  
}