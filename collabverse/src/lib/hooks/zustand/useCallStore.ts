import { callMode, CallSpace, CallState, memberProps } from "@/app/interfaces";
import { create } from "zustand";
import { PendingIncomingCall } from "../call/useCall";

interface CallStore {
  active: boolean;
  callId: string | null;
  callState: CallState;
  callMode: callMode | null;
  incomingCall: PendingIncomingCall | null;
  isMuted: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  remoteIsMuted: boolean;
  remoteIsCameraEnabled: boolean;
  remoteIsScreenSharing: boolean;
  conversationId?: string;
  remoteUserData: memberProps | null;
  isAccepted: boolean;
  callSpace: CallSpace;
  callStarted: boolean;
  setActive: (state: boolean) => void;
  setCallId: (state: string | null) => void;
  setCallMode: (state: callMode | null) => void;
  setCallState: (state: CallState) => void;
  setIncomingCall: (call: PendingIncomingCall | null) => void;
  setMuted: (value: boolean) => void;
  setCameraEnabled: (value: boolean) => void;
  setScreenSharing: (value: boolean) => void;
  setRemoteMuted: (value: boolean) => void;
  setRemoteCameraEnabled: (value: boolean) => void;
  setRemoteScreenSharing: (value: boolean) => void;
  setRemoteUserData: (value: memberProps) => void;
  setIsAccepted: (value: boolean) => void;
  setCallSpace: (value: CallSpace) => void;
  setCallStarted: (value: boolean) => void;
}

export const useCallStore = create<CallStore>((set) => ({
  active: false,
  callId: null,
  callState: CallState.IDLE,
  incomingCall: null,
  isMuted: false,
  isCameraEnabled: false,
  isScreenSharing: false,
  callMode: null,
  remoteIsMuted: false,
  remoteIsCameraEnabled: false,
  remoteIsScreenSharing: false,
  remoteUserData: null,
  isAccepted: false,
  callSpace: "Workspace",
  callStarted: false,
  setActive: (state) => {
    set(() => {
      return {
        active: state,
      };
    });
  },
  setCallId: (state) => {
    set(() => {
      return {
        callId: state,
      };
    });
  },
  setCallMode: (state) => {
    set(() => {
      return {
        callMode: state,
      };
    });
  },
  setCallState: (state) => {
    set(() => {
      return {
        callState: state,
      };
    });
  },
  setIncomingCall: (call) => {
    set(() => {
      return {
        incomingCall: call,
      };
    });
  },
  setMuted: (value) => {
    set(() => {
      return {
        isMuted: value,
      };
    });
  },
  setCameraEnabled: (value) => {
    set(() => {
      return {
        isCameraEnabled: value,
      };
    });
  },
  setScreenSharing: (value) => {
    set(() => {
      return {
        isScreenSharing: value,
      };
    });
  },
  setRemoteMuted: (value) => {
    set(() => {
      return {
        remoteIsMuted: value,
      };
    });
  },
  setRemoteCameraEnabled: (value) => {
    set(() => {
      return {
        remoteIsCameraEnabled: value,
      };
    });
  },
  setRemoteScreenSharing: (value) => {
    set(() => {
      return {
        remoteIsScreenSharing: value,
      };
    });
  },
  setRemoteUserData: (value) => {
    set(() => {
      return {
        remoteUserData: value,
      };
    });
  },
  setIsAccepted: (value) => {
    set(() => {
      return {
        isAccepted: value,
      };
    });
  },
  setCallSpace: (value) => {
    set(() => {
      return {
        callSpace: value,
      };
    });
  },
  setCallStarted: (value) => {
    set(() => {
      return {
        callStarted: value,
      };
    });
  },
}));
