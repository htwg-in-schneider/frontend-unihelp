<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const router = useRouter();
const { user, getAccessTokenSilently } = useAuth0();

const searchQuery = ref('');
const conversations = ref([]);
const isLoading = ref(true);

onMounted(async () => {
    await loadMessages();
});

function parseSpringDate(dateInput) {
    if (!dateInput) return new Date();
    if (Array.isArray(dateInput)) {
        return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
    }
    return new Date(dateInput);
}

async function loadMessages() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const allMessages = await response.json();
            const grouped = {};
            const myId = user.value.sub;

            allMessages.forEach(msg => {
                const isMeSender = msg.senderOauthId === myId;
                const partnerId = isMeSender ? msg.receiverOauthId : msg.senderOauthId;
                const partnerName = isMeSender ? msg.receiverName : msg.senderName;

                if (!grouped[partnerId]) {
                    grouped[partnerId] = {
                        partnerId,
                        partnerName: partnerName || 'Unbekannt',
                        initials: getInitials(partnerName),
                        lastMessage: msg.content,
                        timestamp: msg.timestamp,
                        unreadCount: 0
                    };
                } else {
                    const msgDate = parseSpringDate(msg.timestamp);
                    const existingDate = parseSpringDate(grouped[partnerId].timestamp);
                    if (msgDate > existingDate) {
                        grouped[partnerId].lastMessage = msg.content;
                        grouped[partnerId].timestamp = msg.timestamp;
                    }
                }

                if (!isMeSender && !msg.read) {
                    grouped[partnerId].unreadCount++;
                }
            });

            conversations.value = Object.values(grouped).sort((a, b) => parseSpringDate(b.timestamp) - parseSpringDate(a.timestamp));
        }
    } catch (e) {
    } finally {
        isLoading.value = false;
    }
}

function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = parseSpringDate(dateStr);
    if (isNaN(d)) return '';

    const today = new Date();

    if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    const diffTime = Math.abs(today - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
        return d.toLocaleDateString('de-DE', { weekday: 'short' }) + '.';
    }
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const filteredConversations = computed(() => {
    if (!searchQuery.value) return conversations.value;
    const lowerQuery = searchQuery.value.toLowerCase();
    return conversations.value.filter(c => c.partnerName.toLowerCase().includes(lowerQuery));
});

function openChat(partnerId, partnerName) {
    router.push({ path: `/chat/${partnerId}`, query: { name: partnerName } });
}
</script>

<template>
    <div class="messages-wrapper">
        <div class="container content-wrapper-desktop py-4">

            <div class="desktop-card mobile-card bg-white position-relative">

                <div class="search-container mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888"
                        class="bi bi-search search-icon" viewBox="0 0 16 16">
                        <path
                            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                    <input v-model="searchQuery" type="text" class="form-control search-input" placeholder="Suchen...">
                </div>

                <div v-if="isLoading" class="text-center py-5">
                    <div class="spinner-border text-warning" role="status"></div>
                </div>

                <div v-else-if="filteredConversations.length === 0" class="text-center py-5 text-muted">
                    Keine Nachrichten gefunden.
                </div>

                <div v-else class="conversation-list">
                    <div v-for="conv in filteredConversations" :key="conv.partnerId"
                        @click="openChat(conv.partnerId, conv.partnerName)"
                        class="conversation-item d-flex align-items-center py-3">
                        <div class="avatar-circle me-3">{{ conv.initials }}</div>
                        <div class="flex-grow-1 min-w-0">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h3 class="h6 fw-bold mb-0 text-dark text-truncate">{{ conv.partnerName }}</h3>
                                <span class="time-text">{{ formatTime(conv.timestamp) }}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <p class="mb-0 text-muted text-truncate small pe-2">{{ conv.lastMessage }}</p>
                                <span v-if="conv.unreadCount > 0" class="badge unread-badge rounded-pill">{{
                                    conv.unreadCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.messages-wrapper {
    background-color: #f7f4ed;
    min-height: 100vh;
    padding-bottom: 80px;
}

.content-wrapper-desktop {
    margin: 0 auto;
    max-width: 600px;
}

.search-container {
    position: relative;
}

.search-input {
    padding-left: 40px;
    border-radius: 20px;
    border: 1px solid #dcdcdc;
    height: 40px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
}

.conversation-item {
    border-bottom: 1px solid #e0dcd5;
    cursor: pointer;
    transition: background-color 0.2s;
}

.conversation-item:hover {
    background-color: #f8f9fa;
}

.conversation-item:last-child {
    border-bottom: none;
}

.avatar-circle {
    width: 50px;
    height: 50px;
    background-color: #e0e0e0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: #333;
    flex-shrink: 0;
}

.time-text {
    font-size: 13px;
    color: #333;
}

.unread-badge {
    background-color: #e32828;
    font-size: 12px;
    padding: 4px 8px;
}

.min-w-0 {
    min-width: 0;
}

@media (min-width: 768px) {
    .messages-wrapper {
        padding-top: 40px;
    }

    .desktop-card {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
}
</style>
