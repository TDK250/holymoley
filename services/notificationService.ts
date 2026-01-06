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
        time: string,
        occurrence: number = 0
    ) {
        try {
            await this.cancelAll();

            const [hour, minute] = time.split(':').map(Number);

            const notification = {
                title: "Time for a Skin Check",
                body: "Keep Track-A-Mole updated by checking your moles today.",
                id: 1,
                schedule: {} as any,
                smallIcon: 'ic_notification',
                sound: undefined,
                attachments: undefined,
                actionTypeId: "",
                extra: null
            };

            if (unit === 'days') {
                notification.schedule = {
                    at: this.getNextDateForDays(value, hour, minute),
                    repeats: value === 1,
                    every: value === 1 ? 'day' : undefined
                };
            } else if (unit === 'weeks') {
                notification.schedule = {
                    on: { weekday: target + 1, hour, minute },
                    every: value === 1 ? 'week' : (value === 2 ? 'two-weeks' : undefined)
                };
                if (!notification.schedule.every) {
                    notification.schedule.at = this.getNextDateForWeeks(value, target, hour, minute);
                }
            } else if (unit === 'months') {
                notification.schedule = {
                    at: this.getNextDateForOccurrenceMonths(value, occurrence, target, hour, minute)
                };
            }

            await LocalNotifications.schedule({
                notifications: [notification]
            });
        } catch (error) {
            console.error('Failed to schedule notification:', error);
            throw error;
        }
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

    getNextDateForOccurrenceMonths(interval: number, occurrence: number, dayOfWeek: number, hour: number, minute: number): Date {
        const now = new Date();
        let targetMonth = now.getMonth();
        let targetYear = now.getFullYear();

        const calculateDate = (y: number, m: number) => {
            const firstDayOfMonth = new Date(y, m, 1);
            let day = (dayOfWeek - firstDayOfMonth.getDay() + 7) % 7;
            let date: number;

            if (occurrence === 4) { // Last occurrence
                const lastDayOfMonth = new Date(y, m + 1, 0);
                // lastDayOfMonth's day - dayOfWeek
                let diff = lastDayOfMonth.getDay() - dayOfWeek;
                if (diff < 0) diff += 7;
                date = lastDayOfMonth.getDate() - diff;
            } else {
                date = 1 + day + (occurrence * 7);
                // Check if date exceeded month
                if (date > new Date(y, m + 1, 0).getDate()) {
                    date -= 7; // Fallback to 4th if 5th doesn't exist
                }
            }
            return new Date(y, m, date, hour, minute, 0, 0);
        };

        let next = calculateDate(targetYear, targetMonth);
        if (next <= now) {
            targetMonth += interval;
            if (targetMonth > 11) {
                targetYear += Math.floor(targetMonth / 12);
                targetMonth %= 12;
            }
            next = calculateDate(targetYear, targetMonth);
        }
        return next;
    }
};
