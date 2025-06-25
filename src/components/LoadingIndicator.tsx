import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = "加载中..." }) => {
  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default LoadingIndicator;
