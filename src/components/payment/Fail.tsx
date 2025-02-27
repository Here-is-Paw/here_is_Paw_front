import { Link, useSearchParams } from "react-router-dom";
import "./Payment.css";
import { useIsMobile } from "@/hooks/use-mobile";

export const FailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  return (
    <div className="payment-container" style={{ 
      position: "absolute", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      padding: isMobile ? "10px" : "20px"
    }}>
      <div className="wrapper" style={{
        maxWidth: isMobile ? "100%" : "800px"
      }}>
        <div id="info" className="box_section" style={{ 
          width: isMobile ? "100%" : "600px", 
          margin: "0 auto", 
          padding: isMobile ? "20px 15px" : "30px" 
        }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            marginBottom: isMobile ? "15px" : "20px" 
          }}>
            <img
              width={isMobile ? "80px" : "100px"}
              src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
              alt="에러 이미지"
            />
            <h2 style={{ 
              fontSize: isMobile ? "1.5rem" : "2rem",
              fontWeight: "600", 
              margin: "15px 0 0", 
              lineHeight: "1.3",
              textAlign: "center"
            }}>결제를 실패했어요</h2>
          </div>
          
          <div className="p-grid typography--p" style={{ marginTop: isMobile ? "15px" : "20px" }}>
            <div className="p-grid-col text--left">
              <b>에러메시지</b>
            </div>
            <div className="p-grid-col text--right" 
              id="message" 
              style={{ 
                fontSize: isMobile ? "0.9rem" : "1rem",
                wordBreak: "break-word"
              }}
            >
              {`${searchParams.get("message")}`}
            </div>
          </div>
          
          <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
            <div className="p-grid-col text--left">
              <b>에러코드</b>
            </div>
            <div className="p-grid-col text--right" 
              id="code"
              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
            >
              {`${searchParams.get("code")}`}
            </div>
          </div>
          
          <div className="p-grid-col" style={{ marginTop: isMobile ? "15px" : "20px" }}>
            <Link to="/" style={{ 
              width: "100%",
              display: "flex",
              justifyContent: "center"
            }}>
              <button
                className="button"
                style={{ 
                  backgroundColor: "#3182f6", 
                  color: "#ffffff",
                  width: "100%", 
                  maxWidth: isMobile ? "100%" : "300px",
                  margin: "20px auto 0",
                  padding: isMobile ? "10px 16px" : "12px 16px",
                  fontSize: isMobile ? "14px" : "15px"
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

