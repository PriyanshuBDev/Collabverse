import { useCallChannelRT } from "@/components/wrappers/CallChannelProvider";
import useCurrentUser from "../useCurrentUser";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CallEndReason,
  callMode,
  CallSpace,
  CallState,
  memberProps,
  SignalMessage,
} from "@/app/interfaces";
import { useLocalMedia } from "./useLocalMedia";
import {
  addIceCandidate,
  closePeer,
  createAnswer,
  createOffer,
  createPeer,
  replaceTrack,
  setRemoteDescription,
} from "@/lib/webrtc/peer";
import { useCallBroadcast } from "../realtime/Conversation/useCallBroadcast";
import { useCallStore } from "../zustand/useCallStore";
import { useCallListener } from "../realtime/Conversation/useCallListener";
import { useCallMutations } from "@/lib/queries/workspace/conversation/call/useCallMutations";
import { stopStream } from "@/lib/webrtc/media";
import { useCreateNewDm } from "@/lib/queries/workspace/conversation/dm/new/useCreateNewDm";
import { useCallActions } from "../realtime/Conversation/useCallActions";
import { useCallInvitaion } from "../realtime/Conversation/useCallInvitation";
import { getMediaErrorMessage } from "@/lib/functions/error/getMediaErrorMessage";
import { toast } from "sonner";
export interface PendingIncomingCall {
  from: string;
  conversationId: string;
  callType: callMode;
  space: CallSpace;
  offer?: RTCSessionDescriptionInit;
}
export function useCall() {
  const { id: currentUserId } = useCurrentUser();
  const { channel } = useCallChannelRT();
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pendingOfferRef = useRef<SignalMessage | null>(null);
  const callTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [callEndReason, setCallEndReason] = useState<CallEndReason>();
  const [showError, setShowError] = useState<string | null>(null);
  const {
    isMuted,
    setMuted,
    setCameraEnabled,
    setIncomingCall,
    setScreenSharing,
    isCameraEnabled,
    isScreenSharing,
    remoteIsMuted,
    remoteIsCameraEnabled,
    remoteIsScreenSharing,
    setRemoteCameraEnabled,
    setRemoteMuted,
    setRemoteScreenSharing,
    setCallId,
    setIsAccepted,
    setCallSpace,
    setRemoteUserData,
    setCallStarted,
  } = useCallStore();
  const active = useCallStore((s) => s.active);
  const callState = useCallStore((s) => s.callState);
  const callMode = useCallStore((s) => s.callMode);
  const callId = useCallStore((s) => s.callId);
  const incomingCall = useCallStore((s) => s.incomingCall);

  const setActive = useCallStore((s) => s.setActive);
  const setCallState = useCallStore((s) => s.setCallState);
  const setCallMode = useCallStore((s) => s.setCallMode);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { mutateAsync: createConvo } = useCreateNewDm(false);
  const {
    localStream,
    getUserMedia,
    getUserScreen,
    stopMedia,
    stopScreen,
    toggleCamera,
    toggleMute,
    getUserAudio,
  } = useLocalMedia(cameraStreamRef, screenStreamRef);
  const {
    sendAnswer,
    sendCameraToggle,
    sendCandidate,
    sendHangup,
    sendMute,
    sendScreenShare,
    sendOffer,
  } = useCallBroadcast();
  const { sendIncomingCall, sendAccept, sendBusy, sendReject, sendCancel } =
    useCallActions();
  const {
    createCall,
    join,
    updateStatus,
    checkCallMutation,
    createCallWithConvo,
  } = useCallMutations();
  const callStartTimeRef = useRef<number | null>(null);

  const [callDuration, setCallDuration] = useState(0);

  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCallTimer = () => {
    if (callTimerRef.current) return;

    callStartTimeRef.current = Date.now();

    callTimerRef.current = setInterval(() => {
      if (!callStartTimeRef.current) return;

      setCallDuration(
        Math.floor((Date.now() - callStartTimeRef.current) / 1000),
      );
    }, 1000);
  };
  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };
  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      closePeer(peerRef.current, localStream);
    }
    peerRef.current = null;
    stopMedia();
    stopStream(screenStreamRef.current);
    cameraStreamRef.current = null;
    screenStreamRef.current = null;
    pendingCandidatesRef.current = [];
    pendingOfferRef.current = null;
    remoteUserIdRef.current = null;
    conversationIdRef.current = null;
    setRemoteStream(null);
    setIncomingCall(null);
    setCallState(CallState.IDLE);
    setCameraEnabled(false);
    setMuted(false);
    setScreenSharing(false);
    setActive(false);
    stopCallTimer();
    setIsAccepted(false);
    setCallStarted(false);
    setShowError(null);
  }, [
    setActive,
    setCallState,
    stopMedia,
    setIncomingCall,
    setCameraEnabled,
    setMuted,
    setScreenSharing,
    localStream,
    setIsAccepted,
    setCallStarted,
  ]);
  const clearCallTimeout = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  }, []);
  const callEnd = useCallback(
    async (reason: "Cancelled" | "Missed" | "Failed") => {
      const callId = useCallStore.getState().callId;
      if (!callId) return;
      clearCallTimeout();
      const remoteUserId = remoteUserIdRef.current;
      const conversationId = conversationIdRef.current;
      if (remoteUserId && conversationId) {
        await sendCancel(remoteUserId, conversationId);
        updateStatus.mutate({ conversationId, callId, status: reason });
      }
      cleanupCall();
    },
    [cleanupCall, sendCancel, clearCallTimeout, updateStatus],
  );
  const onCancel = () => {
    cleanupCall();
    clearCallTimeout();
  };
  const initializePeer = useCallback(
    (remoteUserId: string) => {
      if (peerRef.current) {
        return peerRef.current;
      }
      const peer = createPeer();
      peerRef.current = peer;
      remoteUserIdRef.current = remoteUserId;
      peer.ontrack = (event) => {
        console.info("[call-debug] remote media track received", {
          kinds: event.streams[0]?.getTracks().map((track) => track.kind) ?? [],
        });
        const stream = event.streams[0];
        if (stream) {
          setRemoteStream(stream);
        }
      };
      peer.onicecandidate = async (event) => {
        if (!event.candidate) return;
        const conversationId = conversationIdRef.current;
        const remoteUserId = remoteUserIdRef.current;
        if (!conversationId || !remoteUserId) {
          return;
        }
        await sendCandidate(remoteUserId, conversationId, event.candidate);
      };
      peer.onconnectionstatechange = async () => {
        console.info("[call-debug] peer connection state", {
          connection: peer.connectionState,
          ice: peer.iceConnectionState,
          signaling: peer.signalingState,
        });
        switch (peer.connectionState) {
          case "connecting":
            setCallState(CallState.CONNECTING);
            break;
          case "connected":
            setCallState(CallState.CONNECTED);
            startCallTimer();
            const callId = useCallStore.getState().callId;
            if (conversationIdRef.current && callId) {
              updateStatus.mutate({
                conversationId: conversationIdRef.current,
                callId,
                status: "Active",
              });
            }
            break;
          case "disconnected":
            setCallEndReason("Ended");
            break;
          case "failed":
            await callEnd("Failed");
            setCallEndReason("Failed");
            break;
          case "closed":
            setCallState(CallState.IDLE);
            setCallEndReason("Ended");
            break;
        }
      };
      peer.oniceconnectionstatechange = () => {
        console.info("[call-debug] ICE connection state", {
          ice: peer.iceConnectionState,
          gathering: peer.iceGatheringState,
        });
      };
      return peer;
    },
    [sendCandidate, setCallState, updateStatus, callEnd],
  );
  const addLocalTracks = useCallback(
    (peer: RTCPeerConnection, stream: MediaStream) => {
      const existingSenders = peer.getSenders();
      for (const track of stream.getTracks()) {
        const alreadyAdded = existingSenders.some(
          (sender) => sender.track === track,
        );
        if (!alreadyAdded) {
          peer.addTrack(track, stream);
        }
      }
    },
    [],
  );
  const flushPendingCandidates = useCallback(
    async (peer: RTCPeerConnection) => {
      if (!peer.remoteDescription) return;
      const candidates = pendingCandidatesRef.current;
      pendingCandidatesRef.current = [];
      for (const candidate of candidates) {
        try {
          await peer.addIceCandidate(candidate);
        } catch (e) {
          console.error("Failed to add queued ICE candidate:", e);
        }
      }
    },
    [],
  );

  const startCall = useCallback(
    async (
      remoteUserData: memberProps,
      mode: callMode,
      space: CallSpace,
      conversationId?: string,
    ) => {
      if (!channel) return;
      if (active) return;
      setActive(true);
      setCallEndReason(undefined);
      setCallSpace(space);
      setRemoteUserData(remoteUserData);
      setCallStarted(true);
      setCallMode(mode);
      try {
        if (mode === "Voice") {
          await getUserAudio();
        } else {
          await getUserMedia();
        }
      } catch (e) {
        console.error("[call-debug] local media permission failed", e);
        toast.error(getMediaErrorMessage(e));
        setActive(false);
        setCallStarted(false);
        return;
      }
      try {
        if (space === "Flowspace") {
          const data = await createCallWithConvo.mutateAsync({
            remoteUserId: remoteUserData.id,
            type: mode,
          });
          conversationId = data.conversationId;
        } else {
          if (!conversationId) {
            conversationId = (await createConvo(remoteUserData.id))
              .conversationId;
          }
          await createCall.mutateAsync({ conversationId, type: mode });
        }
      } catch (e) {
        console.error(e);
        return;
      }

      remoteUserIdRef.current = remoteUserData.id;
      conversationIdRef.current = conversationId;
      setCallState(CallState.CALLING);
      await sendIncomingCall(remoteUserData.id, conversationId, space);
      clearCallTimeout();
      callTimeoutRef.current = setTimeout(async () => {
        await callEnd("Missed");
        setCallEndReason("Timeout");
      }, 30 * 1000);
    },
    [
      createConvo,
      channel,
      setCallState,
      setCallMode,
      sendIncomingCall,
      clearCallTimeout,
      callEnd,
      createCall,
      getUserAudio,
      getUserMedia,
      active,
      setActive,
      createCallWithConvo,
      setCallSpace,
      setRemoteUserData,
      setCallStarted,
    ],
  );

  const onIncomingCall = useCallback(
    async (payload: SignalMessage) => {
      if (!channel) return;
      const success = await checkCallMutation.mutateAsync({
        conversationId: payload.conversationId,
        callId: payload.callId,
      });
      if (!success) return;
      setCallEndReason(undefined);
      const active = useCallStore.getState().active;
      const callState = useCallStore.getState().callState;
      const isBusy =
        active ||
        callState === CallState.CALLING ||
        callState === CallState.RINGING ||
        callState === CallState.CONNECTING ||
        callState === CallState.CONNECTED;
      if (isBusy) {
        await sendBusy(payload.from, payload.conversationId);
        updateStatus.mutate({
          conversationId: payload.conversationId,
          callId: payload.callId,
          status: "Busy",
        });
        return;
      }
      setActive(true);
      setIncomingCall({
        callType: payload.mode,
        from: payload.from,
        conversationId: payload.conversationId,
        space: payload.payload as CallSpace,
      });
      setCallSpace(payload.payload as CallSpace);
      setCallId(payload.callId);
      setCallState(CallState.RINGING);
      setCallMode(payload.mode);
    },
    [
      setActive,
      setCallState,
      setIncomingCall,
      setCallMode,
      sendBusy,
      channel,
      setCallId,
      updateStatus,
      checkCallMutation,
      setCallSpace,
    ],
  );

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !channel) return;
    const { from, conversationId } = incomingCall;
    const mode = incomingCall.callType;
    try {
      if (mode === "Voice") {
        await getUserAudio();
      } else {
        await getUserMedia();
      }
    } catch (e) {
      console.error("[call-debug] local media permission failed", e);
      toast.error(getMediaErrorMessage(e));
      return;
    }
    setCallMode(mode);
    setIncomingCall(null);
    setIsAccepted(true);
    remoteUserIdRef.current = from;
    conversationIdRef.current = conversationId;
    setCallState(CallState.CONNECTING);
    await sendAccept(from, conversationId);
  }, [
    incomingCall,
    channel,
    setCallState,
    sendAccept,
    setIncomingCall,
    setIsAccepted,
    getUserAudio,
    getUserMedia,
    setCallMode,
  ]);
  const rejectCall = useCallback(async () => {
    setActive(false);
    if (!incomingCall || !channel) return;
    await sendReject(incomingCall.from, incomingCall.conversationId);
    if (callId) {
      updateStatus.mutate({
        conversationId: incomingCall.conversationId,
        callId,
        status: "Rejected",
      });
    }
    setIncomingCall(null);
  }, [
    setActive,
    channel,
    incomingCall,
    setIncomingCall,
    sendReject,
    callId,
    updateStatus,
  ]);

  const onAccept = useCallback(async () => {
    if (!channel) {
      throw new Error("Call signaling on workspace channel is not available");
    }
    if (peerRef.current) {
      return;
    }
    clearCallTimeout();
    const remoteUserId = remoteUserIdRef.current;
    const conversationId = conversationIdRef.current;
    if (!remoteUserId || !conversationId) return;
    setCallState(CallState.CONNECTING);
    const peer = initializePeer(remoteUserId);
    const callMode = useCallStore.getState().callMode;
    try {
      if (callMode === "Voice") {
        setCallMode("Voice");
        const stream = await getUserAudio();

        addLocalTracks(peer, stream);
      } else {
        setCallMode("Video");
        const stream = await getUserMedia();
        setCameraEnabled(true);
        cameraStreamRef.current = stream;
        addLocalTracks(peer, stream);
      }
    } catch (e) {
      setShowError(getMediaErrorMessage(e));
    }
    const offer = await createOffer(peer);
      console.info("[call-debug] local offer created");
    await sendOffer(remoteUserId, conversationId, offer);
  }, [
    clearCallTimeout,
    addLocalTracks,
    channel,
    getUserMedia,
    getUserAudio,
    initializePeer,
    sendOffer,
    setCallState,
    setCallMode,
    setCameraEnabled,
  ]);
  const onOffer = useCallback(
    async (payload: SignalMessage) => {
      if (!channel) return;
      if (payload.to !== currentUserId) return;
      remoteUserIdRef.current = payload.from;
      conversationIdRef.current = payload.conversationId;
      if (!remoteUserIdRef.current || !conversationIdRef.current) return;
      const callState = useCallStore.getState().callState;
      const offer = payload.payload;
      if (!isRTCSessionDescriptionInit(offer)) return;
      if (callState === CallState.RINGING) {
        pendingOfferRef.current = payload;
        return;
      }

      // User has accepted, so answer now.
      if (callState !== CallState.CONNECTING) {
        return;
      }
      const peer = initializePeer(payload.from);
      try {
        if (payload.mode === "Voice") {
          setCallMode("Voice");
          const stream = await getUserAudio();

          addLocalTracks(peer, stream);
        } else {
          setCallMode("Video");
          const stream = await getUserMedia();
          setCameraEnabled(true);
          cameraStreamRef.current = stream;
          addLocalTracks(peer, stream);
        }
      } catch (e) {
        setShowError(getMediaErrorMessage(e));
      }
      await setRemoteDescription(peer, offer);
      console.info("[call-debug] remote offer applied");
      await flushPendingCandidates(peer);
      if (peer.signalingState !== "have-remote-offer") {
        console.warn(
          "Skipping answer; unexpected signaling state:",
          peer.signalingState,
        );
        return;
      }
      const answer = await createAnswer(peer);

      await sendAnswer(payload.from, payload.conversationId, answer);
      console.info("[call-debug] answer sent");
      if (callId) {
        join.mutate({ conversationId: conversationIdRef.current, callId });
      }
      pendingOfferRef.current = null;
    },
    [
      channel,
      sendAnswer,
      currentUserId,
      flushPendingCandidates,
      addLocalTracks,
      getUserAudio,
      getUserMedia,
      setCallMode,
      setCameraEnabled,
      callId,
      join,
      initializePeer,
    ],
  );
  const onAnswer = useCallback(
    async (payload: SignalMessage) => {
      if (payload.to !== currentUserId) return;
      const peer = peerRef.current;
      if (!peer) return;
      const answer = payload.payload;
      if (!isRTCSessionDescriptionInit(answer)) return;
      await setRemoteDescription(peer, answer);
      console.info("[call-debug] remote answer applied");
      await flushPendingCandidates(peer);
    },
    [currentUserId, flushPendingCandidates],
  );

  useEffect(() => {
    if (callState !== CallState.CONNECTING || !pendingOfferRef.current) return;

    const pendingOffer = pendingOfferRef.current;
    pendingOfferRef.current = null;
    void onOffer(pendingOffer);
  }, [callState, onOffer]);

  const onCandidate = useCallback(
    async (payload: SignalMessage) => {
      if (payload.to !== currentUserId) return;
      const candidate = payload.payload;
      if (!isRTCIceCandidateInit(candidate)) return;
      const peer = peerRef.current;
      if (!peer || !peer.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      await addIceCandidate(peer, candidate);
    },
    [currentUserId],
  );

  const hangup = useCallback(async () => {
    if (channel) {
      const remoteUserId = remoteUserIdRef.current;
      const conversationId = conversationIdRef.current;
      if (remoteUserId && conversationId) {
        if (callTimeoutRef.current) {
          await callEnd("Cancelled");
          setCallEndReason("Cancelled");
        } else {
          await sendHangup(remoteUserId, conversationId);
          if (callId) {
            updateStatus.mutate({ conversationId, callId, status: "Ended" });
          }
          cleanupCall();
          clearCallTimeout();
        }
      }
    }
  }, [
    callEnd,
    channel,
    cleanupCall,
    sendHangup,
    clearCallTimeout,
    updateStatus,
    callId,
  ]);

  const handleCameraToggle = useCallback(async () => {
    if (!channel) return;
    const remoteUserId = remoteUserIdRef.current;
    const conversationId = conversationIdRef.current;
    if (!remoteUserId || !conversationId) return;
    const enabled = toggleCamera();
    if (enabled === undefined) return;
    await sendCameraToggle(remoteUserId, conversationId, enabled);
  }, [channel, sendCameraToggle, toggleCamera]);
  const handleMute = useCallback(async () => {
    if (!channel) return;
    const remoteUserId = remoteUserIdRef.current;
    const conversationId = conversationIdRef.current;
    if (!remoteUserId || !conversationId) return;
    const enabled = toggleMute();
    if (enabled === undefined) return;
    await sendMute(remoteUserId, conversationId, enabled);
  }, [toggleMute, sendMute, channel]);
  const stopScreenShare = useCallback(async () => {
    const peer = peerRef.current;
    const remoteUserId = remoteUserIdRef.current;
    const conversationId = conversationIdRef.current;
    const screenStream = screenStreamRef.current;

    if (!screenStream) return;

    // Clear this first so stopping the track doesn't trigger cleanup twice.
    screenStreamRef.current = null;

    const cameraTrack = cameraStreamRef.current?.getVideoTracks()[0];

    try {
      if (peer && cameraTrack) {
        await replaceTrack(peer, "video", cameraTrack);
      }
    } finally {
      stopScreen();
      setCameraEnabled(true);
      setScreenSharing(false);

      if (remoteUserId && conversationId) {
        await sendScreenShare(remoteUserId, conversationId, false);
      }
    }
  }, [stopScreen, setCameraEnabled, setScreenSharing, sendScreenShare]);

  const screenShare = useCallback(async () => {
    // Clicking while sharing stops it and restores the camera.
    if (screenStreamRef.current) {
      await stopScreenShare();
      return;
    }

    const peer = peerRef.current;
    const remoteUserId = remoteUserIdRef.current;
    const conversationId = conversationIdRef.current;

    if (!peer || !remoteUserId || !conversationId) return;

    const screenStream = await getUserScreen();
    const screenTrack = screenStream.getVideoTracks()[0];

    if (!screenTrack) {
      screenStream.getTracks().forEach((track) => track.stop());
      return;
    }

    screenStreamRef.current = screenStream;
    screenTrack.onended = () => {
      void stopScreenShare();
    };

    try {
      await replaceTrack(peer, "video", screenTrack);
      setScreenSharing(true);
      setCameraEnabled(false);
      await sendScreenShare(remoteUserId, conversationId, true);
    } catch (error) {
      await stopScreenShare();
      throw error;
    }
  }, [
    getUserScreen,
    stopScreenShare,
    setCameraEnabled,
    setScreenSharing,
    sendScreenShare,
  ]);
  const onToggle = (set: (value: boolean) => void, payload: SignalMessage) => {
    const remoteUserId = remoteUserIdRef.current;
    const conversationId = conversationIdRef.current;
    if (!remoteUserId || !conversationId) return;
    set(Boolean(payload.payload));
  };
  const onCameraToggle = useCallback(
    async (payload: SignalMessage) => {
      onToggle(setRemoteCameraEnabled, payload);
    },
    [setRemoteCameraEnabled],
  );
  const onMute = useCallback(
    async (payload: SignalMessage) => {
      onToggle(setRemoteMuted, payload);
    },
    [setRemoteMuted],
  );
  const onScreenShare = useCallback(
    async (payload: SignalMessage) => {
      onToggle(setRemoteScreenSharing, payload);
    },
    [setRemoteScreenSharing],
  );
  const onReject = () => {
    onCancel();
    setCallEndReason("Rejected");
  };
  const onHangup = () => {
    onCancel();
    setCallEndReason("Ended");
  };
  const onBusy = () => {
    onCancel();
    setCallEndReason("Busy");
  };

  useCallListener({
    onAnswer,
    onOffer,
    onCandidate,
    onHangup,
    onCameraToggle,
    onMute,
    onScreenShare,
    onCancel,
  });
  useCallInvitaion({ onIncomingCall, onReject, onAccept, onBusy });
  return {
    callDuration,
    callState,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraEnabled,
    isScreenSharing,
    startCall,
    acceptCall,
    rejectCall,
    hangup,
    remoteIsCameraEnabled,
    remoteIsMuted,
    remoteIsScreenSharing,
    handleCameraToggle,
    handleMute,
    screenShare,
    callEndReason,
    callMode,
    callId,
    showError,
  };
}
function isRTCSessionDescriptionInit(
  value: unknown,
): value is RTCSessionDescriptionInit {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.type === "string" &&
    (obj.sdp === undefined || typeof obj.sdp === "string")
  );
}
export function isRTCIceCandidateInit(
  value: unknown,
): value is RTCIceCandidateInit {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return obj.candidate === undefined || typeof obj.candidate === "string";
}
