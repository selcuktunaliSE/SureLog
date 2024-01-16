import { Card, Col, Nav, ProgressBar, Row } from "react-bootstrap";


const PercentageBarCard= ({data, texts}) => {
    // accepts 3 percentage statistics

    console.log(`[PERCENTAGE BAR CARD] DATA: ${data} | TEXTS:${texts}`);
    /*
        example format of data:
        data[
            29.7,
            52.8,
            18.3
        ]

        example format of texts:
        texts{
            title: "Employee Types",
            description: "This bar percentage statistics card shows you the distribution of the types of employees",
            stat1text: "Intern",
            stat2text: "Junior",
            stat3text: "Senior"
        }

    */
    
    if(data && texts && data.length > 0)
        return(
            <Card className="card-one">
                <Card.Header className="border-0 pb-2">
                <Card.Title as="h6">{texts.title} (%)</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                    <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                    <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
                </Card.Header>
                <Card.Body className="pt-0">
                <p className="fs-sm text-secondary mt-3 mb-3">{texts.description}</p>

                <ProgressBar className="progress-finance mb-4">
                    <ProgressBar now={data[0]} label={`${data[0].toLocaleString()}%`} />
                    <ProgressBar now={data[1]} label={`${data[1].toLocaleString()}%`} />
                    <ProgressBar now={data[2]} label={`${data[2].toLocaleString()}%`} />
                </ProgressBar>

                <Row className="g-3">
                    <Col>
                    <label className="card-label fs-sm fw-medium mb-1">{texts.stat1text}</label>
                    <h2 className="card-value mb-0">{`${data[0].toLocaleString()}%`}</h2>
                    </Col>
                    <Col xs="5" sm>
                    <label className="card-label fs-sm fw-medium mb-1">{texts.stat2text}</label>
                    <h2 className="card-value mb-0">{`${data[1].toLocaleString()}%`}</h2>
                    </Col>
                    <Col>
                    <label className="card-label fs-sm fw-medium mb-1">{texts.stat3text}</label>
                    <h2 className="card-value mb-0">{`${data[2].toLocaleString()}%`}</h2>
                    </Col>
                </Row>
                </Card.Body>
            </Card>
        );
    

    return;
}

export default PercentageBarCard;