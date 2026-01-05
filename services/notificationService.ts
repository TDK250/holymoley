import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
    async requestPermissions() {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
    },

    async checkPermissions() {
        const status = await LocalNotifications.checkPermissions();
        return status.display === 'granted';
    },

    async cancelAll() {
        const notifications = await LocalNotifications.getPending();
        if (notifications.notifications.length > 0) {
            await LocalNotifications.cancel(notifications);
        }
    },

    async scheduleReminder(
        value: number,
        unit: 'days' | 'weeks' | 'months',
        target: number,
        time: string
    ) {
        await this.cancelAll();

        const [hour, minute] = time.split(':').map(Number);

        // Base notification details
        const notification = {
            title: "Time for a Skin Check",
            body: "Keep Track-A-Mole updated by checking your moles today.",
            id: 1,
            smallIcon: 'ic_stat_name', // Needs to be configured in Android
            schedule: {} as any,
        };

        // Simplistic scheduling for now. 
        // For 'Every X Weeks/Months' where X > 1, Capacitor's repeating logic is limited.
        // We will schedule the immediate next occurrence and subsequent ones if possible.

        if (unit === 'days') {
            // Every X Days
            notification.schedule = {
                at: this.getNextDateForDays(value, hour, minute),
                repeats: value === 1, // Only native repeat if daily
                every: value === 1 ? 'day' : undefined
            };
        } else if (unit === 'weeks') {
            // Every X Weeks on target (0-6)
            notification.schedule = {
                on: { weekday: target + 1, hour, minute }, // Capacitor weekday is 1-7
                every: value === 1 ? 'week' : (value === 2 ? 'two-weeks' : undefined)
            };
            if (!notification.schedule.every) {
                notification.schedule.at = this.getNextDateForWeeks(value, target, hour, minute);
            }
        } else if (unit === 'months') {
            // Every X Months on target day of month (1-31)
            notification.schedule = {
                on: { day: target, hour, minute },
                every: value === 1 ? 'month' : undefined
            };
            if (!notification.schedule.every) {
                notification.schedule.at = this.getNextDateForMonths(value, target, hour, minute);
            }
        }

        await LocalNotifications.schedule({
            notifications: [notification]
        });
    },

    getNextDateForDays(value: number, hour: number, minute: number): Date {
        const now = new Date();
        const next = new Date();
        next.setHours(hour, minute, 0, 0);
        if (next <= now) {
            next.setDate(next.getDate() + value);
        } else if (value > 1) {
            // It's later today, but if interval > 1, do we wait? 
            // Usually "Every 2 days" means starting from now + 2.
            // But if it's currently 8am and scheduled for 9am, we keep it today.
        }
        return next;
    },

    getNextDateForWeeks(value: number, target: number, hour: number, minute: number): Date {
        const now = new Date();
        const next = new Date();
        next.setHours(hour, minute, 0, 0);

        let daysUntil = (target - now.getDay() + 7) % 7;
        if (daysUntil === 0 && next <= now) {
            daysUntil = 7 * value;
        } else if (daysUntil === 0) {
            // Keep today
        } else {
            // Add daysUntil and then if value > 1? 
            // Logic: find the very next target day.
        }
        next.setDate(now.getDate() + daysUntil);
        return next;
    },

    getNextDateForMonths(value: number, target: number, hour: number, minute: number): Date {
        const now = new Date();
        const next = new Date();
        next.setFullYear(now.getFullYear(), now.getMonth(), target);
        next.setHours(hour, minute, 0, 0);

        if (next <= now) {
            next.setMonth(next.getMonth() + value);
        }
        return next;
    }
};
