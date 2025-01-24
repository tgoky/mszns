import React from "react";

interface ModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-yellow-500 p-6 rounded-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white font-bold text-xl"
        >
          ×
        </button>
        <p className="text-black font-semibold text-lg">{message}</p>
      </div>
    </div>
  );
};

export default Modal;
