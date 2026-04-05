<script setup>
    import Dashboard_Header from '../components/Dashboard_Header.vue'
    import Sidebar from '../components/Sidebar.vue'
</script>

<template>
    <div class="dashboard">
        <Dashboard_Header />
        <Sidebar />
    </div>
</template>

<style scoped>
    .dashboard {
        background-color: #f0f0f0;
        width: 100%;
        min-height: 100vh;
    }
</style>