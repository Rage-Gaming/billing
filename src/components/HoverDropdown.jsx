import { FiChevronDown } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

// Animation variants
const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};

// Dropdown Option Component
const Option = ({ text, Icon, onClick }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-[#c91616] text-slate-700 hover:text-white transition-colors cursor-pointer"
    >
      <motion.span variants={actionIconVariants}>
        <Icon className="text-base" />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
};

// Main Dropdown Component
const HoverDropDown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const ProfileName = localStorage.getItem("username") || "User";
  let timeoutId;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle hover with delay
  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setOpen(false);
    }, 300); // 300ms delay before closing
  };

  // Logout function
  const handleLogOut = () => {
    console.log("Logout clicked");
    setOpen(false);
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("username");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center pr-4">
      <motion.div 
        ref={dropdownRef}
        animate={open ? "open" : "closed"} 
        className="relative z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dropdown Trigger Button */}
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-indigo-50 bg-[#d50525]  transition-colors"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <span className="font-medium text-sm">{ProfileName}</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        {/* Dropdown Menu */}
        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-50%" }}
          className="flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden border border-gray-100"
        >
          <Option 
            onClick={handleLogOut} 
            Icon={CiLogout} 
            text="Logout" 
          />
        </motion.ul>
      </motion.div>
    </div>
  );
};

export default HoverDropDown;