import {Card, Nav} from "react-bootstrap";
import { Bar } from 'react-chartjs-2';
import {React} from 'react';

import useCardTiltEffect from "../../effects/CardTiltEffect";

const BarChartCard = ({tenants,theme}) => {
    const { style, handleMouseMove, handleMouseLeave } = useCardTiltEffect();

    const tenantArray = Object.values(tenants).sort((a, b) => b.userCount - a.userCount);
    const tenantNames = tenantArray.map(tenant => tenant.name);
    const userCounts = tenantArray.map(tenant => tenant.userCount);
    const maxUserCount = Math.max(...userCounts);
    const labelColor = theme === 'dark' ? '#ffffff' : '#212830';

    const chartData = {
        labels: tenantNames,
        datasets: [{
            label: 'User Count',
            data: userCounts,
            backgroundColor: '#506fd9',
            barPercentage: 0.5
        }]
    };
    
    const chartOption = {
        indexAxis: 'y',
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: maxUserCount,
                grid: {
                    borderColor: '#000',
                    color: '#f3f5f9'
                },
                ticks: {
                    color: labelColor,
                    font: {
                        size: 10,
                        weight: '500'
                    }
                }
            },
            y: {
                grid: {
                    borderWidth: 0,
                    color: '#f3f5f9'
                },
                ticks: {
                    color: labelColor,
                    font: {
                        size: 12
                    }
                }
            }
        }
    };


    return(
        <Card 
            className="card-one card-tilt-effect"
            style={style}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}>

            <Card.Header>
            <Card.Title as="h6">Tenants with Most Users </Card.Title>
            <Nav as="nav" className="nav-icon nav-icon-sm ms-auto">
                <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
            </Nav>
            </Card.Header>
            <Card.Body>
            <div className="chart-bar-one">
                <Bar data={chartData} options={chartOption} className="h-100" />
            </div>
            </Card.Body>
        </Card>
    );
}

export default BarChartCard;