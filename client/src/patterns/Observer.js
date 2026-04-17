/**
 * OBSERVER PATTERN - Notification System
 * Allows multiple observers (subscriptions) to listen to application events
 * (Carousel changes, Cart updates, Discounts applied, Orders placed, etc.)
 */

/**
 * Notification Types
 */
export const NotificationType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

/**
 * Event Types
 */
export const EventType = {
    // Carousel Events
    CAROUSEL_CHANGED: 'carousel:changed',
    CAROUSEL_AUTO_ADVANCE: 'carousel:auto-advance',

    // Product Events
    PRODUCT_VIEWED: 'product:viewed',
    PRODUCT_ADDED_TO_CART: 'product:added-to-cart',

    // Cart Events
    CART_UPDATED: 'cart:updated',
    CART_CLEARED: 'cart:cleared',

    // Discount Events
    DISCOUNT_APPLIED: 'discount:applied',
    DISCOUNT_REMOVED: 'discount:removed',
    DISCOUNT_CODE_INVALID: 'discount:code-invalid',

    // User Events
    USER_LOGGED_IN: 'user:logged-in',
    USER_LOGGED_OUT: 'user:logged-out',

    // Order Events
    ORDER_CREATED: 'order:created',
    ORDER_COMPLETED: 'order:completed',
    ORDER_FAILED: 'order:failed',

    // Search Events
    SEARCH_PERFORMED: 'search:performed',

    // Notification Events
    NOTIFICATION_SHOWN: 'notification:shown',
};

/**
 * Observer Interface - Each observer must implement this
 */
class Observer {
    update(eventData) {
        throw new Error('update() method must be implemented');
    }
}

/**
 * Subject (Observable) - Manages observers and notifies them
 */
class NotificationSubject {
    constructor() {
        this.observers = {};
        this.eventHistory = [];
        this.maxHistorySize = 50;
    }

    /**
     * Subscribe an observer to a specific event
     * @param {string} eventType - Type of event to listen for
     * @param {Observer} observer - Observer instance
     * @param {string} observerId - Unique identifier for the observer
     */
    subscribe(eventType, observer, observerId = null) {
        if (!this.observers[eventType]) {
            this.observers[eventType] = [];
        }

        const id = observerId || `observer_${Date.now()}_${Math.random()}`;

        this.observers[eventType].push({
            id,
            observer,
        });

        // DEBUG: console.log(`✓ Observer subscribed to "${eventType}"`);
        return id;
    }

    /**
     * Unsubscribe an observer from a specific event
     */
    unsubscribe(eventType, observerId) {
        if (!this.observers[eventType]) return false;

        const initialLength = this.observers[eventType].length;
        this.observers[eventType] = this.observers[eventType].filter(
            (item) => item.id !== observerId
        );

        if (this.observers[eventType].length < initialLength) {
            // DEBUG: console.log(`✓ Observer unsubscribed from "${eventType}"`);
            return true;
        }
        return false;
    }

    /**
     * Notify all observers of a specific event
     * @param {string} eventType - Type of event
     * @param {object} eventData - Data to pass to observers
     */
    notify(eventType, eventData = {}) {
        const timestamp = new Date().toISOString();
        const event = {
            type: eventType,
            data: eventData,
            timestamp,
        };

        // Store in history (regardless of observers)
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        // Notify all observers if any exist
        if (!this.observers[eventType]) return;

        this.observers[eventType].forEach(({ observer, id }) => {
            try {
                observer.update({
                    data: eventData,
                    eventType,
                    timestamp,
                    observerId: id,
                });
            } catch (error) {
                // DEBUG: console.error(`Error in observer ${id}:`, error);
            }
        });
    }

    /**
     * Get all observers for an event type
     */
    getObserversCount(eventType) {
        return this.observers[eventType]?.length || 0;
    }

    /**
     * Get event history
     */
    getEventHistory(eventType = null, limit = 10) {
        if (eventType) {
            return this.eventHistory
                .filter((e) => e.type === eventType)
                .slice(-limit);
        }
        return this.eventHistory.slice(-limit);
    }

    /**
     * Clear all observers
     */
    clear() {
        this.observers = {};
        this.eventHistory = [];
    }
}

/**
 * Concrete Observer: Toast/UI Notification
 */
