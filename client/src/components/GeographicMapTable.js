import {Card, Nav, Table} from "react-bootstrap";
import { usAea } from "@react-jvectormap/unitedstates";
import { VectorMap } from "@react-jvectormap/core";


const GeographicMapTable = ({}) => {

    const currentSkin = (localStorage.getItem('skin-mode'))? 'dark' : '';

    const regStyle = {
        selected: {
          fill: "#506fd9"
        },
        initial: {
          fill: "#d9dde7"
        }
    };

    return(
        <Card className="card-one card-vmap">
            <Card.Header>
                <Card.Title as="h6">States With Most Users</Card.Title>
                <Nav as="nav" className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
            </Card.Header>
            <Card.Body className="p-3 p-xl-4">
                <VectorMap map={usAea} backgroundColor={(currentSkin === "dark")? "#192030" : "#fff"} regionStyle={regStyle} selectedRegions={["US-CA", "US-TX", "US-MO", "US-CO", "US-NY"]} enableZoom={false} className="ht-200 mb-4" />
            
                <Table className="table-one">
                  <thead>
                    <tr>
                      <th style={{paddingLeft:"1rem"}}>States</th>
                      <th>Users</th>
                      <th style={{paddingRight:"1rem"}}>Tenants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        "bg": "twitter",
                        "stateName": "California",
                        "userCount": "12,201",
                        "tenantCount": "251"
                      }, {
                        "bg": "pink",
                        "stateName": "New York",
                        "userCount": "12,560",
                        "tenantCount": "312"
                      }, {
                        "bg": "primary",
                        "stateName": "Texas",
                        "userCount": "7,950",
                        "tenantCount": "156"
                      }, {
                        "bg": "teal",
                        "stateName": "Colorado",
                        "userCount": "6,198",
                        "tenantCount": "164"
                      }, {
                        "bg": "info",
                        "stateName": "Missouri",
                        "userCount": "4,885",
                        "tenantCount": "103"
                      }
                    ].map((item, index) => ( 
                      <tr key={index} style={{padding: "3rem"}}>
                        <td style={{paddingLeft:"1rem"}} className="fw-medium">
                          <span className={"badge-dot me-2 bg-" + item.bg}></span> {item.stateName}
                        </td>
                        <td>{item.userCount}</td>
                        <td style={{paddingRight:"1rem"}}>{item.tenantCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}

export default GeographicMapTable;  