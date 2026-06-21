<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const route = useRoute();
const router = useRouter();
const { user, getAccessTokenSilently } = useAuth0();

const partnerId = route.params.id;
const partnerName = ref(route.query.name || 'Chat');
const messages = ref([]);
const newMessage = ref('');
const isLoading = ref(true);
const chatContainer = ref(null);

const showDeleteModal = ref(false);
const messageToDelete = ref(null);
let pollingInterval = null;

onMounted(async () => {
    await loadMessages();
    await markAsRead();
    scrollToBottom();

    pollingInterval = setInterval(async () => {
        await loadMessages(false);
        await markAsRead();
    }, 3000);
});

onUnmounted(() => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});

async function loadMessages(showLoadingState = true) {
    if (showLoadingState) isLoading.value = true;
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:8081/api/messages', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const allMessages = await response.json();
            const myId = user.value.sub;

            const relevantMessages = allMessages.filter(m =>
                (m.senderOauthId === myId && m.receiverOauthId === partnerId) ||
                (m.senderOauthId === partnerId && m.receiverOauthId === myId)
            );

            if (relevantMessages.length > messages.value.length) {
                messages.value = relevantMessages;
                scrollToBottom();
            } else {
                messages.value = relevantMessages;
            }

            if (!route.query.name && messages.value.length > 0) {
                const partnerMsg = messages.value.find(m => m.senderOauthId === partnerId);
                if (partnerMsg) partnerName.value = partnerMsg.senderName;
            }
        }
    } catch (e) {
    } finally {
        if (showLoadingState) isLoading.value = false;
    }
}

async function markAsRead() {
    try {
        const token = await getAccessTokenSilently();
        await fetch(`http://localhost:8081/api/messages/${partnerId}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (e) {
    }
}

async function sendMessage() {
    if (!newMessage.value.trim()) return;

    try {
        const token = await getAccessTokenSilently();
        const payload = {
            receiverOauthId: partnerId,
            receiverName: partnerName.value,
            content: newMessage.value.trim()
        };

        const response = await fetch('http://localhost:8081/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const savedMsg = await response.json();
            messages.value.push(savedMsg);
            newMessage.value = '';
            scrollToBottom();
        }
    } catch (e) {
    }
}

function confirmDelete(msg) {
    if (msg.senderOauthId === user.value.sub) {
        messageToDelete.value = msg;
        showDeleteModal.value = true;
    }
}

async function executeDelete() {
    if (!messageToDelete.value) return;

    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`http://localhost:8081/api/messages/${messageToDelete.value.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            messages.value = messages.value.filter(m => m.id !== messageToDelete.value.id);
            showDeleteModal.value = false;
            messageToDelete.value = null;
        }
    } catch (e) {
    }
}

function getInitials(name) {
    if (!name || name === 'Chat') return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function formatChatTime(dateStr) {
    if (!dateStr) return '';
    let d;
    if (Array.isArray(dateStr)) {
        d = new Date(dateStr[0], dateStr[1] - 1, dateStr[2], dateStr[3] || 0, dateStr[4] || 0);
    } else {
        d = new Date(dateStr);
    }

    if (isNaN(d)) return '';
    const day = d.toLocaleDateString('de-DE', { weekday: 'short' });
    const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
}

function scrollToBottom() {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    });
}
</script>

<template>
    <div class="chat-fullscreen-overlay">
        <div class="chat-container">

            <div class="chat-header">
                <button @click="router.back()" class="btn-back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-chevron-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                    </svg>
                </button>

                <router-link :to="`/user/${partnerId}`"
                    class="text-decoration-none d-flex align-items-center profile-link">
                    <div class="avatar-circle text-dark">{{ getInitials(partnerName) }}</div>
                    <h1 class="chat-title text-dark hover-underline">{{ partnerName }}</h1>
                </router-link>
            </div>

            <div class="chat-body" ref="chatContainer">
                <div v-if="isLoading" class="text-center py-4">
                    <div class="spinner-border text-warning" role="status"></div>
                </div>

                <div v-else-if="messages.length === 0" class="text-center py-5 text-muted">
                    Noch keine Nachrichten. Schreib die erste!
                </div>

                <template v-else>
                    <div v-for="msg in messages" :key="msg.id" class="message-bubble"
                        :class="msg.senderOauthId === user?.sub ? 'sent' : 'received'" @click="confirmDelete(msg)">
                        <p class="message-text">{{ msg.content }}</p>
                        <div class="time-label">{{ formatChatTime(msg.timestamp) }}</div>
                    </div>
                </template>
            </div>

            <div class="chat-footer">
                <form @submit.prevent="sendMessage" class="chat-input-wrapper">
                    <input v-model="newMessage" type="text" class="chat-input" placeholder="Nachricht schreiben...">
                    <button type="submit" class="btn-send" :disabled="!newMessage.trim()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                            class="bi bi-send-fill" viewBox="0 0 16 16">
                            <path
                                d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>

        <div v-if="showDeleteModal" class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-center">
                <h3 class="fw-bold text-dark mb-4 fs-4">Möchtest du die Nachricht löschen?</h3>
                <div class="d-flex flex-column gap-3">
                    <button @click="executeDelete" class="btn-modal-red">Nachricht löschen</button>
                    <button @click="showDeleteModal = false" class="btn-modal-outline">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background-color: #f7f4ed;
    z-index: 9999;
    display: flex;
    justify-content: center;
}

.chat-container {
    width: 100%;
    max-width: 800px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f7f4ed;
}

.chat-header {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #e0dcd5;
}

.btn-back {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #e0dcd5;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 15px;
}

.avatar-circle {
    width: 42px;
    height: 42px;
    background-color: #dcdcdc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #424242;
    margin-right: 15px;
}

.chat-title {
    font-size: 20px;
    font-weight: bold;
    color: #333333;
    margin: 0;
}

.chat-body {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message-bubble {
    max-width: 75%;
    padding: 10px 14px;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: column;
}

.message-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.4;
    color: #ffffff;
}

.time-label {
    font-size: 11px;
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.7);
    align-self: flex-end;
}

.sent {
    align-self: flex-end;
    background-color: #3f434a;
    border-bottom-right-radius: 2px;
}

.received {
    align-self: flex-start;
    background-color: #86868b;
    border-top-left-radius: 2px;
}

.chat-footer {
    padding: 15px 20px 20px 20px;
}

.chat-input-wrapper {
    display: flex;
    border: 1px solid #111827;
    border-radius: 4px;
    background-color: #ffffff;
    overflow: hidden;
}

.chat-input {
    border: none;
    flex-grow: 1;
    padding: 12px 16px;
    font-size: 15px;
    outline: none;
}

.btn-send {
    background-color: #ffffff;
    border: none;
    border-left: 1px solid #111827;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(247, 244, 237, 0.85);
    z-index: 10000;
    backdrop-filter: blur(3px);
}

.custom-modal {
    border: 1px solid #e0dcd5;
    width: 90%;
    max-width: 400px;
}

.btn-modal-red {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: #dc3545;
    color: white;
    font-weight: bold;
    font-size: 16px;
    border: none;
}

.btn-modal-outline {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: transparent;
    border: 1px solid #424242;
    color: #111827;
    font-weight: bold;
    font-size: 16px;
}

.profile-link {
    transition: opacity 0.2s ease;
}

.profile-link:hover {
    opacity: 0.85;
}

.hover-underline {
    position: relative;
    display: inline-block;
}

.profile-link:hover .hover-underline::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #111827;
}
</style>
