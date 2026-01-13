// Calendar System - Complete Implementation

class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.view = 'month'; // month, week, day, list
        this.events = [];
        this.currentEvent = null;
        
        this.categoryColors = {
            work: '#3b82f6',
            personal: '#10b981',
            health: '#ef4444',
            finance: '#f59e0b',
            study: '#8b5cf6',
            social: '#ec4899',
            campaign: '#dc2626',
            optimization: '#ea580c',
            other: '#6b7280'
        };
        
        this.init();
    }
    
    init() {
        this.loadEvents();
        this.loadCampaignOptimizationEvents(); // Carregar eventos de campanhas
        this.render();
        this.renderUpcomingEvents();
        this.checkReminders();
        
        // Check reminders every minute
        setInterval(() => this.checkReminders(), 60000);
        
        // Check campaign alerts every 30 minutes
        setInterval(() => this.checkCampaignAlerts(), 30 * 60 * 1000);
    }
    
    // Navigation
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }
    
    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
    }
    
    changeView(view) {
        this.view = view;
        document.querySelectorAll('.calendar-view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        this.render();
    }
    
    // Rendering
    render() {
        this.updateMonthYear();
        
        switch (this.view) {
            case 'month':
                this.renderMonthView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'day':
                this.renderDayView();
                break;
            case 'list':
                this.renderListView();
                break;
        }
    }
    
    updateMonthYear() {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const month = months[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        document.getElementById('calendarMonthYear').textContent = `${month} ${year}`;
    }
    
    renderMonthView() {
        const container = document.getElementById('calendarView');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        let html = '<div class="calendar-month">';
        
        // Weekday headers
        html += '<div class="calendar-weekdays">';
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });
        html += '</div>';
        
        // Days grid
        html += '<div class="calendar-days">';
        
        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = this.getEventsForDate(date);
            const isToday = this.isToday(date);
            const isSelected = this.isSameDay(date, this.selectedDate);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                     onclick="calendar.selectDate(new Date(${year}, ${month}, ${day}))">
                    <div class="day-number">${day}</div>
                    <div class="day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="day-event" 
                                 style="background: ${event.color}; color: white;"
                                 onclick="event.stopPropagation(); calendar.editEvent(${event.id})"
                                 title="${event.title}">
                                ${event.title}
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div class="day-event-more">+${dayEvents.length - 3} mais</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        html += '</div></div>';
        container.innerHTML = html;
    }
    
    renderWeekView() {
        const container = document.getElementById('calendarView');
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        
        let html = '<div class="calendar-week"><div class="week-header">Semana de ' + 
                   startOfWeek.toLocaleDateString('pt-BR') + '</div>';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            const dayEvents = this.getEventsForDate(date);
            
            html += `
                <div class="week-day">
                    <div class="week-day-header">${date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}</div>
                    <div class="week-day-events">
                        ${dayEvents.map(event => this.renderEventCard(event)).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderDayView() {
        const container = document.getElementById('calendarView');
        const events = this.getEventsForDate(this.selectedDate);
        
        let html = `
            <div class="calendar-day-view">
                <div class="day-view-header">
                    <h3>${this.selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                </div>
                <div class="day-view-events">
        `;
        
        if (events.length === 0) {
            html += '<div class="empty-day">📅 Nenhum evento agendado para este dia</div>';
        } else {
            events.sort((a, b) => new Date(a.start) - new Date(b.start));
            events.forEach(event => {
                html += this.renderEventCard(event, true);
            });
        }
        
        html += '</div></div>';
        container.innerHTML = html;
    }
    
    renderListView() {
        const container = document.getElementById('calendarView');
        const futureEvents = this.events
            .filter(e => new Date(e.start) >= new Date())
            .sort((a, b) => new Date(a.start) - new Date(b.start));
        
        let html = '<div class="calendar-list-view"><h3>📋 Próximos Eventos</h3>';
        
        if (futureEvents.length === 0) {
            html += '<div class="empty-list">Nenhum evento futuro agendado</div>';
        } else {
            futureEvents.forEach(event => {
                html += this.renderEventCard(event, true);
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderEventCard(event, detailed = false) {
        const start = new Date(event.start);
        const categoryIcon = {
            work: '💼', personal: '🏠', health: '🏥', 
            finance: '💰', study: '📚', social: '👥', other: '📌'
        }[event.category] || '📌';
        
        return `
            <div class="event-card" style="border-left: 4px solid ${event.color}"
                 onclick="calendar.editEvent(${event.id})">
                <div class="event-card-time">
                    ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div class="event-card-content">
                    <div class="event-card-title">${categoryIcon} ${event.title}</div>
                    ${detailed && event.description ? `<div class="event-card-description">${event.description}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    renderUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = this.events
            .filter(e => new Date(e.start) >= today)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5);
        
        if (upcoming.length === 0) {
            container.innerHTML = '<div class="empty-upcoming">Nenhum evento próximo</div>';
            return;
        }
        
        container.innerHTML = upcoming.map(event => {
            const start = new Date(event.start);
            const daysDiff = Math.floor((start - today) / (1000 * 60 * 60 * 24));
            let timeText = '';
            
            if (daysDiff === 0) timeText = 'Hoje';
            else if (daysDiff === 1) timeText = 'Amanhã';
            else timeText = `Em ${daysDiff} dias`;
            
            return `
                <div class="upcoming-event" onclick="calendar.editEvent(${event.id})">
                    <div class="upcoming-event-date">${timeText}</div>
                    <div class="upcoming-event-title">${event.title}</div>
                    <div class="upcoming-event-time">
                        ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Event Management
    selectDate(date) {
        this.selectedDate = date;
        this.render();
    }
    
    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.start);
            return this.isSameDay(eventDate, date);
        });
    }
    
    addEvent(eventData) {
        const event = {
            id: Date.now(),
            ...eventData,
            created: new Date().toISOString()
        };
        
        this.events.push(event);
        this.saveEvents();
        this.render();
        this.renderUpcomingEvents();
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('success', 'Evento criado!', event.title);
        }
        
        return event;
    }
    
    updateEvent(id, eventData) {
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...eventData };
            this.saveEvents();
            this.render();
            this.renderUpcomingEvents();
            
            if (window.addNotification) {
                window.addNotification('success', 'Evento atualizado!', eventData.title);
            }
        }
    }
    
    deleteEvent(id) {
        const event = this.events.find(e => e.id === id);
        if (event && confirm(`Deseja realmente deletar "${event.title}"?`)) {
            this.events = this.events.filter(e => e.id !== id);
            this.saveEvents();
            this.render();
            this.renderUpcomingEvents();
            
            if (window.addNotification) {
                window.addNotification('info', 'Evento deletado', event.title);
            }
        }
    }
    
    editEvent(id) {
        const event = this.events.find(e => e.id === id);
        if (event) {
            this.currentEvent = event;
            openEditEventModal(event);
        }
    }
    
    // Reminders
    checkReminders() {
        const now = new Date();
        
        this.events.forEach(event => {
            const eventTime = new Date(event.start);
            const reminderTime = new Date(eventTime.getTime() - (event.reminder * 60000));
            
            // Check if reminder should fire (within last minute)
            if (reminderTime <= now && reminderTime > new Date(now.getTime() - 60000)) {
                if (!event.reminderFired) {
                    this.fireReminder(event);
                    event.reminderFired = true;
                    this.saveEvents();
                }
            }
        });
    }
    
    fireReminder(event) {
        const start = new Date(event.start);
        const timeStr = start.toLocaleString('pt-BR');
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`📅 Lembrete: ${event.title}`, {
                body: `${timeStr}\n${event.description || ''}`,
                icon: '/favicon-96x96.png'
            });
        }
        
        // System notification
        if (window.addNotification) {
            window.addNotification('warning', `Lembrete: ${event.title}`, timeStr);
        }
        
        // Sound (optional)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCOLzvDekVQQEFmo4e2jWBICE=');
        audio.play().catch(() => {});
    }
    
    // Utilities
    isToday(date) {
        const today = new Date();
        return this.isSameDay(date, today);
    }
    
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }
    
    // Persistence
    saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        
        // Save to backend
        fetch('/api/calendar/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: this.events })
        }).catch(err => console.log('Offline save:', err));
    }
    
    loadEvents() {
        const saved = localStorage.getItem('calendarEvents');
        if (saved) {
            this.events = JSON.parse(saved);
        }
        
        // Load from backend
        fetch('/api/calendar/load')
            .then(res => res.json())
            .then(data => {
                if (data.events) {
                    this.events = data.events;
                    this.render();
                    this.renderUpcomingEvents();
                }
            })
            .catch(() => {});
    }

    // ==================== FUNCIONALIDADES DE CAMPANHAS ====================

    // Carregar campanhas e criar eventos de otimização
    async loadCampaignOptimizationEvents() {
        try {
            const response = await fetch(`${window.API_BASE || '/api'}/campanhas`);
            if (!response.ok) return;

            const data = await response.json();
            if (!data.success) return;

            // Criar eventos de otimização para cada campanha
            data.campanhas.forEach(campanha => {
                this.createOptimizationEvents(campanha);
            });

            this.render();
        } catch (error) {
            console.error('Erro ao carregar eventos de otimização:', error);
        }
    }

    // Criar eventos de otimização para uma campanha
    createOptimizationEvents(campanha) {
        const dataInicio = new Date(campanha.dataInicio);
        const dataFim = new Date(campanha.dataFim);
        const hoje = new Date();

        // Otimização semanal (a cada 7 dias)
        let currentDate = new Date(dataInicio);
        while (currentDate <= dataFim && currentDate >= hoje) {
            const optimizationEvent = {
                id: `opt-${campanha._id}-${currentDate.toISOString().split('T')[0]}`,
                title: `🚀 Otimizar: ${campanha.nome}`,
                description: `Otimização semanal da campanha ${campanha.nome}. Verificar performance, ajustar lances e segmentação.`,
                start: currentDate.toISOString(),
                end: null,
                category: 'optimization',
                reminder: 1440, // 24 horas antes
                allDay: true,
                color: this.categoryColors.optimization,
                campaignId: campanha._id,
                campaignName: campanha.nome,
                type: 'campaign-optimization',
                reminderFired: false
            };

            // Verificar se o evento já existe
            const existingEvent = this.events.find(e => e.id === optimizationEvent.id);
            if (!existingEvent) {
                this.events.push(optimizationEvent);
            }

            currentDate.setDate(currentDate.getDate() + 7);
        }

        // Otimização de emergência se ROAS estiver baixo
        if (campanha.roas && campanha.roasAlvo && campanha.roas < campanha.roasAlvo * 0.7) {
            const emergencyEvent = {
                id: `emergency-${campanha._id}`,
                title: `🚨 EMERGÊNCIA: ${campanha.nome} - ROAS Crítico!`,
                description: `ROAS atual (${campanha.roas.toFixed(2)}) está 30% abaixo do alvo (${campanha.roasAlvo.toFixed(2)}). Otimização imediata necessária!`,
                start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
                end: null,
                category: 'campaign',
                reminder: 60, // 1 hora antes
                allDay: false,
                color: this.categoryColors.campaign,
                campaignId: campanha._id,
                campaignName: campanha.nome,
                type: 'campaign-emergency',
                reminderFired: false
            };

            const existingEmergency = this.events.find(e => e.id === emergencyEvent.id);
            if (!existingEmergency) {
                this.events.push(emergencyEvent);
            }
        }

        // Otimização final (3 dias antes do fim)
        const finalOptimizationDate = new Date(dataFim);
        finalOptimizationDate.setDate(finalOptimizationDate.getDate() - 3);

        if (finalOptimizationDate >= hoje) {
            const finalEvent = {
                id: `final-${campanha._id}`,
                title: `🎯 Otimização Final: ${campanha.nome}`,
                description: `Campanha termina em 3 dias. Fazer otimização final e planejamento para próxima campanha.`,
                start: finalOptimizationDate.toISOString(),
                end: null,
                category: 'campaign',
                reminder: 1440, // 24 horas antes
                allDay: true,
                color: this.categoryColors.campaign,
                campaignId: campanha._id,
                campaignName: campanha.nome,
                type: 'campaign-final',
                reminderFired: false
            };

            const existingFinal = this.events.find(e => e.id === finalEvent.id);
            if (!existingFinal) {
                this.events.push(finalEvent);
            }
        }

        this.saveEvents();
    }

    // Verificar campanhas que precisam de otimização imediata
    checkCampaignAlerts() {
        // Esta função será chamada periodicamente para verificar alertas
        this.loadCampaignOptimizationEvents();
    }
}

