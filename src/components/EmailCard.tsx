import React from 'react';

interface EmailCardProps {
  email: string;
  onClick: () => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, onClick }) => {
  return (
    <div
      className="email-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`Login with ${email}`}
    >
      {email}
    </div>
  );
};

export default EmailCard;
