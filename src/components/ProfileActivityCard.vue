<script setup>
defineProps({
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    }
});
</script>

<template>
    <div class="activity-card shadow-sm">
        <div class="d-flex align-items-center">
            <span class="activity-icon">{{ icon }}</span>
            <div>
                <div class="fw-bold text-dark">{{ title }}</div>
                <div class="text-muted small">{{ subtitle }}</div>
            </div>
        </div>
        <span class="fw-bold text-dark fs-5">›</span>
    </div>
</template>

<style scoped>
.activity-card {
    background-color: white;
    border: 1px solid #e0dcd5;
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.activity-card:hover {
    background-color: #fafafa;
    border-color: #dcdcdc;
}

.activity-icon {
    font-size: 26px;
    margin-right: 18px;
    background-color: #f7f4ed;
    width: 45px;
    height: 45px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
