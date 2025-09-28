'use client';

export default function ConsultationButton({ text, className = 'btn-primary' }) {
  const handleClick = () => {
    const event = new CustomEvent('openConsultationModal');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className={className}
    >
      {text}
    </button>
  );
}