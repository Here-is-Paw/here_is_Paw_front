import { ReactNode } from 'react';

interface PaymentLayoutProps {
  children: ReactNode;
}

function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
      <div className="payment-wrapper">
        {children}
      </div>
  );
}

export default PaymentLayout;