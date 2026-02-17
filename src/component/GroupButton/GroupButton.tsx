import { Pen, Users } from "lucide-react";
import "./GroupButton.css";
import { useState, useEffect, useRef } from "react";

type GroupButtonProps = {
  setShowUsers: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GroupButton = ({ setShowUsers }: GroupButtonProps) => {
  const [openMenu, setOpenMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fab-container" ref={containerRef}>
      {/* Dropdown */}
      {openMenu && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => setShowUsers(true)}>
            <Users size={18} />
            <span>New Group</span>
          </button>
        </div>
      )}

      {/* FAB button */}
      <button
        className="fab-button"
        onClick={() => setOpenMenu((prev) => !prev)}
      >
        <Pen size={22} />
      </button>
    </div>
  );
};
