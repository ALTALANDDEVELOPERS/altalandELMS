
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Modal } from './common/Modal';
import { geminiService } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import type { LiveServerMessage, Blob } from '@google/genai';

// Audio Encoding/Decoding functions from Gemini API guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface LiveAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveRequest: (details: {
    leaveType: 'Vacation' | 'Sick' | 'Personal' | 'Unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }) => void;
}

type TranscriptEntry = {
  id: number;
  speaker: 'You' | 'Assistant';
  text: string;
  isFinal: boolean;
};

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ isOpen, onClose, onLeaveRequest }) => {
    const [status, setStatus] = useState('Initializing...');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    
    const sessionPromiseRef = useRef<ReturnType<typeof geminiService.connectLive> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    // FIX: Refactor transcription update logic to robustly handle streaming updates for different speakers.
    const addOrUpdateTranscript = (speaker: 'You' | 'Assistant', text: string, isFinal: boolean) => {
        setTranscript(prev => {
            // FIX: Replace `findLastIndex` with a compatible loop to support older JavaScript environments.
            let lastEntryForSpeakerIndex = -1;
            for (let i = prev.length - 1; i >= 0; i--) {
                if (prev[i].speaker === speaker && !prev[i].isFinal) {
                    lastEntryForSpeakerIndex = i;
                    break;
                }
            }

            if (lastEntryForSpeakerIndex !== -1) {
                // Update last non-final entry for this speaker
                const newTranscript = [...prev];
                newTranscript[lastEntryForSpeakerIndex] = { ...newTranscript[lastEntryForSpeakerIndex], text, isFinal };
                return newTranscript;
            } else {
                // Add new entry
                return [...prev, { id: Date.now(), speaker, text, isFinal }];
            }
        });
    };

    const cleanup = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        if(sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setStatus('Initializing...');
        setTranscript([]);
    }, []);


    const startSession = useCallback(async () => {
        setTranscript([]);
        setStatus('Requesting mic permissions...');
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setStatus('Error: Mic access not supported.');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setStatus('Connecting to assistant...');

            // FIX: Cast window to `any` to allow access to vendor-prefixed `webkitAudioContext` without TypeScript errors.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // FIX: Cast window to `any` to allow access to vendor-prefixed `webkitAudioContext` without TypeScript errors.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = geminiService.connectLive({
                onopen: () => {
                    setStatus('Listening...');
                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // FIX: Refactor transcription handling to accumulate text from streaming responses and use the `turnComplete` event to finalize the transcript, removing reliance on the non-existent `isFinal` property.
                    if (message.serverContent?.inputTranscription) {
                        const { text } = message.serverContent.inputTranscription;
                        currentInputTranscriptionRef.current += text;
                        addOrUpdateTranscript('You', currentInputTranscriptionRef.current, false);
                    }
                    if (message.serverContent?.outputTranscription) {
                        const { text } = message.serverContent.outputTranscription;
                        currentOutputTranscriptionRef.current += text;
                        addOrUpdateTranscript('Assistant', currentOutputTranscriptionRef.current, false);
                    }

                    if (message.serverContent?.turnComplete) {
                        if (currentInputTranscriptionRef.current) {
                            addOrUpdateTranscript('You', currentInputTranscriptionRef.current, true);
                            currentInputTranscriptionRef.current = '';
                        }
                        if (currentOutputTranscriptionRef.current) {
                            addOrUpdateTranscript('Assistant', currentOutputTranscriptionRef.current, true);
                            currentOutputTranscriptionRef.current = '';
                        }
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio) {
                        setStatus('Speaking...');
                        const outputCtx = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        
                        source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                            if (sourcesRef.current.size === 0) setStatus('Listening...');
                        });

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                    
                    if (message.serverContent?.interrupted) {
                        sourcesRef.current.forEach(source => source.stop());
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }

                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            if (fc.name === 'submitLeaveRequest') {
                                onLeaveRequest(fc.args as any);
                                onClose();
                            }
                        }
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setStatus('Connection error. Please try again.');
                },
                onclose: (e: CloseEvent) => {
                    setStatus('Session ended.');
                },
            });

        } catch (err) {
            console.error('Error starting live session:', err);
            setStatus('Error: Could not access microphone.');
        }
    }, [onLeaveRequest, onClose]);

    useEffect(() => {
        if (isOpen) {
            startSession();
        } else {
            cleanup();
        }
        return () => {
            if(isOpen) cleanup();
        };
    }, [isOpen, startSession, cleanup]);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const getStatusIndicator = () => {
        switch (status) {
            case 'Listening...':
                return <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse"></div>;
            case 'Speaking...':
                return <div className="w-6 h-6 rounded-full bg-blue-500 animate-pulse"></div>;
            case 'Connecting to assistant...':
            case 'Requesting mic permissions...':
                return <Spinner size="sm" />;
            default:
                return <div className="w-6 h-6 rounded-full bg-gray-500"></div>;
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Live Assistant">
            <div className="flex flex-col h-[60vh]">
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                    {transcript.map((entry) => (
                         <div key={entry.id} className={`flex items-start gap-3 ${entry.speaker === 'You' ? 'justify-end' : ''}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-lg ${entry.speaker === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                                <p className="text-sm font-semibold mb-1">{entry.speaker}</p>
                                <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
                <div className="flex-shrink-0 pt-4 flex items-center justify-center space-x-3">
                    {getStatusIndicator()}
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{status}</p>
                </div>
            </div>
        </Modal>
    );
};
