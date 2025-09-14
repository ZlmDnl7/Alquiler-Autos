import { useEffect, useRef, useState, useCallback } from "react";
import ReactDom from "react-dom";
import { IoCloseCircleOutline } from "react-icons/io5";
import PropTypes from 'prop-types';

const Portal = ({ children }) => {
  return ReactDom.createPortal(children, document.body);
};

Portal.propTypes = {
  children: PropTypes.node.isRequired,
};

const Modal = ({
  children,
  isOpen,
  onClose,
  isDismissible = true,
  showCloseIcon = true,
  toAnimate = true,
  animationEnter = "zoomIn",
  animationExit = "zoomOut",
  className = "",
}) => {
  const modalRef = useRef();
  const backdropRef = useRef();
  const [mouseDownEv, setMouseDownEv] = useState(null);
  
  // Memoize close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    if (isDismissible) {
      onClose();
    }
  }, [isDismissible, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    
    const checkEscAndCloseModal = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    
    // Focus management for accessibility
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements?.length > 0) {
      focusableElements[0].focus();
    }
    
    document.addEventListener("keydown", checkEscAndCloseModal);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", checkEscAndCloseModal);
    };
  }, [isOpen, handleClose]);
  
  const handleMouseDown = (e) => {
    // Only handle mouse down on the backdrop, not the modal content
    if (e.target === backdropRef.current) {
      setMouseDownEv({ screenX: e.screenX, screenY: e.screenY });
    }
  };
  
  const checkOutsideAndCloseModal = (e) => {
    if (!isDismissible) return;
    
    // Only close if clicking on backdrop and mouse didn't move significantly
    if (
      e.target === backdropRef.current &&
      mouseDownEv &&
      Math.abs(mouseDownEv.screenX - e.screenX) <= 15 &&
      Math.abs(mouseDownEv.screenY - e.screenY) <= 15
    ) {
      handleClose();
    }
    setMouseDownEv(null);
  };
  
  const handleBackdropKeyDown = (e) => {
    if (!isDismissible) return;
    
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };
  
  const getEnterAnimation = (animEnter) => {
    const animations = {
      slideInFromDown: "animate-[slideInFromDown_500ms_forwards]",
      slideInFromUp: "animate-[slideInFromUp_500ms_forwards]",
      slideInFromLeft: "animate-[slideInFromLeft_500ms_forwards]",
      slideInFromRight: "animate-[slideInFromRight_500ms_forwards]",
      zoomIn: "animate-[zoomIn_500ms_forwards]",
    };
    return animations[animEnter] || animations.zoomIn;
  };
  
  const getExitAnimation = (animExit) => {
    const animations = {
      slideOutToDown: "animate-[slideOutToDown_500ms_forwards]",
      slideOutToUp: "animate-[slideOutToUp_500ms_forwards]",
      slideOutToLeft: "animate-[slideOutToLeft_500ms_forwards]",
      slideOutToRight: "animate-[slideOutToRight_500ms_forwards]",
      zoomOut: "animate-[zoomOut_500ms_forwards]",
    };
    return animations[animExit] || animations.zoomOut;
  };
  
  const handleCloseButtonKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClose();
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <div
        ref={backdropRef}
        className={`fixed inset-0 flex items-center justify-center overflow-hidden bg-black bg-opacity-80 backdrop-blur-md z-[1000] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={checkOutsideAndCloseModal}
        onMouseDown={handleMouseDown}
        onKeyDown={handleBackdropKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1} // Make the backdrop focusable for keyboard events
      >
        <div
          ref={modalRef}
          className={`relative max-h-screen max-w-[100vw] overflow-auto transition-all duration-500 ease-out ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none select-none"
          } ${
            toAnimate && (isOpen ? getEnterAnimation(animationEnter) : getExitAnimation(animationExit))
          } ${className}`}
          role="document"
          aria-describedby="modal-content"
        >
          {showCloseIcon && (
            <div className="mr-4 mt-4 flex">
              <button
                type="button"
                className="ml-auto flex h-8 w-8 items-center justify-center hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
                onClick={handleClose}
                onKeyDown={handleCloseButtonKeyDown}
                aria-label="Cerrar modal"
                tabIndex={0}
              >
                <IoCloseCircleOutline 
                  style={{ width: '20px', height: '20px' }} 
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
          <div id="modal-content" role="main">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDismissible: PropTypes.bool,
  showCloseIcon: PropTypes.bool,
  toAnimate: PropTypes.bool,
  animationEnter: PropTypes.oneOf([
    'slideInFromDown',
    'slideInFromUp', 
    'slideInFromLeft',
    'slideInFromRight',
    'zoomIn'
  ]),
  animationExit: PropTypes.oneOf([
    'slideOutToDown',
    'slideOutToUp',
    'slideOutToLeft', 
    'slideOutToRight',
    'zoomOut'
  ]),
  className: PropTypes.string,
};

export default Modal;