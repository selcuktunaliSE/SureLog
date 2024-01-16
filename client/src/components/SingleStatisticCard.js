import { Card, Col, Row } from "react-bootstrap";


const SingleStatisticCard = ({dataDict}) =>{    

    if(!dataDict || Object.keys(dataDict).length === 0) return;

    const dataList = [dataDict];

    return dataList.map((item, index) => (
        <Card className="card-one card-product">
          <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between mb-5">
            <div className="card-icon">
              <i className={item.icon}></i>
            </div>
            <h6 className={"fw-normal ff-numerals mb-0 text-" + item.percent.color}>{item.percent.amount}</h6>
          </div>
          
          <h2 className="card-value ls--1">{item.value}</h2>
          <label className="card-label fw-medium text-dark">{item.label}</label>
          <span className="d-flex gap-1 fs-xs">
            <span className={"d-flex align-items-center text-" + item.last.color}>
              <span className="ff-numerals">{item.last.amount}</span>
              <i className={(item.last.color === 'success') ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
            </span>
            <span className="text-secondary">than last week</span>
          </span>
          </Card.Body>
        </Card>
    ));

};

export default SingleStatisticCard;