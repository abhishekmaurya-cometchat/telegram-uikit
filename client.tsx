"use client";

import React, { useEffect, useState } from "react";
import {
  CometChatMessageComposer,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatUIKit,
  UIKitSettingsBuilder,
  CometChatIncomingCall,
  CometChatOngoingCall,
} from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatSelector } from "@/components/cometchat/CometChatSelector";
import tokenService from "@/services/token.service";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Get CometChat credentials from environment
const COMETCHAT_CONSTANTS = {
  APP_ID: process.env.NEXT_PUBLIC_COMETCHAT_APP_ID || "",
  REGION: process.env.NEXT_PUBLIC_COMETCHAT_REGION || "",
  AUTH_KEY: process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY || "",
};

export default function SupportChat() {
  const router = useRouter();
  const [user, setUser] = useState<CometChat.User | null>(null);
  const [selectedUser, setSelectedUser] = useState<CometChat.User | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<CometChat.Group | undefined>();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [ongoingCall, setOngoingCall] = useState<any>(null);
  const [callKey, setCallKey] = useState(0); // Force re-render
  const [isAcceptingCall, setIsAcceptingCall] = useState(false); // Track call acceptance

  useEffect(() => {
    // Get logged in user from tokenService
    const appUser = tokenService.getUser();
    
    if (!appUser) {
      router.push("/login");
      return;
    }

    const UID = appUser.id;

    // Initialize CometChat UIKit
    const UIKitSettings = new UIKitSettingsBuilder()
      .setAppId(COMETCHAT_CONSTANTS.APP_ID)
      .setRegion(COMETCHAT_CONSTANTS.REGION)
      .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
      .subscribePresenceForAllUsers()
      .build();

    CometChatUIKit.init(UIKitSettings)
      .then(() => {
        console.log("✅ CometChat initialization completed successfully");
        return CometChatUIKit.getLoggedinUser();
      })
      .then((loggedInUser) => {
        if (!loggedInUser) {
          // Login with user ID
          CometChatUIKit.login(UID)
            .then((loginUser) => {
              console.log("✅ Login Successful", { loginUser });
              setUser(loginUser);
              setupCallListeners();
            })
            .catch((error) => {
              console.error("❌ Login failed", error);
              if (error.code === "ERR_UID_NOT_FOUND") {
                alert(`User not found in CometChat. Please create user with UID: ${UID} in CometChat Dashboard first.`);
              }
            });
        } else {
          console.log("✅ Already logged-in", { loggedInUser });
          setUser(loggedInUser);
          setupCallListeners();
        }
      })
      .catch((error) => console.error("❌ Initialization failed", error));

    // Cleanup on unmount
    return () => {
      CometChat.removeCallListener("SUPPORT_CALL_LISTENER");
      // Clear any ongoing call state
      setOngoingCall(null);
      setIncomingCall(null);
    };
  }, []);

  // Setup call listeners for incoming and ongoing calls
  const setupCallListeners = () => {
    // Remove existing listener if any
    CometChat.removeCallListener("SUPPORT_CALL_LISTENER");
    
    // Listen for incoming calls
    CometChat.addCallListener(
      "SUPPORT_CALL_LISTENER",
      new CometChat.CallListener({
        onIncomingCallReceived: (call: any) => {
          console.log("📞 Incoming call received:", call);
          setIncomingCall(call);
        },
        onOutgoingCallAccepted: (call: any) => {
          console.log("📞 Outgoing call accepted:", call);
          setOngoingCall(call);
          setIncomingCall(null);
        },
        onOutgoingCallRejected: (call: any) => {
          console.log("📞 Outgoing call rejected:", call);
          setIncomingCall(null);
          setOngoingCall(null);
        },
        onIncomingCallCancelled: (call: any) => {
          console.log("📞 Incoming call cancelled:", call);
          setIncomingCall(null);
          setOngoingCall(null);
        },
        onCallEnded: (call: any) => {
          console.log("📞 Call ended from listener:", call);
          handleCallEnded();
        },
      })
    );
  };

  const handleCallEnded = () => {
    console.log("📞 Call ended - cleaning up");
    setOngoingCall(null);
    setIncomingCall(null);
    setIsAcceptingCall(false);
    setCallKey(prev => prev + 1); // Force complete re-render
    
    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
      audio.load();
    });
    
    console.log("📞 Call cleanup complete");
  };

  const handleAcceptCall = async (call: any) => {
    console.log("✅ Accepting call:", call);
    
    // Set flag to prevent incoming call from re-rendering
    setIsAcceptingCall(true);
    
    // IMMEDIATELY remove incoming call to stop ringtone
    setIncomingCall(null);
    
    // Stop all audio elements immediately
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load();
    });
    
    try {
      // Accept the call
      const acceptedCall = await CometChat.acceptCall(call.getSessionId());
      console.log("✅ Call accepted successfully:", acceptedCall);
      
      // Set ongoing call
      setOngoingCall(acceptedCall);
      setIsAcceptingCall(false);
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      setIncomingCall(null);
      setOngoingCall(null);
      setIsAcceptingCall(false);
    }
  };

  const handleDeclineCall = (call: any) => {
    console.log("❌ Declining call:", call);
    
    // Immediately clear incoming call to stop ringtone
    setIncomingCall(null);
    
    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
      audio.load();
    });
    
    // Reject the call using CometChat SDK
    CometChat.rejectCall(call.getSessionId(), CometChat.CALL_STATUS.REJECTED)
      .then((rejectedCall) => {
        console.log("✅ Call rejected successfully:", rejectedCall);
      })
      .catch((error) => {
        console.error("❌ Error rejecting call:", error);
      });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  // Render ongoing call view - takes priority
  if (ongoingCall) {
    return (
      <div key={`ongoing-${ongoingCall.getSessionId()}`} style={{ height: '100vh', width: '100%', backgroundColor: '#000' }}>
        <CometChatOngoingCall
          sessionID={ongoingCall.getSessionId()}
          callSettings={{
            sessionId: ongoingCall.getSessionId(),
            enableDefaultLayout: true,
            isAudioOnlyCall: ongoingCall.getType() === 'audio',
          }}
          onCallEnded={handleCallEnded}
          onError={(error: any) => {
            console.error("❌ Call error:", error);
            handleCallEnded();
          }}
        />
      </div>
    );
  }

  // Show loading during call acceptance transition
  if (isAcceptingCall) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#000' }}>
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-white">Connecting to call...</p>
        </div>
      </div>
    );
  }

  // Render incoming call view - only if no ongoing call and not accepting
  if (incomingCall && !ongoingCall && !isAcceptingCall) {
    return (
      <div key={`incoming-${incomingCall.getSessionId()}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.9)' }}>
        <CometChatIncomingCall
          call={incomingCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      </div>
    );
  }

  return (
    <div key={callKey} className="conversations-with-messages">
      {/* Sidebar with conversation selector */}
      <div className="conversations-wrapper">
        <CometChatSelector
          onSelectorItemClicked={(activeItem) => {
            let item =
              activeItem instanceof CometChat.Conversation
                ? activeItem.getConversationWith()
                : activeItem;

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
          }}
        />
      </div>

      {/* Chat message view */}
      {selectedUser || selectedGroup ? (
        <div className="messages-wrapper">
          {/* MessageHeader automatically includes CallButtons when Calls SDK is installed */}
          <CometChatMessageHeader user={selectedUser} group={selectedGroup} />
          <div className="h-full">
            <CometChatMessageList user={selectedUser} group={selectedGroup} />
          </div>
          <CometChatMessageComposer user={selectedUser} group={selectedGroup} />
        </div>
      ) : (
        <div className="empty-conversation">Select a conversation to start</div>
      )}
    </div>
  );
}