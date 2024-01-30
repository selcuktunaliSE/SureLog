import ReactApexChart from "react-apexcharts";
import {Card} from "react-bootstrap";

const MinorLineGraphCard = ({dataSeries, options, displayTexts}) => {


    return (
        <Card className="card-one card-ticket-earnings">
            <Card.Body className="d-flex flex-column p-1">
                <ReactApexChart series={dataSeries} options={options} type="area" height={390} style={{position: "absolute", marginTop:"13rem"}} className="apex-chart-two d-flex align-items-end" />
      
                <div className="d-flex flex-column justify-content-center align-items-center" style={{marginBottom: "3rem"}}>
                    <h1 className="card-value mb-2 ls--2 text-center">{displayTexts.numeric.toLocaleString()}</h1>
                     <label className="card-label fw-semibold text-dark mb-3 text-center">{displayTexts.numericText}</label>
                     <p className="w-100 fs-sm text-secondary text-center">{displayTexts.phrase}</p>
                    </div>
          </Card.Body>
        </Card>  
    );
      
}

export default MinorLineGraphCard;
