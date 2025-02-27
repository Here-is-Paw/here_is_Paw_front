import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Payment.css";
import { useIsMobile } from "@/hooks/use-mobile";

// clientKey, customerKey 세팅
const clientKey: string = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey: string = generateRandomString();

interface Amount {
  currency: string;
  value: number;
}

export const CheckoutPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState<Amount>({ currency: "KRW", value: 0 });
  const [ready, setReady] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        // 클라이언트 키로 결제 위젯 초기화 -> 토스페이먼츠 객체가 생성됨
        const tossPayments = await loadTossPayments(clientKey);

        // 초기화된 토스페이먼츠 객체로 widgets() 호출 -> 결제 위젯 객체가 생성됨
        // 파라미터로 customerKey를, 비회원은 ANONYMOUS 상수를 전달하면 됨
        const widgets = tossPayments.widgets({ customerKey });

        // 생성된 위젯 객체를 state에 저장
        setWidgets(widgets);
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      // 결제 위젯이 준비되지 않았다면 렌더링하지 않음
      if (!widgets) return;

      // 설정된 금액을 위젯에 적용
      await widgets.setAmount(amount);
      
      // DOM 요소에 결제 수단, 약관 위젯 렌더링
      await widgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      await widgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });

      // 위젯이 성공적으로 렌더링되면 ready 상태를 true로 설정
      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    const parsedValue = parseInt(value) || 0;
    setAmount({ currency: "KRW", value: parsedValue });
  };

  const updateAmount = async (newAmount: Amount) => {
    setAmount(newAmount);

    // 결제 위젯의 setAmount() 호출로 결제 금액 세팅
    // 쿠폰 등으로 결제 금액 업데이트 시에도 setAmount() 호출
    await widgets.setAmount(newAmount);
  };

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
        <div className="box_section" style={{ 
          width: isMobile ? "100%" : "600px", 
          margin: "0 auto", 
          padding: isMobile ? "20px 15px" : "30px" 
        }}>
          <div style={{ marginBottom: isMobile ? "20px" : "30px" }}>
            <h2 className="typography--h2" style={{
              fontSize: isMobile ? "28px" : "48px"
            }}>결제 금액 입력</h2>
            <div className="p-flex" style={{ 
              justifyContent: "center", 
              marginTop: "20px",
              flexDirection: isMobile ? "column" : "row"
            }}>
              <input
                type="text"
                value={customAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="typography--p"
                style={{
                  width: isMobile ? "100%" : "200px",
                  padding: "11px 16px",
                  border: "2px solid var(--grey300)",
                  borderRadius: "7px",
                  fontSize: "15px",
                  textAlign: "right",
                  marginRight: isMobile ? "0" : "8px",
                  marginBottom: isMobile ? "10px" : "0"
                }}
              />
              <span className="typography--p color--grey700" style={{ 
                display: "flex", 
                alignItems: "center",
                justifyContent: isMobile ? "flex-end" : "flex-start"
              }}>원</span>
            </div>
          </div>
    
          {/* 결제 위젯 영역 */}
          <div id="payment-method" />
          <div id="agreement" />
          
          {amount.value >= 5000 && (
            <div style={{ paddingLeft: isMobile ? "10px" : "24px" }}>
              <div className="checkable typography--p">
                <label htmlFor="coupon-box" className="checkable__label typography--regular">
                  <input
                    id="coupon-box"
                    className="checkable__input"
                    type="checkbox"
                    aria-checked="true"
                    disabled={!ready || amount.value < 5000}
                    onChange={async (event) => {
                      const newValue = event.target.checked ? amount.value - 5000 : amount.value + 5000;
                      setCustomAmount(newValue.toString());
                      await updateAmount({
                        currency: amount.currency,
                        value: newValue
                      });
                    }}
                  />
                  <span className="checkable__label-text">5,000원 쿠폰 적용</span>
                </label>
              </div>
            </div>
          )}
    
          {/* 버튼 컨테이너 - 가로/세로 배치 */}
          <div style={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between", 
            alignItems: "center", 
            gap: isMobile ? "15px" : "10px", 
            marginTop: "30px" 
          }}>
            {/* 결제하기 버튼 */}
            <button
              className="button"
              disabled={!customAmount || parseInt(customAmount) <= 0}
              onClick={async () => {
                if (!widgets) {
                  console.error("Payment widgets not initialized");
                  return;
                }
    
                try {
                  await widgets.requestPayment({
                    orderId: generateRandomString(),
                    orderName: `결제 금액: ${amount.value.toLocaleString()}원`,
                    successUrl: window.location.origin + "/success",
                    failUrl: window.location.origin + "/fail",
                    customerEmail: "customer123@gmail.com",
                    customerName: "김토스",
                  });
                } catch (error) {
                  console.error(error);
                }
              }}
              style={{ 
                flex: "1",
                width: isMobile ? "100%" : "auto",
                maxWidth: isMobile ? "100%" : "48%",
                margin: "0",
                height: "48px"
              }}
            >
              {customAmount ? parseInt(customAmount).toLocaleString() : "0"}원 결제하기
            </button>

            {/* 메인 페이지 버튼 */}
            <Link to="/" style={{ 
              flex: "1", 
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? "100%" : "48%", 
              display: "flex" 
            }}>
              <button
                className="button"
                style={{ 
                  backgroundColor: "#e8f3ff", 
                  color: "#1b64da",
                  width: "100%",
                  height: "48px",
                  margin: "0"
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

function generateRandomString(): string {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
