export const getMediaErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No microphone or camera was found. Connect a device and try again.";
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "Microphone or camera access was blocked. Allow access in your browser settings and try again.";
      case "NotReadableError":
      case "TrackStartError":
        return "Your microphone or camera may be in use by another app. Close it and try again.";
      case "OverconstrainedError":
        return "The available microphone or camera can't meet this call's requirements.";
      default:
        return "Couldn't access your microphone or camera. Check your device settings and try again.";
    }
  }

  return "Something went wrong while starting the call. Please try again.";
};