class ToastNotificationObserver extends Observer {
    constructor(toastCallback) {
        super();
        this.toastCallback = toastCallback;
        this.notificationMap = {
            [EventType.PRODUCT_ADDED_TO_CART]: {
                type: NotificationType.SUCCESS,
                message: (data) => `✓ "${data.productName}" added to cart!`,
            },
            [EventType.DISCOUNT_APPLIED]: {
                type: NotificationType.SUCCESS,
                message: (data) => `✓ Discount "${data.code}" applied! Save $${data.savings}`,
            },
            [EventType.DISCOUNT_CODE_INVALID]: {
                type: NotificationType.ERROR,
                message: (data) => `✗ Invalid discount code: "${data.code}"`,
            },
            [EventType.CART_UPDATED]: {
                type: NotificationType.INFO,
                message: (data) => `Cart updated: ${data.itemCount} item(s)`,
            },
            [EventType.ORDER_CREATED]: {
                type: NotificationType.SUCCESS,
                message: (data) => `✓ Order #${data.orderId} created successfully!`,
            },
            [EventType.ORDER_COMPLETED]: {
                type: NotificationType.SUCCESS,
                message: (data) => `✓ Order #${data.orderId} completed!`,
            },
        };
    }

    update(eventData) {
        const notification = this.notificationMap[eventData.eventType];
        if (notification) {
            const message =
                typeof notification.message === 'function'
                    ? notification.message(eventData.data)
                    : notification.message;

            this.toastCallback({
                type: notification.type,
                message,
                data: eventData.data,
            });
        }
    }
}

/**
 * Concrete Observer: Analytics/Logging
 */
class AnalyticsObserver extends Observer {
    constructor() {
        super();
        this.events = [];
    }

    update(eventData) {
        this.events.push({
            eventType: eventData.eventType,
            data: eventData.data,
            timestamp: eventData.timestamp,
        });

        // Send to analytics backend
        this.logEvent(eventData);
    }

    logEvent(eventData) {
        // In production: send to analytics service (Google Analytics, Mixpanel, etc.)
        // DEBUG: console.log('📊 Analytics logged:', { event: eventData.eventType, timestamp: eventData.timestamp, data: eventData.data });
    }

    getEventsSummary() {
        const summary = {};
        this.events.forEach((event) => {
            summary[event.eventType] = (summary[event.eventType] || 0) + 1;
        });
        return summary;
    }
}

/**
 * Concrete Observer: Local Storage Persistence
 */
class StorageObserver extends Observer {
    constructor(storageKey = 'giftshop_events') {
        super();
        this.storageKey = storageKey;
        this.eventsToStore = [
            EventType.PRODUCT_ADDED_TO_CART,
            EventType.DISCOUNT_APPLIED,
            EventType.ORDER_CREATED,
            EventType.USER_LOGGED_IN,
        ];
    }

    update(eventData) {
        if (this.eventsToStore.includes(eventData.eventType)) {
            this.saveToStorage(eventData);
        }
    }

    saveToStorage(eventData) {
        try {
            const stored = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            stored.push({
                eventType: eventData.eventType,
                data: eventData.data,
                timestamp: eventData.timestamp,
            });
            // Keep only last 100 events
            if (stored.length > 100) {
                stored.shift();
            }
            localStorage.setItem(this.storageKey, JSON.stringify(stored));
        } catch (error) {
            console.error('Storage error:', error);
        }
    }

    getStoredEvents() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch {
            return [];
        }
    }

    clearStorage() {
        localStorage.removeItem(this.storageKey);
    }
}

/**
 * Concrete Observer: Custom Email/Push Notifications
 */
class EmailNotificationObserver extends Observer {
    constructor(emailService) {
        super();
        this.emailService = emailService;
        this.emailTriggers = {
            [EventType.ORDER_CREATED]: (data) =>
                this.sendEmail(
                    data.userEmail,
                    `Order Confirmation #${data.orderId}`,
                    data
                ),
            [EventType.ORDER_COMPLETED]: (data) =>
                this.sendEmail(data.userEmail, `Order Shipped #${data.orderId}`, data),
        };
    }

    update(eventData) {
        const trigger = this.emailTriggers[eventData.eventType];
        if (trigger) {
            trigger(eventData.data);
        }
    }

    sendEmail(to, subject, data) {
        console.log(`📧 Email sent to ${to}: ${subject}`);
        if (this.emailService) {
            return this.emailService.send({ to, subject, data });
        }
    }
}

// Global notification subject instance
const notificationBus = new NotificationSubject();

export {
    Observer,
    NotificationSubject,
    ToastNotificationObserver,
    AnalyticsObserver,
    StorageObserver,
    EmailNotificationObserver,
    notificationBus,
};
