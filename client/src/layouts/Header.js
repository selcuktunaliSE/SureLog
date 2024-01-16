import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import userAvatar from "../assets/img/img1.jpg";
import notification from "../data/Notification";
const fetchConfig = require("../config/fetchConfig.json");
const {host, port} = fetchConfig;
const fetchAddress = `http://${host}:${port}`;
 
const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function Header({ onSkin }) {
  const [userData, setUserData] = useState(null);
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

  useEffect(() => {
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
        <img src={userAvatar} alt="" />
      </div>
    </Dropdown.Toggle>
    <Dropdown.Menu className="mt-10-f">
      <div className="dropdown-menu-body">
        <div className="avatar avatar-xl online mb-3"><img src={userAvatar} alt="" /></div>
        <h5 className="mb-1 text-dark fw-semibold">{userData.firstName} {userData.lastName}</h5>
        <p className="fs-sm text-secondary"></p>

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