// Modal Functions
function openNewEventModal() {
    document.getElementById('eventModalTitle').textContent = '➕ Novo Evento';
    document.getElementById('eventId').value = '';
    document.getElementById('eventForm').reset();
    document.getElementById('deleteEventBtn').style.display = 'none';
    
    // Set default date to selected date
    const date = calendar.selectedDate.toISOString().split('T')[0];
    document.getElementById('eventStartDate').value = date;
    document.getElementById('eventEndDate').value = date;
    
    // Set default color
    document.getElementById('eventColor').value = '#3b82f6';
    
    document.getElementById('eventModal').classList.add('show');
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function openEditEventModal(event) {
    document.getElementById('eventModalTitle').textContent = '✏️ Editar Evento';
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDescription').value = event.description || '';
    
    const start = new Date(event.start);
    document.getElementById('eventStartDate').value = start.toISOString().split('T')[0];
    document.getElementById('eventStartTime').value = start.toTimeString().slice(0, 5);
    
    if (event.end) {
        const end = new Date(event.end);
        document.getElementById('eventEndDate').value = end.toISOString().split('T')[0];
        document.getElementById('eventEndTime').value = end.toTimeString().slice(0, 5);
    }
    
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventReminder').value = event.reminder;
    document.getElementById('eventAllDay').checked = event.allDay || false;
    document.getElementById('eventColor').value = event.color;
    document.getElementById('deleteEventBtn').style.display = 'block';
    
    document.getElementById('eventModal').classList.add('show');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('show');
    calendar.currentEvent = null;
}

function saveEvent() {
    const form = document.getElementById('eventForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const eventId = document.getElementById('eventId').value;
    const startDate = document.getElementById('eventStartDate').value;
    const startTime = document.getElementById('eventStartTime').value;
    const endDate = document.getElementById('eventEndDate').value;
    const endTime = document.getElementById('eventEndTime').value;
    
    const eventData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        start: `${startDate}T${startTime}:00`,
        end: endDate && endTime ? `${endDate}T${endTime}:00` : null,
        category: document.getElementById('eventCategory').value,
        reminder: parseInt(document.getElementById('eventReminder').value),
        allDay: document.getElementById('eventAllDay').checked,
        color: document.getElementById('eventColor').value,
        reminderFired: false
    };
    
    if (eventId) {
        calendar.updateEvent(parseInt(eventId), eventData);
    } else {
        calendar.addEvent(eventData);
    }
    
    closeEventModal();
}

function deleteEvent() {
    const eventId = document.getElementById('eventId').value;
    if (eventId) {
        calendar.deleteEvent(parseInt(eventId));
        closeEventModal();
    }
}

// Initialize calendar
let calendar;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendarView')) {
        calendar = new Calendar();
    }
});
