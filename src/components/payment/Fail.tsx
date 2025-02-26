import { Link, useSearchParams } from "react-router-dom";
import "./Payment.css";
import axios from "axios";

export const FailPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="payment-container" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="wrapper">
        <div id="info" className="box_section" style={{ width: "600px", margin: "0 auto", padding: "30px" }}>
          <img
            width="100px"
            src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
            alt="에러 이미지"
          />
          <h2>결제를 실패했어요</h2>
          <div className="p-grid typography--p" style={{ marginTop: "20px" }}>
            <div className="p-grid-col text--left">
              <b>에러메시지</b>
            </div>
            <div className="p-grid-col text--right" id="message">{`${searchParams.get("message")}`}</div>
          </div>
          <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
            <div className="p-grid-col text--left">
              <b>에러코드</b>
            </div>
            <div className="p-grid-col text--right" id="code">{`${searchParams.get("code")}`}</div>
          </div>
          <div className="p-grid-col" style={{ marginTop: "20px" }}>
            <Link to="/">
              <button
                className="button"
                style={{ 
                  backgroundColor: "#3182f6", 
                  color: "#ffffff",
                  width: "100%", 
                  maxWidth: "300px",
                  margin: "20px auto 0" 
                }}
              >
                메인 페이지로 이동
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

