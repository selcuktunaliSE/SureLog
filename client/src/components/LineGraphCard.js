import ReactApexChart from "react-apexcharts";
import {Card, Col, Button} from "react-bootstrap";

const LineGraphCard = ({dataSeries, options, displayTexts}) => {


    return (
        <Card className="card-one card-line-graph">
            <Card.Body className="d-flex flex-column p-4">
            <h1 className="card-value mb-3 fs-40 ls--2">{displayTexts.majorNumeric.toLocaleString()}</h1>
            <label className="card-label fw-semibold text-dark mb-1">{displayTexts.majorNumericText}</label>
            <p className="w-75 fs-sm text-secondary mb-4 display-flex text-center">{displayTexts.phrase}</p>
            <p className="mb-5">
            </p>

            <div className="d-flex gap-4 fs-sm mt-auto text-primary-dark lh-1 opacity-75">
                <Card className="d-inline-block p-2" style={{backgroundColor: "#fafafa"}}>
                    <strong className="fw-semibold ff-numerals">{displayTexts.minorNumeric1.toLocaleString()}</strong>
                    <span style={{marginLeft: ".35rem"}}>{displayTexts.minorNumericText1}</span>
                </Card>
                
{/* optional value */}
{displayTexts.minorNumeric2 &&(
                <Card className="d-inline-block p-2" style={{backgroundColor: "#fafafa"}}>
                    <strong className="fw-semibold ff-numerals">{displayTexts.minorNumeric2.toLocaleString()}</strong>
                    <span style={{marginLeft: ".35rem"}}>{displayTexts.minorNumericText2}</span>
                </Card>)
                }
            </div>
            </Card.Body>
            <ReactApexChart series={dataSeries} options={options} type="area" height={390} className="apex-chart-two    " />
        </Card>
    );
}

export default LineGraphCard;
