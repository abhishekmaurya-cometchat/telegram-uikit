import {
  CometChatConversations,
  CometChatListItem,
  CometChatSearch,
  CometChatUIKit,
  CometChatUIKitLoginListener,
  CometChatUsers,
  SelectionMode,
} from "@cometchat/chat-uikit-react";
import { CometChat, Conversation, User } from "@cometchat/chat-sdk-javascript";
import "./CometChatConvo.css";
import navigation from "../../../assets/navigation.png";
import { useState, useEffect, useRef, type JSX, useContext } from "react";
import { ArrowLeft, ArrowRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatLastSeen } from "../../../utils";
import { GroupButton } from "../../GroupButton/GroupButton";
import { ChatContext } from "../../../context/ChatContext";

interface SelectorProps {
  onSelectorItemClicked?: (input: Conversation | User, type: string) => void;
  onHide?: () => void;
  onNewChatClicked?: () => void;
}

export const CometChatConvo = (props: SelectorProps) => {
  const { onSelectorItemClicked = () => {} } = props;
  const [isSearch, setIsSearch] = useState<boolean | false>(false);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<boolean | false>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setLoggedInUser, loggedInUser } = useContext(ChatContext);
  const [users, setUsers] = useState<boolean | false>(false);
  const [showUsers, setShowUsers] = useState<boolean | false>(false);
  const [moveForward, setMoveForward] = useState<boolean | false>(false);
  const [selectedUsers, setSelectedUsers] = useState<CometChat.User[]>([]);
  const [groupName, setGroupName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = CometChatUIKitLoginListener.getLoggedInUser();
    setLoggedInUser(loggedInUser);

    if (loggedInUser) {
      setSelectedUsers([loggedInUser]);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  /** Get Logged In User */
  useEffect(() => {
    const loggedInUser = CometChatUIKitLoginListener.getLoggedInUser();
    setLoggedInUser(loggedInUser);
  }, []);

  /** Header View */
  const getHeaderView = () => {
    const handleClick = () => {
      setOpenMenu(false);
      setUsers(true);
    };
    return (
      <div className="custom-header">
        <div className="menu-container" ref={menuRef}>
          <img
            className="menu-icon"
            src={navigation}
            alt="Menu"
            onClick={() => setOpenMenu(!openMenu)}
          />

          {openMenu && (
            <div className="dropdown-menu">
              {/* User Profile Section */}
              <div className="menu-item profile-item">
                <div className="">
                  {loggedInUser?.getAvatar() ? (
                    <img
                      className="profile-avatar"
                      src={loggedInUser.getAvatar()}
                    />
                  ) : (
                    <div className="avatar-name">
                      {loggedInUser?.getName().charAt(0).toUpperCase()}
                      {loggedInUser?.getName().charAt(1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <p className="profile-name">{loggedInUser?.getName()}</p>
                </div>
              </div>

              <div className="menu-divider"></div>

              {/* Contacts */}
              <div className="menu-item" onClick={handleClick}>
                <span className="menu-icon-symbol">👤</span>
                <span className="menu-text">Users</span>
              </div>

              <div className="menu-divider"></div>

              {/* LogOut */}
              <div
                className="menu-item"
                onClick={async () => {
                  await CometChatUIKit.logout();
                  setLoggedInUser(null);
                  navigate("/login");
                }}
              >
                <span className="menu-icon-symbol">
                  <LogOut size={"17px"} />
                </span>
                <span className="menu-text">Logout</span>
              </div>
            </div>
          )}
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search"
            onClick={() => setIsSearch(true)}
          />
        </div>
      </div>
    );
  };

  /** Item View */
  const getItemView = (conversation: CometChat.Conversation) => {
    const convo = conversation.getConversationWith();
    const title = convo.getName();
    const conversationId = conversation.getConversationId();
    let avatarURL: string | undefined;

    if (conversation.getConversationType() === "user") {
      let user = conversation.getConversationWith() as CometChat.User;
      avatarURL = user.getAvatar() || undefined;
    } else {
      let group = conversation.getConversationWith() as CometChat.Group;
      avatarURL = group.getIcon() || undefined;
    }

    return (
      <div className={convoId === conversationId ? "selected-item" : ""}>
        <CometChatListItem
          avatarURL={avatarURL}
          avatarName={title}
          title={title}
          id={conversation.getConversationId()}
          trailingView={getTrailingView(conversation)}
          onListItemClicked={() => {
            onSelectorItemClicked(conversation, "conversation");
            setConvoId(conversationId);
          }}
          subtitleView={getSubtitleView(conversation)}
        />
      </div>
    );
  };

  /** Subtitle View For Conversation */
  const getSubtitleView = (conversation: CometChat.Conversation) => {
    const lastMsg = conversation.getLastMessage();

    // CHECK MODERATION FIRST
    if (lastMsg?.data?.moderation?.status === "disapproved") {
      return <div>⚠️ Message blocked</div>;
    }

    let message = "";

    if (lastMsg?.action) {
      message = lastMsg?.message;
    } else if (lastMsg?.type === "image") {
      message = "📷 Image";
    } else if (lastMsg?.type === "video") {
      message = "🎥 Video";
    } else if (lastMsg?.type === "audio") {
      message = "🎵 Audio";
    } else if (lastMsg?.type === "file") {
      message = "📎 File";
    } else if (lastMsg?.type === "location") {
      message = "📍 Location";
    } else if (lastMsg?.deletedAt) {
      message = "This message was deleted";
    } else {
      message = lastMsg?.text || "";
    }

    return <div>{message}</div>;
  };

  /** Trailing View */
  const getTrailingView = (conv: CometChat.Conversation) => {
    const lastMsg = conv.getLastMessage();
    const unreadCount = conv.getUnreadMessageCount() || 0;

    if (!lastMsg) return <></>;

    const sentAt = lastMsg.getSentAt() * 1000;
    const msgDate = new Date(sentAt);

    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    let label = "";

    const isToday =
      msgDate.getDate() === now.getDate() &&
      msgDate.getMonth() === now.getMonth() &&
      msgDate.getFullYear() === now.getFullYear();

    const isYesterday =
      msgDate.getDate() === yesterday.getDate() &&
      msgDate.getMonth() === yesterday.getMonth() &&
      msgDate.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      label = msgDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    } else if (isYesterday) {
      label = "Yesterday";
    } else {
      label = msgDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          msgDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }

    return (
      <div className="trailing-container">
        <span className="trailing-time">{label}</span>

        {unreadCount > 0 && <div className="unread-badge">{unreadCount}</div>}
      </div>
    );
  };

  /** User Header View */
  const userHeaderView = () => {
    const handleClick = () => {
      setUsers(false);
      setShowUsers(false);
    };
    return (
      <div className="user-header">
        <ArrowLeft onClick={handleClick} className="arrow-left" />
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search" />
        </div>
      </div>
    );
  };

  /** Subtitle View For Users */
  const subTitleView = (user: CometChat.User): JSX.Element => {
    const status = user.getStatus?.();

    if (status === "online") {
      return <div className="users-subtitle online">Online</div>;
    }

    return (
      <div className="users-subtitle">
        {formatLastSeen(user.getLastActiveAt?.())}
      </div>
    );
  };

  /** Select Users for Group  */
  function handleOnSelect(user: CometChat.User, selected: boolean): void {
    if (selected) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) =>
        prev.filter((u) => u.getUid() !== user.getUid())
      );
    }
  }

  /** Create Group Function */
  const createGroup = async (name: string) => {
    try {
      const GUID = `group_${loggedInUser?.getUid()}_${Date.now()}`;
      const groupType = CometChat.GROUP_TYPE.PRIVATE;
      const group = new CometChat.Group(GUID, name, groupType);

      // Prepare member list from selectedUsers
      const members = selectedUsers.map(
        (user) =>
          new CometChat.GroupMember(
            user.getUid(),
            CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT
          )
      );

      const banMembers: string[] = [];

      const response = await CometChat.createGroupWithMembers(
        group,
        members,
        banMembers
      );

      console.log("Group created successfully", response);
      setShowUsers(false)
      setMoveForward(false)
      setSelectedUsers([])
    } catch (error) {
      console.log("Error creating group", error);
    }
  };

  return (
    <>
      {users ? (
        <div className="user-wrapper">
          <CometChatUsers
            onItemClick={(user: CometChat.User) => {
              onSelectorItemClicked(user, "user");
            }}
            showSectionHeader={false}
            headerView={userHeaderView()}
            subtitleView={subTitleView}
            hideSearch={true}
          />
        </div>
      ) : isSearch ? (
        <CometChatSearch onBack={() => setIsSearch(false)} />
      ) : (
        <>
          {showUsers ? (
            moveForward ? (
              <>
                <div className="new-screen">
                  {/* Title */}
                  <div className="details">
                    <p className="group-title">New Group</p>

                    {/* Group Name Input */}
                    <div className="group-input-container">
                      <input
                        type="text"
                        className="group-name-input"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Member List */}
                  <div className="list-members">
                    <p className="members-title">
                      {selectedUsers.length - 1} members
                    </p>

                    {selectedUsers.map(
                      (user) =>
                        user.getUid() !== loggedInUser?.getUid() && (
                          <div key={user.getUid()} className="member-row">
                            {user.getAvatar() ? (
                              <img
                                className="member-avatar"
                                src={user.getAvatar()}
                              />
                            ) : (
                              <div className="member-avatar placeholder">
                                {user.getName()?.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="member-info">
                              <p className="member-name">{user.getName()}</p>
                              <p className="member-last-seen">
                                {user.getStatus() === "online"
                                  ? "Online"
                                  : `last seen ${formatLastSeen(
                                      user.getLastActiveAt()
                                    )}`}
                              </p>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {groupName && (
                  <ArrowRight
                    size="40px"
                    width="30px"
                    className="arrow-right"
                    onClick={() => createGroup(groupName)}
                  />
                )}
              </>
            ) : (
              <>
                <div className="user-wrapper">
                  <CometChatUsers
                    onItemClick={(user: CometChat.User) => {
                      onSelectorItemClicked(user, "user");
                    }}
                    showSectionHeader={false}
                    headerView={userHeaderView()}
                    subtitleView={subTitleView}
                    hideSearch={true}
                    selectionMode={SelectionMode.multiple}
                    onSelect={handleOnSelect}
                  />
                </div>
                <ArrowRight
                  size="40px"
                  width="30px"
                  className="arrow-right"
                  onClick={() => setMoveForward(true)}
                />
              </>
            )
          ) : (
            <>
              <div className="user-wrapper">
                <CometChatConversations
                  // showSearchBar={true}
                  headerView={getHeaderView()}
                  itemView={getItemView}
                  // onSearchBarClicked={() => console.log("Search Bar Clicked")}
                />
              </div>
              <GroupButton setShowUsers={setShowUsers} />
            </>
          )}
        </>
      )}
    </>
  );
};
