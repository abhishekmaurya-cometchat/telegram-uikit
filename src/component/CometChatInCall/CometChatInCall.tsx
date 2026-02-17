import { CometChatAvatar, CometChatIncomingCall, CometChatUIEvents } from "@cometchat/chat-uikit-react"

const CometChatInCall = () => {
    CometChatUIEvents



    const getItemView = (call: CometChat.Call) => {
        return (
            <div className="incoming-call__itemview">
                <CometChatAvatar name={call?.getCallInitiator()?.getName()} image={call?.getCallInitiator()?.getAvatar()} />
                <div>
                    <div className="incoming-call__itemview-title">
                        {call?.getCallInitiator()?.getName()}
                    </div>
                    <div className="incoming-call__itemview-subtitle">
                        {"Incoming " + call.getType() + " call"}
                    </div>
                </div>
            </div>
        )
    };


    return (
        <div>
            <CometChatIncomingCall itemView={getItemView} />
        </div>
    )
}

export default CometChatInCall