import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { backUrl } from "@/constants";
import * as StompJs from "@stomp/stompjs";
import { ChatRoom, OpenChatRoom } from "@/types/chat";

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

// 채팅 메시지 인터페이스
interface ChatMessage {
    id: number;
    content: string;
    createdDate?: string;
    createDate?: string;
    memberId: number;
    chatUserRead: boolean;
    targetUserRead: boolean;
}

// SSE 이벤트 데이터 인터페이스
interface SseEventData {
    type?: string;
    eventType?: string;
    chatRoomId?: number;
    roomId?: number;
    memberId?: number;
    content?: string;
    createdDate?: string;
}

// 유저 정보 인터페이스
interface UserInfo {
    nickname: string;
    imageUrl: string;
    userId: number;
}

export function useChatManager(isLoggedIn: boolean, loginUserId: number | undefined): {
    chatRooms: ChatRoom[];
    openChatRooms: OpenChatRoom[];
    loading: boolean;
    error: string | null;
    isChatListOpen: boolean;
    setIsChatListOpen: (isOpen: boolean) => void;
    handleEnterChatRoom: (room: ChatRoom) => void;
    handleCloseChatRoom: (roomId: number) => void;
    handleLeaveRoom: (roomId: number, e?: React.MouseEvent) => Promise<void>;
    fetchChatRooms: () => Promise<void>;
    formatLastMessage: (room: ChatRoom) => string;
    formatTime: (dateString: string) => string;
    getOtherUserInfo: (room: ChatRoom) => UserInfo;
    DEFAULT_IMAGE_URL: string;
} {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [openChatRooms, setOpenChatRooms] = useState<OpenChatRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isChatListOpen, setIsChatListOpen] = useState<boolean>(false);
    const client = useRef<StompJs.Client | null>(null);
    const sseRef = useRef<EventSource | null>(null);

    // 채팅방을 마지막 메시지 시간 기준으로 정렬하는 함수
    const sortChatRoomsByLastMessageTime = useCallback((rooms: ChatRoom[]): ChatRoom[] => {
        return [...rooms].sort((a, b) => {
            const aLastMessageTime = a.chatMessages && a.chatMessages.length > 0
                ? new Date(a.chatMessages[a.chatMessages.length - 1].createdDate ||
                    a.chatMessages[a.chatMessages.length - 1].createDate ||
                    a.modifiedDate).getTime()
                : new Date(a.modifiedDate).getTime();

            const bLastMessageTime = b.chatMessages && b.chatMessages.length > 0
                ? new Date(b.chatMessages[b.chatMessages.length - 1].createdDate ||
                    b.chatMessages[b.chatMessages.length - 1].createDate ||
                    b.modifiedDate).getTime()
                : new Date(b.modifiedDate).getTime();

            return bLastMessageTime - aLastMessageTime;
        });
    }, []);

    // 채팅방 목록 가져오기
    const fetchChatRooms = useCallback(async (): Promise<void> => {
        if (!loginUserId) {
            setError("로그인 안됨, 재로그인 필요");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${backUrl}/api/v1/chat/rooms/list-with-unread`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
                timeout: 10000
            });

            if (response.data && response.data.data) {
                const filteredRooms = response.data.data.filter(
                    (room: ChatRoom) => room.chatUserId === loginUserId || room.targetUserId === loginUserId
                );

                const roomsWithUnreadCount = filteredRooms.map((room: ChatRoom) => ({
                    ...room,
                    unreadCount: room.unreadCount !== undefined ? room.unreadCount : 0
                }));

                setChatRooms(sortChatRoomsByLastMessageTime(roomsWithUnreadCount));
            } else {
                console.log("응답 데이터가 없거나 형식이 올바르지 않습니다:", response.data);
                setChatRooms([]);
            }
        } catch (error) {
            console.error("채팅방 목록을 불러오는 중 오류가 발생했습니다:", error);
            setError("채팅방 목록을 불러오는데 실패했습니다.");
            setChatRooms([]);
        } finally {
            setLoading(false);
        }
    }, [loginUserId, sortChatRoomsByLastMessageTime]);

    // 채팅방 입장 처리
    const handleEnterChatRoom = useCallback((room: ChatRoom): void => {
        // 읽음 상태 업데이트
        setChatRooms(prevRooms =>
            prevRooms.map(r => r.id === room.id ? {...r, unreadCount: 0} : r)
        );

        // 이미 열려있는 채팅방인지 확인
        const isAlreadyOpen = openChatRooms.some(openRoom => openRoom.id === room.id);

        if (isAlreadyOpen) {
            // 이미 열려 있는 채팅방만 활성화
            setOpenChatRooms(prev => prev.map(r => ({
                ...r,
                isOpen: r.id === room.id
            })));
        } else {
            // 새 채팅방 추가 및 다른 채팅방 비활성화
            setOpenChatRooms(prev => [
                ...prev.map(r => ({...r, isOpen: false})),
                { ...room, isOpen: true } as OpenChatRoom
            ]);
        }
    }, [openChatRooms]);

    // 채팅방 닫기
    const handleCloseChatRoom = useCallback((roomId: number): void => {
        setOpenChatRooms(prev => prev.filter(room => room.id !== roomId));

        // 채팅방 닫은 후 목록 새로고침
        setTimeout(() => {
            fetchChatRooms();
        }, 100);
    }, [fetchChatRooms]);

    // 채팅방 나가기
    const handleLeaveRoom = useCallback(async (roomId: number, e?: React.MouseEvent): Promise<void> => {
        e?.stopPropagation();

        if (!confirm("정말 채팅방을 나가시겠습니까?")) return;

        try {
            const response = await axios.post(
                `${backUrl}/api/v1/chat/rooms/${roomId}/leave`,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                setChatRooms(prev => prev.filter(room => room.id !== roomId));
                setOpenChatRooms(prev => prev.filter(room => room.id !== roomId));
            } else {
                alert("채팅방 나가기에 실패했습니다.");
            }
        } catch (err) {
            console.error("채팅방 나가기 오류:", err);
            alert("채팅방 나가기 중 오류가 발생했습니다.");
        }
    }, []);

    // SSE 이벤트 핸들러
    const handleSseEvent = useCallback((eventData: SseEventData): void => {
        const eventType = eventData.type || eventData.eventType;

        if (eventType === 'READ_STATUS') {
            const roomId = eventData.chatRoomId || eventData.roomId;
            if (!roomId) return;

            // 읽음 상태 업데이트
            setChatRooms(prevRooms =>
                prevRooms.map(room => room.id === roomId ? {...room, unreadCount: 0} : room)
            );
            return;
        }

        if (['unreadMessages', 'NEW_MESSAGE', 'FIRST_MESSAGE', 'MESSAGE', 'CHAT_UPDATED'].includes(eventType || '')) {
            const isMyMessage = eventData.memberId === loginUserId;
            if (!isMyMessage) {
                // 내가 보낸 메시지가 아닌 경우에만 목록 갱신
                fetchChatRooms().catch(err => {
                    console.error("SSE 이벤트 후 채팅방 목록 갱신 실패:", err);
                });
            }
        }
    }, [fetchChatRooms, loginUserId]);

    // SSE 연결 설정
    useEffect(() => {
        if (!isLoggedIn || !loginUserId) return;

        // SSE 연결 설정 함수
        const setupSSE = () => {
            if (sseRef.current) {
                sseRef.current.close();
                sseRef.current = null;
            }

            try {
                const sseUrl = `${backUrl}/api/v1/sse/connect?userId=${loginUserId}`;
                const eventSource = new EventSource(sseUrl, { withCredentials: true });
                sseRef.current = eventSource;

                eventSource.onopen = () => console.log("SSE 연결 성공");

                eventSource.onmessage = (event) => {
                    try {
                        const eventData = JSON.parse(event.data);
                        handleSseEvent(eventData);
                    } catch (error) {
                        console.error("SSE 메시지 파싱 오류:", error);
                    }
                };

                // 특정 이벤트 타입 핸들러 등록
                ['message', 'new_message', 'read_status'].forEach(eventType => {
                    eventSource.addEventListener(eventType, (event) => {
                        try {
                            const eventData = JSON.parse((event as MessageEvent).data);
                            if (eventType === 'read_status') {
                                eventData.eventType = 'READ_STATUS';
                            }
                            handleSseEvent(eventData);
                        } catch (error) {
                            console.error(`'${eventType}' 이벤트 파싱 오류:`, error);
                        }
                    });
                });

                eventSource.onerror = (error) => {
                    console.error("SSE 연결 오류:", error);
                };
            } catch (error) {
                console.error("SSE 설정 중 오류 발생:", error);
            }
        };

        setupSSE();

        // 컴포넌트 간 통신을 위한 이벤트 리스너 설정
        const checkSSEConnection = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.source === 'contact_button') {
                // SSE 연결 확인 및 재연결
                if (!sseRef.current || sseRef.current.readyState !== EventSource.OPEN) {
                    setupSSE();
                }
                fetchChatRooms();
            }
        };

        const handleChatRoomOpened = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.roomId && customEvent.detail?.isOpen) {
                const { roomId } = customEvent.detail;
                const chatRoom = chatRooms.find(room => room.id === roomId);
                if (chatRoom) {
                    handleEnterChatRoom(chatRoom);
                }
            }
        };

        const handleContactChatOpened = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.roomId) {
                fetchChatRooms();
            }
        };

        window.addEventListener('check_sse_connection', checkSSEConnection);
        window.addEventListener('chat_room_opened', handleChatRoomOpened);
        window.addEventListener('contact_chat_opened', handleContactChatOpened);

        // 클린업 함수
        return () => {
            if (sseRef.current) sseRef.current.close();

            window.removeEventListener('check_sse_connection', checkSSEConnection);
            window.removeEventListener('chat_room_opened', handleChatRoomOpened);
            window.removeEventListener('contact_chat_opened', handleContactChatOpened);
        };
    }, [isLoggedIn, loginUserId, handleSseEvent, fetchChatRooms, chatRooms, handleEnterChatRoom]);

    // WebSocket 연결 설정
    useEffect(() => {
        if (!isLoggedIn || !isChatListOpen) return;

        const stompClient = new StompJs.Client({
            brokerURL: backUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws',
            connectHeaders: {},
            debug: function (str) {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            webSocketFactory: () => {
                const ws = new WebSocket(backUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws');
                ws.onerror = (err) => console.error('WebSocket 에러:', err);
                return ws;
            }
        });

        client.current = stompClient;

        stompClient.onConnect = () => {
            // 새 채팅방 이벤트 구독
            stompClient.subscribe('/topic/api/v1/chat/new-room', (message) => {
                try {
                    const newRoomData = JSON.parse(message.body);

                    if (newRoomData.chatUserId === loginUserId || newRoomData.targetUserId === loginUserId) {
                        setChatRooms(prevRooms => {
                            if (!prevRooms.some(room => room.id === newRoomData.id)) {
                                const newRoom = {
                                    id: newRoomData.id,
                                    chatUserNickname: newRoomData.chatUserNickname,
                                    chatUserImageUrl: newRoomData.chatUserImageUrl || DEFAULT_IMAGE_URL,
                                    chatUserId: newRoomData.chatUserId,
                                    targetUserNickname: newRoomData.targetUserNickname,
                                    targetUserImageUrl: newRoomData.targetUserImageUrl || DEFAULT_IMAGE_URL,
                                    targetUserId: newRoomData.targetUserId,
                                    chatMessages: [],
                                    modifiedDate: new Date().toISOString()
                                } as ChatRoom;

                                return sortChatRoomsByLastMessageTime([...prevRooms, newRoom]);
                            }
                            return prevRooms;
                        });
                    }
                } catch (error) {
                    console.error('새로운 채팅방 데이터 처리 오류:', error);
                }
            });

            // 읽음 상태 이벤트 구독
            stompClient.subscribe('/topic/api/v1/chat/read-status', (message) => {
                try {
                    const readStatusData = JSON.parse(message.body);
                    if (readStatusData.roomId) {
                        setChatRooms(prevRooms => {
                            const roomIndex = prevRooms.findIndex(room => room.id === readStatusData.roomId);
                            if (roomIndex === -1) return prevRooms;

                            const updatedRooms = [...prevRooms];
                            updatedRooms[roomIndex] = {
                                ...updatedRooms[roomIndex],
                                unreadCount: 0
                            };

                            return updatedRooms;
                        });

                        fetchChatRooms();
                    }
                } catch (error) {
                    console.error('읽음 상태 변경 이벤트 처리 오류:', error);
                }
            });

            // 모든 채팅방 메시지 구독
            chatRooms.forEach(room => {
                stompClient.subscribe(`/topic/api/v1/chat/${room.id}/messages`, (message) => {
                    try {
                        const messageData = JSON.parse(message.body);
                        const roomId = room.id;

                        setChatRooms(prevRooms => {
                            const roomIndex = prevRooms.findIndex(r => r.id === roomId);
                            if (roomIndex === -1) return prevRooms;

                            const updatedRooms = prevRooms.map(room => {
                                if (room.id === roomId) {
                                    // 메시지 처리 및 읽지 않은 메시지 수 업데이트
                                    const updatedMessages = room.chatMessages ? [...room.chatMessages] : [];
                                    const isDuplicate = updatedMessages.some(msg => msg.id === messageData.chatMessageId);
                                    const isMessageFromCurrentUser = messageData.memberId === loginUserId;
                                    let unreadCount = room.unreadCount || 0;

                                    // 채팅방이 열려있는지 확인
                                    const isRoomCurrentlyOpen = openChatRooms.some(openRoom =>
                                        openRoom.id === roomId && openRoom.isOpen
                                    );

                                    if (!isDuplicate) {
                                        // 새 메시지 추가
                                        updatedMessages.push({
                                            id: messageData.chatMessageId,
                                            content: messageData.content,
                                            createdDate: messageData.createdDate,
                                            createDate: messageData.createdDate,
                                            memberId: messageData.memberId,
                                            chatUserRead: room.chatUserId === loginUserId ? isMessageFromCurrentUser : true,
                                            targetUserRead: room.targetUserId === loginUserId ? isMessageFromCurrentUser : true
                                        } as ChatMessage);

                                        // 메시지 발신자와 채팅방 상태에 따라 읽지 않은 메시지 수 업데이트
                                        if (!isMessageFromCurrentUser && !isRoomCurrentlyOpen) {
                                            unreadCount += 1;
                                        }
                                    }

                                    return {
                                        ...room,
                                        chatMessages: updatedMessages,
                                        modifiedDate: messageData.createdDate || new Date().toISOString(),
                                        unreadCount: isRoomCurrentlyOpen ? 0 : unreadCount
                                    };
                                }
                                return room;
                            });

                            return sortChatRoomsByLastMessageTime(updatedRooms);
                        });
                    } catch (error) {
                        console.error(`채팅방 ${room.id} 메시지 처리 오류:`, error);
                    }
                });
            });
        };

        stompClient.activate();

        // 클린업 함수
        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, [isLoggedIn, isChatListOpen, chatRooms, loginUserId, openChatRooms, sortChatRoomsByLastMessageTime, fetchChatRooms]);

    // 채팅방 목록 주기적 갱신
    useEffect(() => {
        if (!loginUserId || !isChatListOpen) return;

        const intervalId = setInterval(() => {
            fetchChatRooms().catch(err => {
                console.error("주기적 채팅방 목록 갱신 실패:", err);
            });
        }, 600000); // 10분마다

        return () => clearInterval(intervalId);
    }, [isChatListOpen, loginUserId, fetchChatRooms]);

    // 채팅방 목록 열릴 때 초기 데이터 로드
    useEffect(() => {
        if (isLoggedIn && isChatListOpen) {
            fetchChatRooms();
        }
    }, [isLoggedIn, isChatListOpen, fetchChatRooms]);

    // 유틸리티 함수
    const formatLastMessage = (room: ChatRoom): string => {
        try {
            if (!room.chatMessages || !Array.isArray(room.chatMessages) || room.chatMessages.length === 0) {
                return "새로운 채팅방이 열렸습니다.";
            }

            const sortedMessages = [...room.chatMessages].sort((a, b) => {
                const dateA = a.createDate || a.createdDate || "";
                const dateB = b.createDate || b.createdDate || "";
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

            const lastMessage = sortedMessages[0];
            return lastMessage?.content || "새로운 메시지가 없습니다.";
        } catch (error) {
            return "메시지를 불러올 수 없습니다.";
        }
    };

    const formatTime = (dateString: string): string => {
        if (!dateString) return "";

        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            const hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${minutes}`;
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    };

    const getValidImageUrl = (imageUrl: string | undefined): string => {
        const isKakaoDefaultProfile = (url: string) => {
            return url && url.includes('kakaocdn.net') && url.includes('default_profile');
        };

        if (!imageUrl || imageUrl === "profile" || isKakaoDefaultProfile(imageUrl)) {
            return DEFAULT_IMAGE_URL;
        }
        return imageUrl;
    };

    const getOtherUserInfo = (room: ChatRoom): UserInfo => {
        if (!loginUserId) {
            return {
                nickname: room.targetUserNickname || '사용자',
                imageUrl: getValidImageUrl(room.targetUserImageUrl),
                userId: room.targetUserId
            };
        }

        const isMyChat = Number(loginUserId) === Number(room.chatUserId);

        return {
            nickname: isMyChat ? room.targetUserNickname : room.chatUserNickname,
            imageUrl: getValidImageUrl(isMyChat ? room.targetUserImageUrl : room.chatUserImageUrl),
            userId: isMyChat ? room.targetUserId : room.chatUserId
        };
    };

    return {
        chatRooms,
        openChatRooms,
        loading,
        error,
        isChatListOpen,
        setIsChatListOpen,
        handleEnterChatRoom,
        handleCloseChatRoom,
        handleLeaveRoom,
        fetchChatRooms,
        formatLastMessage,
        formatTime,
        getOtherUserInfo,
        DEFAULT_IMAGE_URL
    };
}