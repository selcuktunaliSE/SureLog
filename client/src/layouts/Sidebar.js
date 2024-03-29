import React, { Component } from "react";
import { Link, NavLink} from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import userAvatar from "../assets/img/img1.jpg";
import {
    dashboardMenu,
    applicationsMenu,
    pagesMenu,
    uiElementsMenu
} from "../data/Menu";

const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userData: null,
            userRole: "",
        };
        this.fetchUserData();
        this.fetchUserRole();
    }
    fetchUserRole = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.error("No userId found in local storage");
            return;
        }

        let response = await fetchService.fetchUserRoleName(userId);
        if (response && response.status === FetchStatus.Success) {
            this.setState({ userRole: response.data});
        } else {
            console.error("Error fetching user role: ", response.message);
        }
    };
    fetchUserData = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            return;
        }

        let response = await fetchService.fetchUserProfile(userId, userId);

        if(!response.isError()){
            this.setState({ userData: response.data.user });
        }
    };

    
    
    toggleFooterMenu = (e) => {
        e.preventDefault();
        let parent = e.target.closest(".sidebar");
        parent.classList.toggle("footer-menu-show");
    }

    render() {
        const { userData } = this.state;
        return (
            <div className="sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">SureLog</Link>
                </div>
                <PerfectScrollbar className="sidebar-body" ref={ref => this._scrollBarRef = ref}>
                    <SidebarMenu userRole={this.state.userRole} onUpdateSize={() => this._scrollBarRef.updateScroll()} />
                </PerfectScrollbar>
                <div className="sidebar-footer">
                    <div className="sidebar-footer-top">
                        <div className="sidebar-footer-thumb">
                            <img src={userAvatar} alt="" />
                        </div>
                        <div className="sidebar-footer-body">
                            <h6><Link to="../profile">{userData ? `${userData.firstName} ${userData.lastName}` : 'Visitor'}</Link></h6>
                            
                        </div>
                        <Link onClick={this.toggleFooterMenu} to="" className="dropdown-link"><i className="ri-arrow-down-s-line"></i></Link>
                    </div>
                    <div className="sidebar-footer-menu">
                        <nav className="nav">
                            <Link to="../profile"><i className="ri-edit-2-line"></i> Edit Profile</Link>
                            <Link to="../profile"><i className="ri-profile-line"></i> View Profile</Link>
                        </nav>
                        <hr />
                        <nav className="nav">
                            <Link to=""><i className="ri-question-line"></i> Help Center</Link>
                            <Link to=""><i className="ri-lock-line"></i> Privacy Settings</Link>
                            <Link to=""><i className="ri-user-settings-line"></i> Account Settings</Link>
                            <Link to=""><i className="ri-logout-box-r-line"></i> Log Out</Link>
                        </nav>
                    </div>
                </div>
            </div>
        )
    }
}

class SidebarMenu extends Component {
    populateMenu = (m) => {
        const {userRole} = this.props;
        const menu = m.map((m, key) => {
            if(userRole ==="Tenant Manager" && m.label === "Tenants"){
                m.label = "My Tenant";
            }
            if(userRole ==="Tenant Manager" && m.label === "Masters"){
               return null;
            }
           
            if (userRole === "User" && (m.label === "Tenants" || m.label === "My Tenant" || m.label ==="Masters") ) {
                return null; // Don't render this menu item
            }

            let sm;
            if (m.submenu) {
                sm = m.submenu.map((sm, key) => {
                    return (
                        <NavLink to={sm.link} className="nav-sub-link" key={key}>{sm.label}</NavLink>
                    )
                })
            }
           
            return (
                <li key={key} className="nav-item">
                    {(!sm) ? (
                        <NavLink to={m.link} className="nav-link"><i className={m.icon}></i> <span>{m.label}</span></NavLink>
                    ) : (
                        <div onClick={this.toggleSubMenu} className="nav-link has-sub"><i className={m.icon}></i> <span>{m.label}</span></div>
                    )}
                    {m.submenu && <nav className="nav nav-sub">{sm}</nav>}
                </li>
            )
        });

        return (
            <ul className="nav nav-sidebar">
                {menu}
            </ul>
        );
    }

    // Toggle menu group
    toggleMenu = (e) => {
        e.preventDefault();

        let parent = e.target.closest('.nav-group');
        parent.classList.toggle('show');

        this.props.onUpdateSize();
    }

    // Toggle submenu while closing siblings' submenu
    toggleSubMenu = (e) => {
        e.preventDefault();

        let parent = e.target.closest('.nav-item');
        let node = parent.parentNode.firstChild;

        while (node) {
            if (node !== parent && node.nodeType === Node.ELEMENT_NODE)
                node.classList.remove('show');
            node = node.nextElementSibling || node.nextSibling;
        }

        parent.classList.toggle('show');

        this.props.onUpdateSize();
    }

    render() {
        return (
            <React.Fragment>
                <div className="nav-group show" style={{ marginTop: '10px' }}>
                   
                    {this.populateMenu(dashboardMenu)}
                </div>
                <div className="nav-group show">
                    <div className="nav-label" onClick={this.toggleMenu}>Applications</div>
                    {this.populateMenu(applicationsMenu)}
                </div>
                <div className="nav-group show">
                    <div className="nav-label" onClick={this.toggleMenu}>Pages</div>
                    {this.populateMenu(pagesMenu)}
                </div>
                <div className="nav-group show">
                    <div className="nav-label" onClick={this.toggleMenu}>UI Elements</div>
                    {this.populateMenu(uiElementsMenu)}
                </div>
            </React.Fragment>
        )
    }
}

window.addEventListener("click", function (e) {
    // Close sidebar footer menu when clicked outside of it
    let tar = e.target;
    let sidebar = document.querySelector(".sidebar");
    if (!tar.closest(".sidebar-footer") && sidebar) {
        sidebar.classList.remove("footer-menu-show");
    }

    // Hide sidebar offset when clicked outside of sidebar
    if (!tar.closest(".sidebar") && !tar.closest(".menu-link")) {
        document.querySelector("body").classList.remove("sidebar-show");
    }
});

window.addEventListener("load", function () {
    let skinMode = localStorage.getItem("sidebar-skin");
    let HTMLTag = document.querySelector("html");

    if (skinMode) {
        HTMLTag.setAttribute("data-sidebar", skinMode);
    }
});