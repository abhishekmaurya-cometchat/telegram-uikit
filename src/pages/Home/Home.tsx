import { useEffect, useState, useContext } from "react";
import "./Home.css";
import {
  CometChatAIAssistantChat,
  CometChatButton,
  CometChatGroupMembers,
  CometChatMessageComposer,
  CometChatMessageComposerAction,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatMessageTemplate,
  CometChatThreadHeader,
  CometChatUIKit,
  CometChatUIKitConstants,
  CometChatUIKitLoginListener,
  isMessageSentByMe,
} from "@cometchat/chat-uikit-react";
import {
  CometChat,
  GroupMember,
} from "@cometchat/chat-sdk-javascript";
import { CometChatSelector } from "../../component/CometChatSelector/CometChatSelector";
import "@cometchat/chat-uikit-react/css-variables.css";
import CometChatInCall from "../../component/CometChatInCall/CometChatInCall";
import React from "react";
import location from "../../assets/location.png";
import sparkles from "../../assets/sparkles.png";
import { ChatContext } from "../../context/ChatContext";

interface Member {
  getUid: () => string;
  getName: () => string;
  getAvatar: () => string | null;
  getStatus?: () => string;
}

function Home() {
  const [selectedUser, setSelectedUser] = useState<CometChat.User>();
  const [selectedGroup, setSelectedGroup] = useState<CometChat.Group>();
  const [templates, setTemplates] = React.useState<CometChatMessageTemplate[]>(
    []
  );
  const [parentMessage, setParentMessage] = useState<CometChat.BaseMessage>();
  const [groupDetails, setGroupDetails] = useState<CometChat.Group>();
  const [userScope, setUserScope] = useState<string | null>(null);
  const [pinnedMsg, setPinnedMsg] = useState<any>(null);
  const [hasMessage, setHasMessage] = useState<boolean | null>(null);
  const [agent, setAgent] = useState<CometChat.User>();
  const [showAssistant, setShowAssistant] = useState(false);
  const [clickOnAdd, setClickOnAdd] = useState(false);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [addMem, setAddMem] = useState<CometChat.User[]>([]);
  const RECEIVER_TYPE = selectedGroup ? "group" : "user";
  const RECEIVER = selectedGroup
    ? selectedGroup.getGuid()
    : selectedUser?.getUid();

  const { setLoggedInUser } = useContext(ChatContext);


  /** Get Logged In User */
  useEffect(() => {
    CometChat.getLoggedinUser().then((user) => setLoggedInUser(user));
  }, []);

  useEffect(() => {
    CometChat.getUser("698c2804-9a57-4fb8-9fd2-d6032fa6d4ff").then((u) =>
      setAgent(u)
    );
  }, []);

  /** Fetching Messages for User */
  useEffect(() => {
    if (!selectedUser) return;

    setHasMessage(null);
    let request: CometChat.MessagesRequest | null = null;

    request = new CometChat.MessagesRequestBuilder()
      .setUID(selectedUser.getUid())
      .setLimit(1)
      .build();

    request
      .fetchPrevious()
      .then((msgs) => {
        setHasMessage(msgs.length > 0);
      })
      .catch(() => setHasMessage(true));
  }, [selectedUser]);

  /** Fetching Pin Message */
  useEffect(() => {
    if (!selectedGroup && !selectedUser) return;

    const fetchPinMsg = () => {
      const URL = `v1/fetch?receiverType=${RECEIVER_TYPE}&receiver=${RECEIVER}`;
      CometChat.callExtension("pin-message", "GET", URL)
        .then((res: any) => {
          if (res?.pinnedMessages && res.pinnedMessages.length > 0) {
            setPinnedMsg(res.pinnedMessages[0]);
          }
        })
        .catch((error) => {
          console.log("Error while fetching Pinned Message", error);
        });
    };

    fetchPinMsg();
  }, [selectedGroup, selectedUser]);

  /** Listen for read receipts */
  useEffect(() => {
    const readReceiptListenerID = "READ_RECEIPT_LISTENER";

    CometChat.addMessageListener(
      readReceiptListenerID,
      new CometChat.MessageListener({

        onTextMessageReceived: (message: CometChat.TextMessage) => {
         console.log("Text message received at 132 line:", message);
        },
        onMessagesRead: (receipt: CometChat.MessageReceipt) => {
          const messageId = receipt.getMessageId();
          const receiptTimestamp = receipt.getTimestamp();

          console.log("=== READ RECEIPT RECEIVED ===");
          console.log("Message ID:", messageId);
          console.log("Receipt Timestamp:", receiptTimestamp);

          // You can also trigger UI updates here if needed
          // For example, mark the message as read in your state
        },
      })
    );

   
  }, []);

  const unPinMsg = () => {
    if (!pinnedMsg) return;

    CometChat.callExtension("pin-message", "DELETE", "v1/unpin", {
      msgId: pinnedMsg.id,
      receiverType: RECEIVER_TYPE,
      receiver: RECEIVER,
    })
      .then((response) => {
        console.log("Message Unpinned", response);
        setPinnedMsg(null);
      })
      .catch((error) => {
        console.log("Error occurred while unpinning message", error);
      });
  };

  /** get scope whenever group changes */
  useEffect(() => {
    if (selectedGroup) {
      setUserScope(selectedGroup.getScope());
    }
  }, [selectedGroup]);

  /** Templates */
  // useEffect(() => {
  //   let definedTemplates: CometChatMessageTemplate[] =
  //     CometChatUIKit.getDataSource().getAllMessageTemplates();

  //   // definedTemplates = definedTemplates.map((template) => {
  //   //   if (
  //   //     template.type === CometChatUIKitConstants.MessageTypes.text &&
  //   //     template.category === CometChatUIKitConstants.MessageCategory.message
  //   //   ) {
  //   //     // Option Template for Pin
  //   //     template.options = (
  //   //       loggedInUser: CometChat.User,
  //   //       message: CometChat.BaseMessage,
  //   //       selectedGroup?: CometChat.Group
  //   //     ) => getCustomOptions(loggedInUser, message, selectedGroup);

  //   //     // Message Footer Template
  //   //     template.footerView = (message: CometChat.BaseMessage) =>
  //   //       getFooterView(message);
  //   //   }
  //   //   return template;
  //   // });

  //   // Add Location template
  //   // const customMsgTemplate = new CometChatMessageTemplate({
  //   //   type: "location",
  //   //   category: CometChatUIKitConstants.MessageCategory.custom,
  //   //   contentView: (
  //   //     msg: CometChat.BaseMessage,
  //   //     alignment: any,
  //   //     textFormatters?: any
  //   //   ) => {
  //   //     return getContentView(msg) ?? null;
  //   //   },
  //   //   options: (
  //   //     loggedInUser: CometChat.User,
  //   //     message: CometChat.BaseMessage,
  //   //     selectedGroup?: CometChat.Group
  //   //   ) => getCustomOptions(loggedInUser, message, selectedGroup),
  //   // });

  //   const translationTemplate = new CometChatMessageTemplate({
  //     type: "translation",
  //     category: CometChatUIKitConstants.MessageCategory.custom,
  //     contentView: (message: CometChat.BaseMessage) => {
  //       if (!(message instanceof CometChat.CustomMessage)) return null;

  //       const data = message.getCustomData() as { translated: string };
  //       if (!data?.translated) return null;

  //       return (
  //         <div className="translation-bubble incoming-translation">
  //           {data.translated}
  //         </div>
  //       );
  //     },
  //     options: () => [],
  //   });

  //   // definedTemplates.push(customMsgTemplate);
  //   definedTemplates.push(translationTemplate);
  //   setTemplates(definedTemplates);
  // }, []);

  /** Adding Option in Message compose attachement */
  const getAttachmentOptions = (): CometChatMessageComposerAction[] => {
    const defaultOptions = CometChatUIKit.getDataSource().getAttachmentOptions({
      parentMessageId: 10,
      user: "",
      group: "",
    });

    // Add your custom location option
    const locationOption = new CometChatMessageComposerAction({
      id: "location",
      title: "Share Location",
      iconURL: location,
      onClick: sendLocationMessage,
    });

    return [...defaultOptions, locationOption];
  };

  /** Listener for Custom Messages */
  useEffect(() => {
    const listenerID = "CUSTOM_MESSAGE_LISTENER";

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onCustomMessageReceived: (customMessage: CometChat.CustomMessage) => {
          console.log("Received custom message", customMessage);
          console.log("Custom message type:", customMessage.getType());

          // Handle Pin Message
          if (customMessage.getType() === "pin") {
            const data = customMessage.getCustomData() as {
              msgId: string;
              text: any;
            };
            console.log("Pin message data:", data);
            const pureText =
              typeof data.text === "string" ? data.text : data.text?.text;

            setPinnedMsg({
              id: data.msgId,
              data: { text: pureText },
            });
          }

          // Handle Location Message
          if (customMessage.getType() === "location") {
            const data = customMessage.getCustomData() as {
              latitude: number;
              longitude: number;
            };
            console.log("Location message received:", data);
          }
        },
      })
    );

    return () => {
      CometChat.removeMessageListener(listenerID);
    };
  }, []);



  /** Custom Message */
  // const getCustomMessageOptions = useCallback(
  //   (
  //     loggedInUser: CometChat.User,
  //     message: CometChat.BaseMessage,
  //     group: CometChat.Group
  //   ) => {
  //     const isSentByMe =
  //       message.getSender()?.getUid() === loggedInUser?.getUid();

  //     const defaultTemplates =
  //       ChatConfigurator.getDataSource().getAllMessageTemplates({});
  //     const defaultTemplate = defaultTemplates.find(
  //       (template) =>
  //         template.category === message.getCategory() &&
  //         template.type === message.getType()
  //     );

  //     let defaultOptions: any = [];
  //     if (defaultTemplate?.options) {
  //       defaultOptions = defaultTemplate.options(loggedInUser, message, group);
  //     }

  //     // Filter out edit/delete for non-sender messages
  //     return defaultOptions.filter((option: any) => {
  //       if (!isSentByMe) {
  //         return (
  //           option.id !== CometChatUIKitConstants.MessageOption.editMessage &&
  //           option.id !== CometChatUIKitConstants.MessageOption.deleteMessage
  //         );
  //       }
  //       return true;
  //     });
  //   },
  //   []
  // );

  // const customTemplates = useMemo(() => {
  //   if (!loggedInUser) return undefined;

  //   const defaultTemplates =
  //     ChatConfigurator.getDataSource().getAllMessageTemplates({});

  //   return defaultTemplates.map((template) => ({
  //     ...template,
  //     options: (
  //       user: CometChat.User,
  //       message: CometChat.BaseMessage,
  //       group: CometChat.Group
  //     ) => getCustomMessageOptions(user, message, group),
  //   }));
  // }, [loggedInUser, getCustomMessageOptions]);

  /** Subtitle for Group members */
  const getCustomSubtitleView = (groupMember: GroupMember) => {
    const formatTime = (timestamp: number) =>
      new Date(timestamp * 1000).toLocaleDateString();
    return (
      <div className="group-member-subtitle">
        Joined at: {formatTime(groupMember.getJoinedAt())}
      </div>
    );
  };

  /** Group Functionalities */
  const clearChat = async (guid: string) => {
    try {
      await CometChat.deleteConversation(guid, CometChat.RECEIVER_TYPE.GROUP);
      console.log("Chat cleared");
    } catch (error) {
      console.error("Failed to clear chat", error);
    }
  };

  const leaveGroup = async (guid: string) => {
    try {
      await CometChat.leaveGroup(guid);
      console.log("Left group");
      setGroupDetails(undefined);
    } catch (error) {
      console.error("Failed to leave group", error);
    }
  };

  const deleteGroup = async (guid: string) => {
    try {
      await CometChat.deleteGroup(guid);
      console.log("Group deleted");
      setGroupDetails(undefined);
    } catch (error) {
      console.error("Failed to delete group", error);
    }
  };

  useEffect(() => {
    const fetchMem = async () => {
      let limit = 50;
      let usersRequest = new CometChat.UsersRequestBuilder()
        .setLimit(limit)
        .build();

      const mem = await usersRequest.fetchNext();
      // console.log("members",mem)
      setMemberList(mem);
    };

    fetchMem();
  }, []);

  const isChecked = (mem: CometChat.User) => {
    setAddMem((prev) => {
      const isAlreadyChecked = prev.some((m) => m.getUid() === mem.getUid());

      if (isAlreadyChecked) {
        return prev.filter((m) => m.getUid() !== mem.getUid());
      } else {
        return [...prev, mem];
      }
    });
  };

  const fetchMemberNames = async (guid: string) => {
    const request = new CometChat.GroupMembersRequestBuilder(guid)
      .setLimit(2)
      .build();

    const members = await request.fetchNext();
    return members.map((m: CometChat.User) => m.getName());
  };

  const generateGroupNameFromMembers = (names: string[]) => {
    if (names.length >= 2) return `${names[0]}, ${names[1]}`;
    if (names.length === 1) return names[0];
    return "New Group"; // fallback
  };

  const updateGroupName = async (group: CometChat.Group) => {
    const GUID = group.getGuid();
    const memberNames = await fetchMemberNames(GUID);

    const newName = generateGroupNameFromMembers(memberNames);

    const updatedGroup = new CometChat.Group(GUID, newName, group.getType());

    const updated = await CometChat.updateGroup(updatedGroup);

    // 5. update your local UI state so name refreshes everywhere
    setSelectedGroup(updated);

    console.log("Group updated →", updated);
  };

  const addMember = (group: CometChat.Group) => {
    let GUID = group.getGuid();
    let membersList = addMem.map(
      (user) =>
        new CometChat.GroupMember(
          user.getUid(),
          CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT
        )
    );

    CometChat.addMembersToGroup(GUID, membersList, []).then(
      (response) => {
        console.log("response", response);
        setAddMem([]);
        setClickOnAdd(false);

        updateGroupName(group);
      },
      (error) => {
        console.log("Something went wrong", error);
      }
    );
  };

  const showMember = () => {
    setClickOnAdd(!clickOnAdd);
  };

  /** Header of Group Details */
  const CustomHeaderView = ({ group }: { group: CometChat.Group }) => {
    const isAdmin = userScope === CometChat.GROUP_MEMBER_SCOPE.ADMIN;
    const isModerator = userScope === CometChat.GROUP_MEMBER_SCOPE.MODERATOR;
    const isParticipant =
      userScope === CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;

    return (
      <div className="group-header-container">
        <div className="group-header">
          <p>Group Info</p>
          <p className="close-btn" onClick={() => setGroupDetails(undefined)}>
            ✕
          </p>
        </div>

        <div className="horizontal-line"></div>

        <div className="group-details">
          <div className="group-avatar">
            {group.getName().charAt(0).toUpperCase()}
            {group.getName().charAt(1).toUpperCase()}
          </div>
          <p className="group-date">{group.getName()}</p>
          <p className="group-member-count">
            {group.getMembersCount()} Members
          </p>
        </div>

        <div className="horizontal-line"></div>

        <div className="group-options">
          <button
            className="danger-btn"
            onClick={() => clearChat(group.getGuid())}
          >
            Delete Chat
          </button>
          {(isModerator || isParticipant) && (
            <button
              className="danger-btn"
              onClick={() => leaveGroup(group.getGuid())}
            >
              Leave
            </button>
          )}
          {(isAdmin || isModerator) && (
            <button className="primary-btn" onClick={() => showMember()}>
              {" "}
              Add Member
            </button>
          )}
          {isAdmin && (
            <button
              className="danger-btn"
              onClick={() => deleteGroup(group.getGuid())}
            >
              Delete & Exit Group
            </button>
          )}
        </div>
      </div>
    );
  };

  /** For sending location Custom */
  const sendLocationMessage = () => {
    if (!navigator.geolocation) {
      alert("Location access not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        const receiverId = selectedGroup
          ? selectedGroup.getGuid()
          : selectedUser?.getUid();

        const receiverType = selectedGroup
          ? CometChat.RECEIVER_TYPE.GROUP
          : CometChat.RECEIVER_TYPE.USER;

        const locationData = {
          latitude,
          longitude,
        };

        const customMessage = new CometChat.CustomMessage(
          receiverId!,
          receiverType,
          "location",
          locationData
        );

        CometChatUIKit.sendCustomMessage(customMessage)
          .then((msg) => {
            console.log("Location sent successfully", msg);
          })
          .catch((err) => {
            console.log("Location sending failed", err);
            alert("Failed to send location");
          });
      },
      (err) => {
        alert("Please allow location access.");
        console.log(err);
      }
    );
  };

  useEffect(() => {
    let definedTemplates: CometChatMessageTemplate[] =
      CometChatUIKit.getDataSource().getAllMessageTemplates();
    const CUSTOM_MESSAGE_TYPE = "gifts";

    let customMessageTemplate = new CometChatMessageTemplate({
      type: CUSTOM_MESSAGE_TYPE,
      category: CometChatUIKitConstants.MessageCategory.custom,
      statusInfoView: () => {
        return <></>;
      },
      // options: (loggedInUser, message, group) => {
      //   return CometChatUIKit.getDataSource().getMessageOptions(
      //     loggedInUser,
      //     message,
      //     group
      //   );
      // },

      contentView: (message: CometChat.BaseMessage) => getContentView(message) ?? null,

      // bubbleView: (message: CometChat.BaseMessage) => {
      //   return getContentView(message);
      // },
    });

    // customMessageTemplate.options= (loggedInUser: CometChat.User, message: CometChat.BaseMessage)=>{
    //    console.log("Entered in optionsview")
    //   return CometChatUIKit.getDataSource().getMessageOptions(loggedInUser,message);
    // }
    definedTemplates.push(customMessageTemplate);
    setTemplates(definedTemplates);
  }, []);



  // const getContentView = (message: CometChat.BaseMessage) => {
  //   if (
  //     message instanceof CometChat.CustomMessage &&
  //     message.getType() === "gifts"
  //   ) {
  //     const data = message.getCustomData() as {
  //       image: any;
  //       title: string;
  //       date: string;
  //     };
  //     const { image, title, date } = data;
  //     const isSender = message.getSender().getUid() === loggedInUser.getUid();

  //     return (
  //       <div className="custom-message-wrapper">
  //         <div className={`gift-row ${isSender ? "right" : "left"}`}>
  //           <div
  //             className={`gift-message-container ${
  //               isSender ? "sender" : "receiver"
  //             }`}
  //           >
  //             <div className="gift-image-wrapper">
  //               <img src={image} alt="gift" className="gift-image" />
  //             </div>

  //             <div className="gift-info">
  //               <div className="gift-title">{title}</div>
  //               <div className="gift-date">{date}</div>
  //             </div>

  //             {/* {isSender && <div className="gift-status">✓</div>} */}
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }
  // };

  // const getMessageRequestBuilder = () => {
  //   const CUSTOM_MESSAGE_TYPE = "gifts";
  //   let categories = CometChatUIKit.getDataSource().getAllMessageCategories();
  //   categories.push(CometChatUIKitConstants.MessageCategory.custom);
  //   let types = CometChatUIKit.getDataSource().getAllMessageTypes();
  //   types.push(CUSTOM_MESSAGE_TYPE);
  //   return new CometChat.MessagesRequestBuilder()
  //     .setCategories(categories)
  //     .setTypes(types)
  //     .hideReplies(true)
  //     .setLimit(30);
  // };

  /** Content View for Location */
  const getContentView = (message: CometChat.BaseMessage) => {
    const isSentByMe = isMessageSentByMe(
      message,
      CometChatUIKitLoginListener.getLoggedInUser()!
    );

    if (
      message instanceof CometChat.CustomMessage &&
      message.getType() === "location"
    ) {
      const data = message.getCustomData() as {
        latitude: number;
        longitude: number;
      };

      const { latitude, longitude } = data;
      const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;

      return (
        <div
          className={`bubble-view ${
            isSentByMe ? "bubble-view__outgoing" : "bubble-view__incoming"
          }`}
        >
          <div
            className={`location-bubble ${
              isSentByMe
                ? "location-bubble--outgoing"
                : "location-bubble-z-incoming"
            }`}
          >
            <div className="location-title">📍 Shared Location</div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="location-link"
            >
              Open in Map
            </a>

            <img
              src={`https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=300&height=200&center=lonlat:${longitude},${latitude}&zoom=16&marker=lonlat:${longitude},${latitude};type:material;color:%23ff0000&apiKey=YOUR_API_KEY`}
              alt="location-preview"
              className="location-preview"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      );
    }
  };

  const getMessageRequestBuilder = () => {
    const CUSTOM_MESSAGE_TYPE = "location";
    let categories = CometChatUIKit.getDataSource().getAllMessageCategories();
    categories.push(CometChatUIKitConstants.MessageCategory.custom);
    let types = CometChatUIKit.getDataSource().getAllMessageTypes();
    types.push(CUSTOM_MESSAGE_TYPE);
    return new CometChat.MessagesRequestBuilder()
      .setCategories(categories)
      .setTypes(types)
      .hideReplies(true)
      .setLimit(30);
  };

  // const getMessageRequestBuilder = () => {
  //   const CUSTOM_MESSAGE_TYPE = "translation";
  //   let categories = CometChatUIKit.getDataSource().getAllMessageCategories();
  //   categories.push(CometChatUIKitConstants.MessageCategory.custom);
  //   let types = CometChatUIKit.getDataSource().getAllMessageTypes();
  //   types.push(CUSTOM_MESSAGE_TYPE);
  //   return new CometChat.MessagesRequestBuilder()
  //     .setCategories(categories)
  //     .setTypes(types)
  //     .hideReplies(true)
  //     .setLimit(30);
  // };

  const auxiliaryButtonView = (
    <CometChatButton
      iconURL={sparkles}
      onClick={() => {
        if (agent) setShowAssistant(true);
      }}
    />
  );

  /** Templates */
  // useEffect(() => {
  //   let definedTemplates: CometChatMessageTemplate[] =
  //     CometChatUIKit.getDataSource().getAllMessageTemplates();

  //   // definedTemplates = definedTemplates.map((template) => {
  //   //   if (
  //   //     template.type === CometChatUIKitConstants.MessageTypes.text &&
  //   //     template.category === CometChatUIKitConstants.MessageCategory.message
  //   //   ) {
  //   //     // Option Template for Pin
  //   //     template.options = (
  //   //       loggedInUser: CometChat.User,
  //   //       message: CometChat.BaseMessage,
  //   //       selectedGroup?: CometChat.Group
  //   //     ) => getCustomOptions(loggedInUser, message, selectedGroup);

  //   //     // Message Footer Template
  //   //     template.footerView = (message: CometChat.BaseMessage) =>
  //   //       getFooterView(message);
  //   //   }
  //   //   return template;
  //   // });

  //   // Add Location template
  //   // const customMsgTemplate = new CometChatMessageTemplate({
  //   //   type: "location",
  //   //   category: CometChatUIKitConstants.MessageCategory.custom,
  //   //   contentView: (
  //   //     msg: CometChat.BaseMessage,
  //   //     alignment: any,
  //   //     textFormatters?: any
  //   //   ) => {
  //   //     return getContentView(msg) ?? null;
  //   //   },
  //   //   options: (
  //   //     loggedInUser: CometChat.User,
  //   //     message: CometChat.BaseMessage,
  //   //     selectedGroup?: CometChat.Group
  //   //   ) => getCustomOptions(loggedInUser, message, selectedGroup),
  //   // });

  //   // definedTemplates.push(customMsgTemplate);
  //   definedTemplates.push(translationTemplate);
  //   setTemplates(definedTemplates);
  // }, []);

  // useEffect(() => {
  //   const initTemplates = async () => {
  //     const userLanguage =
  //       (loggedInUser?.getMetadata() as any)?.language || "en";

  //     let definedTemplates: CometChatMessageTemplate[] =
  //       CometChatUIKit.getDataSource().getAllMessageTemplates();

  //     definedTemplates = definedTemplates.map((template) => {
  //       if (
  //         template.type === CometChatUIKitConstants.MessageTypes.text &&
  //         template.category === CometChatUIKitConstants.MessageCategory.message
  //       ) {
  //         const originalContentView = template.contentView;

  //         template.contentView = (
  //           message: CometChat.BaseMessage,
  //           alignment: any,
  //           textFormatters?: any
  //         ) => {
  //           if (message instanceof CometChat.TextMessage) {
  //             const metadata = message.getMetadata() as any;

  //             if (
  //               metadata?.translations &&
  //               typeof metadata.translations === "object"
  //             ) {
  //               const translationForUser = metadata.translations[userLanguage];

  //               if (translationForUser) {
  //                 return (
  //                   <div className="translation-bubble">
  //                     {translationForUser}
  //                   </div>
  //                 );
  //               }
  //             }
  //           }

  //           if (originalContentView) {
  //             return originalContentView(message, alignment, textFormatters);
  //           }

  //           return null;
  //         };
  //       }
  //       return template;
  //     });

  //     setTemplates(definedTemplates);
  //   };

  //   initTemplates();
  // }, [loggedInUser]);

  // const sendMsg = async (text: string) => {
  //   if (!selectedUser) return;

  //   const receiverID = selectedUser.getUid();
  //   const receiverLanguage =
  //     (selectedUser.getMetadata() as any)?.language || "en";
  //   const senderLanguage =
  //     (loggedInUser?.getMetadata() as any)?.language || "en";

  //   try {
  //     const translation = await CometChat.callExtension(
  //       "message-translation",
  //       "POST",
  //       "v2/translate",
  //       {
  //         text: text,
  //         languages: [receiverLanguage, senderLanguage],
  //       }
  //     );

  //     const translated = translation.translations;

  //     const translatedToReceiver =
  //       translated.find((l) => l.language_translated === receiverLanguage)
  //         ?.message_translated || text;

  //     console.log("receiver", translatedToReceiver);

  //     const translatedToSender =
  //       translated.find((l) => l.language_translated === senderLanguage)
  //         ?.message_translated || text;

  //     console.log("sender", translatedToSender);

  //     const textMessage = new CometChat.TextMessage(
  //       receiverID,
  //       text,
  //       CometChat.RECEIVER_TYPE.USER
  //     );

  //     textMessage.setMetadata({
  //       translations: {
  //         [senderLanguage]: translatedToSender,
  //         [receiverLanguage]: translatedToReceiver,
  //       },
  //     });

  //     await CometChatUIKit.sendTextMessage(textMessage);

  //     console.log("Translated message sent");
  //   } catch (error) {
  //     console.error("Error sending translation message:", error);
  //   }

  //   setText("");
  // };
  
  return (
    <div className="conversations-with-messages">
      <div className="conversations-wrapper">
        <CometChatInCall />
        <CometChatSelector
          onSelectorItemClicked={(activeItem) => {
            let item = activeItem;
            if (activeItem instanceof CometChat.Conversation) {
              item = activeItem.getConversationWith();
            }

            if (item instanceof CometChat.User) {
              setSelectedUser(item);
              setSelectedGroup(undefined);
            } else if (item instanceof CometChat.Group) {
              setSelectedGroup(item);
              setSelectedUser(undefined);
            } else {
              setSelectedUser(undefined);
              setSelectedGroup(undefined);
            }

            setParentMessage(undefined);
          }}
        />
      </div>

      {selectedUser || selectedGroup ? (
        <div className="messages-wrapper">
          {hasMessage === false ? (
            <>
              <CometChatMessageHeader
                user={selectedUser}
                group={selectedGroup}
                onItemClick={() => setGroupDetails(selectedGroup)}
                // titleView={<CustomTitleView />}
              />

              <div className="no-message">
                <div className="message-box">
                  <p>No message here yet...</p>
                  <p>Send Message or click below button</p>
                  <button>Hii, {selectedUser?.getName()}</button>
                </div>
              </div>

              <CometChatMessageComposer
                user={selectedUser}
                group={selectedGroup}
              />
            </>
          ) : (
            <>
              <CometChatMessageHeader
                user={selectedUser}
                group={selectedGroup}
                onItemClick={() => setGroupDetails(selectedGroup)}
                // titleView={<CustomTitleView />}
              />

              {pinnedMsg && (
                <div className="pinned-message-banner">
                  📌 Pinned: {pinnedMsg.data?.text}
                  <button onClick={unPinMsg}>Unpin</button>
                </div>
              )}

              <CometChatMessageList
                user={selectedUser}
                group={selectedGroup}
                templates={templates}
                onThreadRepliesClick={(message) => setParentMessage(message)}
                messagesRequestBuilder={getMessageRequestBuilder()}
              />
        

              <CometChatMessageComposer
                attachmentOptions={getAttachmentOptions()}
                user={selectedUser}
                group={selectedGroup}
                auxiliaryButtonView={auxiliaryButtonView}
              />
              

              {/* <div className="container">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button onClick={() => sendGifts()}>Gifts</button>
                <button onClick={() => sendMsg(text)}>Send</button>
              </div> */}
            </>
          )}
        </div>
      ) : (
        <div className="cometchat-message-list__body"></div>
      )}

      {groupDetails && (
        <div className="groups">
          <div className="thread-wrapper">
            <CometChatGroupMembers
              group={groupDetails}
              subtitleView={getCustomSubtitleView}
              headerView={<CustomHeaderView group={groupDetails} />}
            />
          </div>

          {clickOnAdd && (
            <div className="add-member-container">
              <div className="member-list-scrollable">
                {memberList.map((m) => {
                  return (
                    <div className="member-row" key={m.getUid()}>
                      <div className="avatar-section">
                        {m.getAvatar() ? (
                          <img src={m.getAvatar()!} className="avatar-img" />
                        ) : (
                          <div className="avatar-placeholder">
                            {m.getName().charAt(0).toUpperCase()}
                          </div>
                        )}

                        {m.getStatus?.() === "online" && (
                          <span className="status-dot" />
                        )}
                      </div>

                      <div className="member-name">{m.getName()}</div>

                      <input
                        type="checkbox"
                        className="member-checkbox"
                        checked={addMem.some(
                          (user) => user.getUid() === m.getUid()
                        )}
                        onChange={() => isChecked(m as unknown as CometChat.User)}
                      />
                    </div>
                  );
                })}
              </div>

              <button
                className="add-member-btn"
                onClick={() => selectedGroup && addMember(selectedGroup)}
              >
                Add Member
              </button>
            </div>
          )}
        </div>
      )}

      {parentMessage && (
        <div className="thread-wrapper">
          <CometChatThreadHeader
            parentMessage={parentMessage}
            onClose={() => setParentMessage(undefined)}
          />
          <CometChatMessageList
            user={selectedUser}
            group={selectedGroup}
            parentMessageId={parentMessage.getId()}
            templates={templates}
          />
          <CometChatMessageComposer
            parentMessageId={parentMessage.getId()}
            user={selectedUser}
            group={selectedGroup}
          />
        </div>
      )}

      {showAssistant && agent && <CometChatAIAssistantChat user={agent} />}
    </div>
  );
}

export default Home;
