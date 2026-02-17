import { CometChatCallLogs } from "@cometchat/chat-uikit-react";
import { Call } from "@cometchat/chat-sdk-javascript";
import "./CometChatCall.css"

interface SelectorProps {
    onSelectorItemClicked?: (
        input: Call,
        type: string
    ) => void;
    onHide?: () => void;
    onNewChatClicked?: () => void;
}

export const CometChatCall = (props: SelectorProps) => {
    const { onSelectorItemClicked = () => { } } = props;

    const handleOnItemClick = (callLog: any) => {
        console.log("custom on item click", callLog);
        onSelectorItemClicked(callLog, "calls")
    };

    return (
        <div>
            <CometChatCallLogs
                onItemClick={handleOnItemClick}
            />
        </div>
    )
}