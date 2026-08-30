"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  enabled?: boolean;
};

export default function useCustomerNotificationSound({
  enabled = true,
}: Props = {}) {
  const audioContextRef =
    useRef<AudioContext | null>(null);

  const audioBufferRef =
    useRef<AudioBuffer | null>(null);

  const unlockedRef =
    useRef(false);

  const [ready, setReady] =
    useState(false);

  /* =======================================================
     AUDIO CONTEXT
  ======================================================= */

  const getAudioContext =
    useCallback(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return null;
      }

      if (
        !audioContextRef.current
      ) {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) {
          return null;
        }

        audioContextRef.current =
          new AudioContextClass();
      }

      return audioContextRef.current;
    }, []);

  /* =======================================================
     LOAD SOUND
  ======================================================= */

  const loadSound =
    useCallback(async () => {
      if (!enabled) {
        return;
      }

      if (
        audioBufferRef.current
      ) {
        setReady(true);
        return;
      }

      const context =
        getAudioContext();

      if (!context) {
        return;
      }

      try {
        const response =
          await fetch(
            "/sounds/notification.mp3",
            {
              cache: "force-cache",
            },
          );

        if (!response.ok) {
          throw new Error(
            `Notification sound failed: ${response.status}`,
          );
        }

        const arrayBuffer =
          await response.arrayBuffer();

        const audioBuffer =
          await context.decodeAudioData(
            arrayBuffer,
          );

        audioBufferRef.current =
          audioBuffer;

        setReady(true);
      } catch (error) {
        console.error(
          "[Customer Notification Sound]",
          error,
        );
      }
    }, [
      enabled,
      getAudioContext,
    ]);

  /* =======================================================
     UNLOCK AUDIO
  ======================================================= */

  const unlock =
    useCallback(async () => {
      if (!enabled) {
        return;
      }

      const context =
        getAudioContext();

      if (!context) {
        return;
      }

      try {
        if (
          context.state ===
          "suspended"
        ) {
          await context.resume();
        }

        unlockedRef.current = true;

        await loadSound();
      } catch (error) {
        console.error(
          "[Customer Notification Audio Unlock]",
          error,
        );
      }
    }, [
      enabled,
      getAudioContext,
      loadSound,
    ]);

  /* =======================================================
     PLAY SOUND
  ======================================================= */

  const play =
    useCallback(async () => {
      if (!enabled) {
        return;
      }

      const context =
        getAudioContext();

      if (!context) {
        return;
      }

      try {
        if (
          context.state ===
          "suspended"
        ) {
          await context.resume();
        }

        if (
          !audioBufferRef.current
        ) {
          await loadSound();
        }

        const buffer =
          audioBufferRef.current;

        if (!buffer) {
          return;
        }

        const source =
          context.createBufferSource();

        const gain =
          context.createGain();

        source.buffer = buffer;

        gain.gain.value = 0.8;

        source.connect(gain);

        gain.connect(
          context.destination,
        );

        source.start(0);
      } catch (error) {
        console.error(
          "[Customer Notification Sound Play]",
          error,
        );
      }
    }, [
      enabled,
      getAudioContext,
      loadSound,
    ]);

  /* =======================================================
     FIRST USER GESTURE
  ======================================================= */

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleGesture = () => {
      if (unlockedRef.current) {
        return;
      }

      void unlock();
    };

    window.addEventListener(
      "pointerdown",
      handleGesture,
      {
        once: true,
        passive: true,
      },
    );

    window.addEventListener(
      "touchstart",
      handleGesture,
      {
        once: true,
        passive: true,
      },
    );

    window.addEventListener(
      "keydown",
      handleGesture,
      {
        once: true,
      },
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handleGesture,
      );

      window.removeEventListener(
        "touchstart",
        handleGesture,
      );

      window.removeEventListener(
        "keydown",
        handleGesture,
      );
    };
  }, [
    enabled,
    unlock,
  ]);

  /* =======================================================
     PRELOAD
  ======================================================= */

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadSound();
  }, [
    enabled,
    loadSound,
  ]);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      const context =
        audioContextRef.current;

      if (context) {
        void context.close();
      }

      audioContextRef.current =
        null;

      audioBufferRef.current =
        null;
    };
  }, []);

  return {
    ready,
    unlock,
    play,
  };
}