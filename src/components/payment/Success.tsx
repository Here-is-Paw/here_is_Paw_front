import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { backUrl } from "@/constants.ts";
import "./payment.css";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponseData {
  mId: string;
  version: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  requestedAt: string;
  approvedAt: string;
  totalAmount: number;
  balanceAmount: number;
  method: string;
}

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);  // 처리 상태를 관리하기 위함
  const [hasAttempted, setHasAttempted] = useState(false); // 결제 시도 여부를 추적
  const isMobile = useIsMobile();

  useEffect(() => {
    async function confirm() {
    // 이미 시도했거나 처리 중이거나 응답 데이터가 있으면 중단
    if (hasAttempted || isProcessing || responseData) {
      return;
    }

      try {
        setIsProcessing(true); // 처리 시작
        setHasAttempted(true); // 시도 표시

        // URL 파라미터 추출
        const amount = Number(searchParams.get("amount"));
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");

        // 값 검증
        if (!orderId || !amount || !paymentKey) {
          throw {
            message: "Missing required parameters",
            code: "INVALID_REQUEST",
          };
        }

        // 요청 데이터 로깅
        console.log("Request data:", {
          orderId,
          amount,
          paymentKey,
        });

        const requestData = {
          orderId: orderId,
          amount: amount,
          paymentKey: paymentKey,
        };

        // // Access Token 확인
        // const accessToken = localStorage.getItem("accessToken");
        //
        // // 없다면 Refresh Token으로 Access Token 갱신
        // if (!accessToken) {
        //   const refreshToken = localStorage.getItem("refreshToken");
        //   if (refreshToken) {
        //     try {
        //       const refreshResponse = await axios.post(
        //         `${backUrl}/api/v1/members/refresh`,
        //         { refreshToken },
        //         { withCredentials: true }
        //       );
        //       if (refreshResponse.data?.accessToken) {
        //         localStorage.setItem(
        //           "accessToken",
        //           refreshResponse.data.accessToken
        //         );
        //       }
        //     } catch (refreshError) {
        //       navigate("/login");
        //       throw {
        //         message: "인증이 만료되었습니다. 다시 로그인해주세요.",
        //         code: "AUTH_EXPIRED",
        //       };
        //     }
        //   }
        // }

        // 최신 accessToken으로 결제 요청
        const response = await axios.post(
          `${backUrl}/api/v1/payment/confirm`,
          requestData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json"
              // Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.status === 200 && response.data) {
          return response.data;
        }

        throw {
          message: "결제 확인에 실패했습니다",
          code: "PAYMENT_CONFIRMATION_FAILED",
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorData = error.response?.data;
          console.error("Payment confirmation error:", errorData);

          if (error.response?.status === 401) {
            navigate("/login");
            throw {
              message: "인증이 필요합니다. 다시 로그인해주세요.",
              code: "UNAUTHORIZED",
            };
          }

          throw {
            message: errorData?.message || "결제 처리 중 오류가 발생했습니다",
            code: errorData?.code || "PAYMENT_ERROR",
          };
        }
        throw error;
      } finally{
        setIsProcessing(false); // 처리 완료
      }
    }

    confirm()
      .then((data) => {
        // confirm()이 정상적으로 실행되면 받은 데이터를 state에 저장
        setResponseData(data);
      })
      .catch((error) => {
        // confirm() 실행 중 에러가 발생하면 에러 페이지로 이동
        navigate(`/fail?code=${error.code}&message=${error.message}`);
      });
  }, [searchParams, navigate, isProcessing, responseData, hasAttempted]);

  return (
    <div className="payment-container" style={{
      position: "absolute", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      padding: isMobile ? "10px" : "20px",
      overflow: "hidden" // 스크롤바 방지
    }}>
      <div className="wrapper" style={{ 
        flexDirection: "column",
        maxWidth: isMobile ? "100%" : "800px",
        overflow: "hidden" // 스크롤바 방지
      }}>
        <div className="box_section" style={{ 
          width: isMobile ? "100%" : "600px", 
          margin: "0 auto", 
          padding: isMobile ? "20px 15px" : "30px",
          overflow: "hidden" // 스크롤바 방지
        }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            marginBottom: isMobile ? "15px" : "20px" 
          }}>
            <img
              width={isMobile ? "70px" : "80px"}
              src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
              alt="결제 완료 이미지"
            />
            <h2 style={{ 
              fontSize: isMobile ? "1.6rem" : "2rem", 
              fontWeight: "600", 
              margin: isMobile ? "15px 0 0" : "20px 0 0", 
              lineHeight: "1.3",
              textAlign: "center",
              width: "100%",
              backgroundColor: "white"
            }}>결제를 완료했어요</h2>
          </div>
          
          <div className="p-grid typography--p" style={{ marginTop: isMobile ? "15px" : "20px" }}>
            <div className="p-grid-col text--left">
              <b>결제금액</b>
            </div>
            <div className="p-grid-col text--right" 
              id="amount"
              style={{ fontSize: isMobile ? "0.95rem" : "1rem" }}
            >
              {`${Number(searchParams.get("amount")).toLocaleString()}원`}
            </div>
          </div>
          
          <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
            <div className="p-grid-col text--left">
              <b>주문번호</b>
            </div>
            <div className="p-grid-col text--right" 
              id="orderId"
              style={{ 
                fontSize: isMobile ? "0.9rem" : "1rem",
                wordBreak: "break-all"
              }}
            >
              {`${searchParams.get("orderId")}`}
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
