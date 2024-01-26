import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import notification from "../data/Notification";
import { useNavigate } from "react-router-dom";
const fetchService = require("../service/FetchService");
const {FetchStatus} = require("../service/FetchService");
export default function Header({ onSkin }) {
  const [userData, setUserData] = useState(null);
   const [errorMessage, setErrorMessage] = useState("");
   const [userRole, setUserRole] = useState(""); 
   const [isError, setIsError] = useState(false);
   const navigate = useNavigate();
   const userId = localStorage.getItem("userId");
  const [theme, setTheme] = useState(localStorage.getItem("skin-mode") || "light");
  const fetchUserData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No userId found in local storage");
      return;
    }

    let response = await fetchService.fetchUserProfile(userId, userId);
    if(!response.isError()){
      setUserData(response.data.user);
    }
  };
  const fetchUserRole = async () => {
    const response = await fetchService.fetchUserRoleName(userId); // Adjust this to match the actual function you have for fetching user role
    if (response && response.status === FetchStatus.Success) {
        setUserRole(response.data); // Set the fetched role
    } else {
        console.error("Error fetching user role: ", response.message);
    }
};

  useEffect(() => {
    fetchUserRole();
    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Link
      to=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="dropdown-link"
    >
      {children}
    </Link>
  ));
  const checkMasterUser = async () => {
    const response = await fetchService.checkMasterUser(userId);
    if(response){
      console.log("Response: ", response);
    }

    if(response.isError()) handleErrorResponse(response);
    return ! response.isError();
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

  const toggleSidebar = (e) => {
    e.preventDefault();
    let isOffset = document.body.classList.contains("sidebar-offset");
    if (isOffset) {
      document.body.classList.toggle("sidebar-show");
    } else {
      if (window.matchMedia("(max-width: 991px)").matches) {
        document.body.classList.toggle("sidebar-show");
      } else {
        document.body.classList.toggle("sidebar-hide");
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    console.log("Theme changed to " + newTheme);
    const HTMLTag = document.querySelector("html");

    if (newTheme === "dark") {
      HTMLTag.setAttribute("data-skin", newTheme);
      localStorage.setItem('skin-mode', newTheme);
    } else {
      HTMLTag.removeAttribute("data-skin");
      localStorage.removeItem('skin-mode');
    }

    if(onSkin)
      onSkin(newTheme);
    else(console.warn("Set Skin function for this page has not been defined"));
  };

  function NotificationList() {
    const notiList = notification.map((item, key) => {
      return (
        <li className="list-group-item" key={key}>
          <div className={(item.status === "online") ? "avatar online" : "avatar"}>{item.avatar}</div>
          <div className="list-group-body">
            <p>{item.text}</p>
            <span>{item.date}</span>
          </div>
        </li>
      )
    });

    return (
      <ul className="list-group">
        {notiList}
      </ul>
    );
  }

  return (
    <div className="header-main px-3 px-lg-4">
      <Link onClick={toggleSidebar} className="menu-link me-3 me-lg-4"><i className="ri-menu-2-fill"></i></Link>

      <div className="form-search me-auto">
        <input type="text" className="form-control" placeholder="Search" />
        <i className="ri-search-line"></i>
      </div>

      <Dropdown className="dropdown-skin" align="end">
        <Dropdown.Toggle as={CustomToggle} onClick={toggleTheme}>
          {theme === "light" ? <i className="ri-sun-line"></i> : <i className="ri-moon-fill"></i>}
        </Dropdown.Toggle>
      </Dropdown>

      <Dropdown className="dropdown-notification ms-3 ms-xl-4" align="end">
        <Dropdown.Toggle as={CustomToggle}>
          <small>3</small><i className="ri-notification-3-line"></i>
        </Dropdown.Toggle>
        <Dropdown.Menu className="mt-10-f me--10-f">
          <div className="dropdown-menu-header">
            <h6 className="dropdown-menu-title
        ">Notifications</h6>
        </div>
        {NotificationList()}
        <div className="dropdown-menu-footer"><Link to="#">Show all Notifications</Link></div>
        </Dropdown.Menu>
        </Dropdown>
        <Dropdown className="dropdown-profile ms-3 ms-xl-4" align="end">
    <Dropdown.Toggle as={CustomToggle}>
      <div className="avatar online">
      <i className={`ri-user-line ${theme === 'dark' ? 'icon-dark' : 'icon-light'}`} style={{ fontSize: '1.5rem'}}></i>
      </div>
    </Dropdown.Toggle>
    <Dropdown.Menu className="mt-10-f">
      <div className="dropdown-menu-body">
        
        <h5 className="mb-1 text-dark fw-semibold">{userData.firstName} {userData.lastName}</h5>
        <p className="fs-sm text-secondary">{userRole}</p>

        <nav className="nav">
          <Link to=""><i className="ri-edit-2-line"></i> Edit Profile</Link>
          <Link to="/profile"><i className="ri-profile-line"></i> View Profile</Link>
        </nav>
        <hr />
        <nav className="nav">
          <Link to=""><i className="ri-question-line"></i> Help Center</Link>
          <Link to=""><i className="ri-lock-line"></i> Privacy Settings</Link>
          <Link to=""><i className="ri-user-settings-line"></i> Account Settings</Link>
          <Link to="/signin"><i className="ri-logout-box-r-line"></i> Log Out</Link>
        </nav>
      </div>
    </Dropdown.Menu>
  </Dropdown>
</div>
  );
}
