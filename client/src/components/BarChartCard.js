import {Card, Nav} from "react-bootstrap";
import { Bar } from 'react-chartjs-2';

const BarChartCard = ({}) => {

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          data: [20, 60, 50, 45, 50, 60, 70, 40, 45, 35, 25, 30],
          backgroundColor: '#506fd9',
          barPercentage: 0.5
        }, {
          data: [10, 40, 30, 40, 60, 55, 45, 35, 30, 20, 15, 20],
          backgroundColor: '#85b6ff',
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
            max: 100,
            grid: {
                borderColor: '#000',
                color: '#f3f5f9'
            },
            ticks: {
                color: '#212830',
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
                color: '#212830',
                font: {
                size: 12
                }
            }
            }
        }
    };


    return(
        <Card className="card-one">
            <Card.Header>
            <Card.Title as="h6">Real Time Sales</Card.Title>
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