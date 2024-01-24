import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Nav, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header"; 
import Sidebar from "../layouts/Sidebar";
import Avatar from "../components/Avatar";

import img1 from "../assets/img/img1.jpg";

import {formatDate} from "../utility/DateFormatter";


const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function OldProfile() {

  const [userData, setUserData] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [skinMode, setSkinMode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  let userId = localStorage.getItem("userId");
  let targetUserId = location.state?.targetUserId;

  
  const fetchUserData = async () => {
    if (!userId) {
      console.error("No userId found in local storage");
      navigate("/signin");
      return;
    }
    let response = await fetchService.fetchUserProfile(userId, targetUserId ? targetUserId : userId);

    if(!response.isError()){
      setUserData(response.data.user);
    }
    else{
      handleErrorResponse(response);
    }
  };

  const fetchTenantData = async () => {
    if(!userId){
      console.error("No userId found in local storage");
      navigate("/signin");
      return;
    }

    let response = await fetchService.fetchTenantOfUser(userId, targetUserId ? targetUserId : userId);

    if(!response.isError()){
      setTenantData(response.data.tenant);
    }
    else{
      handleErrorResponse(response);
    }
  }

  useEffect(() => {
    fetchUserData();
    fetchTenantData();
  }, [location.state]);

  if (!userData || ! tenantData) {
    return <div>Loading user data...</div>;
  }

  const handleErrorResponse = (response) => {
    if(response.status === FetchStatus.AccessDenied){
      navigate("/error/505");
    }
    else if(response.status === FetchStatus.UserNotFound){
      setErrorMessage("Requested user was not found.");
      setIsError(true);
    }
    else if(response.status === FetchStatus.ServerException){
      navigate("/error/500");
    }
    else if(response.status === FetchStatus.FetchError){
      console.log("Fetch Error: ", response.message);
      navigate("/error/503");
    }
  }

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin)
  }

  return (
    <React.Fragment>
      <Sidebar />
      <HeaderMobile />
      <Header onSkin={handleSkinModeChange}/>
      <div className="main p-4 p-lg-5">
        <Row className="g-5 mt-3">
          <Col xl>
            <div className="media-profile mb-5">
              <div className="media-img mb-3 mb-sm-0">
                <img src={img1} className="img-fluid" alt="..." />
              </div>
              <div className="media-body">
                <h5 className="media-name">
                  {` ${userData.firstName} ${userData.middleName ? userData.middleName : ""} ${userData.lastName}  `} 
                  <i style={{fontSize: "1rem"}} class="ri-hashtag"></i>
                  <span>{tenantData.tenantId}</span>
                </h5>
                <p className="d-flex gap-2 mb-4"><i className="ri-map-pin-line"></i> San Francisco, California</p>
              </div>
            </div>

            <Row className="row-cols-sm-auto g-4 g-md-5 g-xl-4 g-xxl-5">
              {[
                {
                  "icon": "ri-medal-2-line",
                  "text": formatDate(userData.createdAt),
                  "label": "Member Since"
                }, {
                  "icon": "ri-suitcase-line",
                  "text": tenantData.name,
                  "label": "Tenant"
                }, {
                  "icon": "ri-team-line",
                  "text": formatDate(userData.lastLoginAt),
                  "label": "Last Login"
                }, {
                  "icon": "ri-team-line",
                  "text": "1,056",
                  "label": "Activities"
                }
              ].map((profileItem, index) => (
                <Col key={index}>
                  <div className="profile-item">
                    <i className={profileItem.icon}></i>
                    <div className="profile-item-body">
                      <p>{profileItem.text}</p>
                      <span>{profileItem.label}</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            <Nav className="nav-line mt-5">
              <Nav.Link href="" className="active">Activity</Nav.Link>
              <Nav.Link href="">Personal Information</Nav.Link>
              <Nav.Link href="">Tenant Information</Nav.Link>
              <Nav.Link href="">Profile Settings</Nav.Link>
            </Nav>

            <div className="post-bar mt-4">
              <div className="post-bar-item gap-2">
                <i className="ri-edit-2-line"></i>
                <Link to="">Share an update</Link>
              </div>
              <div className="post-bar-item">
                <Link to=""><i className="ri-image-line"></i></Link>
              </div>
              <div className="post-bar-item">
                <Link to=""><i className="ri-vidicon-line"></i></Link>
              </div>
              <div className="post-bar-item">
                <Link to=""><i className="ri-article-line"></i></Link>
              </div>
            </div>

            <Card className="card-post mt-4">
              <Card.Header>
                <Card.Title>Recent Activity</Card.Title>
                <Link to="" className="link-more"><i className="ri-more-2-fill"></i></Link>
              </Card.Header>
              <Card.Body>
                <div className="post-header mb-3">
                  <Link to=""><Avatar initial="s" status="online" /></Link>
                  <div className="post-content">
                    <h6>Bethany Hartsfield</h6>
                    <span>Cigarette Butt Collector</span>
                  </div>
                  <span className="post-date">3 days ago</span>
                </div>
                <p className="post-text">Our team is expanding again. We are looking for a Product Manager and Software Engineer to drive our new aspects of our capital projects. If you're interested, please drop a comment here or simply message me. <Link to="">#softwareengineer</Link> <Link to="">#engineering</Link></p>

                {/* <div className="post-preview">
                  <Row className="g-3">
                    <Col sm="4">
                      <img src={img5} className="img-fluid" alt="" />
                    </Col>
                    <Col sm>
                      <h5>We're hiring of Product Manager</h5>
                      <p>Full-time, $60,000 - $80,000 annual</p>
                      <span>Bay Area, San Francisco, California</span>
                    </Col>
                  </Row>
                </div> */}
              </Card.Body>
              <Card.Footer>
                <Nav>
                  {/* <Nav.Link href=""><i className="ri-thumb-up-line"></i> Like</Nav.Link>
                  <Nav.Link href=""><i className="ri-chat-1-line"></i> Comment</Nav.Link>
                  <Nav.Link href=""><i className="ri-share-forward-line"></i> Share</Nav.Link> */}
                </Nav>
              </Card.Footer>
            </Card>

            <Card className="card-post mt-4">
              <Card.Header>
                <Card.Title>Work Experience</Card.Title>
                <Link to="" className="link-more"><i className="ri-more-2-fill"></i></Link>
              </Card.Header>
              <Card.Body>
                <div className="experience-item">
                  <div className="experience-icon"><i className="ri-suitcase-line"></i></div>
                  <div className="experience-body">
                    <h5>Front-End Developer</h5>
                    <p>Themepixels, Inc.</p>
                    <p>December 2020 - Present</p>
                    <ul className="mt-3">
                      <li>Leading on the architecture and approach on the ongoing and new Angular applications in the company;</li>
                      <li>Setting up expectations for the developers</li>
                      <li>Review other Angular developers' code in terms of following the standards, best practices, and expectations.</li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer>
                <Nav>
                  <Nav.Link href="">Show more experiences (4) <i className="ri-arrow-down-s-line"></i></Nav.Link>
                </Nav>
              </Card.Footer>
            </Card>

          </Col>

          <Col xl="4" xxl="3" className="d-none d-xl-block">

            <h5 className="section-title mb-4">Contact Information</h5>
            <ul className="list-contact-info">
              <li><i className="ri-building-fill"></i><span>Bay Area, San Francisco, CA</span></li>
              <li><i className="ri-home-8-fill"></i><span>Westfield, Oakland, CA</span></li>
              <li><i className="ri-phone-fill"></i><span>(+1) 012 345 6789</span></li>
              <li><i className="ri-mail-fill"></i><span>{userData.email}</span></li>
            </ul>

            <hr className="my-4 opacity-0" />

          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}