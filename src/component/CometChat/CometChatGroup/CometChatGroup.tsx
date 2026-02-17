import { CometChatAvatar, CometChatGroups } from "@cometchat/chat-uikit-react";
import { Group } from "@cometchat/chat-sdk-javascript";
import "./CometChatGroup.css"

interface SelectorProps {
  onSelectorItemClicked?: (
    input: Group,
    type: string
  ) => void;
  onHide?: () => void;
  onNewChatClicked?: () => void;
}

export const CometChatGroup = (props: SelectorProps) => {
  const { onSelectorItemClicked = () => { } } = props;

  /** Leading View */
  const customLeadingView = (group: CometChat.Group) => {
    return <>
      {group.getHasJoined() ? <div className="groups__leading-view groups__leading-view-joined">
        <CometChatAvatar
          image={group?.getIcon()}
          name={group?.getName()}
        />
        {/* Icon here */}
        <span className="groups__leading-view-info"> Joined</span>


      </div> : <div className="groups__leading-view">
        <CometChatAvatar
          image={group?.getIcon()}
          name={group?.getName()}
        />
        {/* Icon here */}
        <span className="groups__leading-view-info"> Join</span>


      </div>}</>;
  }

  /** Header View */
  const getHeaderView = () => {
    return (
      <div className="group-header">
        <p >
          Group
        </p>
        <div className="group-header-view" />
      </div>
    )
  };


  return (
    <div
      className="user-wrapper"
    >
      <CometChatGroups
        onItemClick={(group: CometChat.Group) => {
          onSelectorItemClicked(group, "group");
        }}
        leadingView={customLeadingView}
        headerView={getHeaderView()}
      />
    </div>
  )
}

