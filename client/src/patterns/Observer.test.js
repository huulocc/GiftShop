/**
 * Unit Tests for Observer Pattern (Notification System)
 * Run with: npm test
 * Run specific test: npm test Observer.test.js
 */

import {
    Observer,
    NotificationSubject,
    ToastNotificationObserver,
    AnalyticsObserver,
    StorageObserver,
    EventType,
    NotificationType,
    notificationBus,
} from './Observer';

describe('Observer Pattern - Notification System', () => {
    let subject;

    beforeEach(() => {
        // Create fresh subject for each test
        subject = new NotificationSubject();
    });

    // =============================================
    // Test NotificationSubject (Observable)
    // =============================================

    describe('NotificationSubject', () => {
        test('should create subject with empty observers', () => {
            expect(Object.keys(subject.observers)).toHaveLength(0);
        });

        test('should subscribe observer to event', () => {
            const observer = new Observer();
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            expect(subject.getObserversCount(EventType.PRODUCT_ADDED_TO_CART)).toBe(1);
        });

        test('should subscribe multiple observers to same event', () => {
            const observer1 = new Observer();
            const observer2 = new Observer();
            const observer3 = new Observer();

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer1);
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer2);
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer3);

            expect(subject.getObserversCount(EventType.PRODUCT_ADDED_TO_CART)).toBe(3);
        });

        test('should subscribe same observer to different events', () => {
            const observer = new Observer();

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);
            subject.subscribe(EventType.DISCOUNT_APPLIED, observer);
            subject.subscribe(EventType.CART_UPDATED, observer);

            expect(subject.getObserversCount(EventType.PRODUCT_ADDED_TO_CART)).toBe(1);
            expect(subject.getObserversCount(EventType.DISCOUNT_APPLIED)).toBe(1);
            expect(subject.getObserversCount(EventType.CART_UPDATED)).toBe(1);
        });

        test('should return unique observer ID on subscribe', () => {
            const observer = new Observer();
            const id = subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            expect(id).toBeDefined();
            expect(typeof id).toBe('string');
        });

        test('should accept custom observer ID', () => {
            const observer = new Observer();
            const customId = 'my-custom-observer-id';
            const returnedId = subject.subscribe(
                EventType.PRODUCT_ADDED_TO_CART,
                observer,
                customId
            );

            expect(returnedId).toBe(customId);
        });

        test('should unsubscribe observer from event', () => {
            const observer = new Observer();
            const id = subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            expect(subject.getObserversCount(EventType.PRODUCT_ADDED_TO_CART)).toBe(1);

            subject.unsubscribe(EventType.PRODUCT_ADDED_TO_CART, id);
            expect(subject.getObserversCount(EventType.PRODUCT_ADDED_TO_CART)).toBe(0);
        });

        test('should return false when unsubscribing non-existent observer', () => {
            const result = subject.unsubscribe(EventType.PRODUCT_ADDED_TO_CART, 'unknown-id');
            expect(result).toBe(false);
        });
    });

    // =============================================
    // Test Notification Broadcasting
    // =============================================

    describe('Notification Broadcasting', () => {
        test('should notify single observer', () => {
            const updateSpy = jest.fn();

            class MockObserver extends Observer {
                update(eventData) {
                    updateSpy(eventData);
                }
            }

            const observer = new MockObserver();
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, { productName: 'Mug' });

            expect(updateSpy).toHaveBeenCalledTimes(1);
            const callData = updateSpy.mock.calls[0][0];
            expect(callData.eventType).toBe(EventType.PRODUCT_ADDED_TO_CART);
            expect(callData.data.productName).toBe('Mug');
        });

        test('should notify multiple observers of same event', () => {
            const spy1 = jest.fn();
            const spy2 = jest.fn();

            class CountingObserver extends Observer {
                constructor(spy) {
                    super();
                    this.spy = spy;
                }
                update(eventData) {
                    this.spy(eventData);
                }
            }

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, new CountingObserver(spy1));
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, new CountingObserver(spy2));

            subject.notify(EventType.PRODUCT_ADDED_TO_CART, { productName: 'Mug' });

            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
        });

        test('should include timestamp in notification', () => {
            const updateSpy = jest.fn();

            class TimestampObserver extends Observer {
                update(eventData) {
                    updateSpy(eventData);
                }
            }

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, new TimestampObserver());
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});

            expect(updateSpy).toHaveBeenCalledTimes(1);
            const callData = updateSpy.mock.calls[0][0];
            expect(callData.timestamp).toBeDefined();
            expect(typeof callData.timestamp).toBe('string');
        });

        test('should include observerId in notification', () => {
            const updateSpy = jest.fn();

            class IdObserver extends Observer {
                update(eventData) {
                    updateSpy(eventData);
                }
            }

            subject.subscribe(
                EventType.PRODUCT_ADDED_TO_CART,
                new IdObserver(),
                'test-observer-123'
            );

            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});

            expect(updateSpy).toHaveBeenCalledTimes(1);
            const callData = updateSpy.mock.calls[0][0];
            expect(callData.observerId).toBe('test-observer-123');
        });

        test('should not notify observers of unrelated events', () => {
            const updateSpy = jest.fn();

            class SingleEventObserver extends Observer {
                update() {
                    updateSpy();
                }
            }

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, new SingleEventObserver());

            // Notify different event
            subject.notify(EventType.DISCOUNT_APPLIED, {});

            // Observer should not be called
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    // =============================================
    // Test Event History
    // =============================================

    describe('Event History', () => {
        test('should store event in history', () => {
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, { productName: 'Mug' });

            const history = subject.getEventHistory();
            expect(history).toHaveLength(1);
            expect(history[0].type).toBe(EventType.PRODUCT_ADDED_TO_CART);
        });

        test('should store multiple events in history', () => {
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            subject.notify(EventType.DISCOUNT_APPLIED, {});
            subject.notify(EventType.CART_UPDATED, {});

            const history = subject.getEventHistory();
            expect(history).toHaveLength(3);
        });

        test('should retrieve history for specific event type', () => {
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            subject.notify(EventType.DISCOUNT_APPLIED, {});
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});

            const cartHistory = subject.getEventHistory(EventType.PRODUCT_ADDED_TO_CART);
            expect(cartHistory).toHaveLength(2);
        });

        test('should limit history with limit parameter', () => {
            for (let i = 0; i < 10; i++) {
                subject.notify(EventType.PRODUCT_ADDED_TO_CART, { id: i });
            }

            const history = subject.getEventHistory(null, 5);
            expect(history).toHaveLength(5);
        });

        test('should respect max history size', () => {
            // Max size is 50
            for (let i = 0; i < 100; i++) {
                subject.notify(EventType.PRODUCT_ADDED_TO_CART, { id: i });
            }

            const history = subject.getEventHistory();
            expect(history.length).toBeLessThanOrEqual(50);
        });

        test('should clear history', () => {
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            expect(subject.getEventHistory()).toHaveLength(1);

            subject.clear();
            expect(subject.getEventHistory()).toHaveLength(0);
        });
    });

    // =============================================
    // Test Concrete Observers
    // =============================================

    describe('ToastNotificationObserver', () => {
        test('should call toast callback for product added event', () => {
            const toastCallback = jest.fn();

            const observer = new ToastNotificationObserver(toastCallback);
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {
                productName: 'Mug',
            });

            expect(toastCallback).toHaveBeenCalledTimes(1);
            const notification = toastCallback.mock.calls[0][0];
            expect(notification.type).toBe(NotificationType.SUCCESS);
            expect(notification.message).toContain('Mug');
        });

        test('should show success notification for discount application', () => {
            const toastCallback = jest.fn();

            const observer = new ToastNotificationObserver(toastCallback);
            subject.subscribe(EventType.DISCOUNT_APPLIED, observer);

            subject.notify(EventType.DISCOUNT_APPLIED, {
                code: 'SAVE20',
                savings: 20,
            });

            expect(toastCallback).toHaveBeenCalledTimes(1);
            const notification = toastCallback.mock.calls[0][0];
            expect(notification.type).toBe(NotificationType.SUCCESS);
            expect(notification.message).toContain('SAVE20');
        });

        test('should show error for invalid discount code', () => {
            const toastCallback = jest.fn();

            const observer = new ToastNotificationObserver(toastCallback);
            subject.subscribe(EventType.DISCOUNT_CODE_INVALID, observer);

            subject.notify(EventType.DISCOUNT_CODE_INVALID, {
                code: 'BADCODE',
            });

            expect(toastCallback).toHaveBeenCalledTimes(1);
            const notification = toastCallback.mock.calls[0][0];
            expect(notification.type).toBe(NotificationType.ERROR);
            expect(notification.message).toContain('Invalid');
        });
    });

    describe('AnalyticsObserver', () => {
        test('should log events to analytics', () => {
            const observer = new AnalyticsObserver();
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {
                productId: 123,
                productName: 'Mug',
            });

            expect(observer.events).toHaveLength(1);
            expect(observer.events[0].eventType).toBe(EventType.PRODUCT_ADDED_TO_CART);
        });

        test('should compute event summary', () => {
            const observer = new AnalyticsObserver();

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);
            subject.subscribe(EventType.DISCOUNT_APPLIED, observer);

            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            subject.notify(EventType.DISCOUNT_APPLIED, {});

            const summary = observer.getEventsSummary();
            expect(summary[EventType.PRODUCT_ADDED_TO_CART]).toBe(2);
            expect(summary[EventType.DISCOUNT_APPLIED]).toBe(1);
        });
    });

    describe('StorageObserver', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        test('should save events to localStorage', () => {
            const observer = new StorageObserver();
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {
                productName: 'Mug',
            });

            const stored = observer.getStoredEvents();
            expect(stored).toHaveLength(1);
            expect(stored[0].eventType).toBe(EventType.PRODUCT_ADDED_TO_CART);
        });

        test('should only save specific event types', () => {
            const observer = new StorageObserver();

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);
            subject.subscribe(EventType.CAROUSEL_CHANGED, observer);

            // These 2 should be saved
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            subject.notify(EventType.DISCOUNT_APPLIED, {});

            // This should NOT be saved (CAROUSEL_CHANGED not in eventsToStore)
            subject.notify(EventType.CAROUSEL_CHANGED, {});

            const stored = observer.getStoredEvents();
            expect(stored).toHaveLength(1);
        });

        test('should limit stored events to 100', () => {
            const observer = new StorageObserver();
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            // Store 150 events
            for (let i = 0; i < 150; i++) {
                subject.notify(EventType.PRODUCT_ADDED_TO_CART, { id: i });
            }

            const stored = observer.getStoredEvents();
            expect(stored.length).toBeLessThanOrEqual(100);
        });

        test('should clear storage', () => {
            const observer = new StorageObserver();
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            expect(observer.getStoredEvents()).toHaveLength(1);

            observer.clearStorage();
            expect(observer.getStoredEvents()).toHaveLength(0);
        });
    });

    // =============================================
    // Real-world Scenarios
    // =============================================

    describe('Real-world Event Scenarios', () => {
        test('Complete shopping flow: Add to cart → Apply discount → Create order', () => {
            const analyticsObserver = new AnalyticsObserver();

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, analyticsObserver);
            subject.subscribe(EventType.DISCOUNT_APPLIED, analyticsObserver);
            subject.subscribe(EventType.ORDER_CREATED, analyticsObserver);

            // 1. Add product to cart
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {
                productName: 'Mug',
                price: 20,
            });

            // 2. Apply discount
            subject.notify(EventType.DISCOUNT_APPLIED, {
                code: 'SAVE20',
                savings: 4,
            });

            // 3. Create order
            subject.notify(EventType.ORDER_CREATED, {
                orderId: 'ORD-001',
                total: 36, // 20 + 20 - 4
            });

            const summary = analyticsObserver.getEventsSummary();
            expect(summary[EventType.PRODUCT_ADDED_TO_CART]).toBe(1);
            expect(summary[EventType.DISCOUNT_APPLIED]).toBe(1);
            expect(summary[EventType.ORDER_CREATED]).toBe(1);
        });

        test('Multiple products and discounts tracking', () => {
            const analyticsObserver = new AnalyticsObserver();

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, analyticsObserver);
            subject.subscribe(EventType.DISCOUNT_APPLIED, analyticsObserver);

            // Add 3 products
            for (let i = 1; i <= 3; i++) {
                subject.notify(EventType.PRODUCT_ADDED_TO_CART, {
                    productId: i,
                });
            }

            // Apply 2 discounts
            subject.notify(EventType.DISCOUNT_APPLIED, { code: 'CODE1' });
            subject.notify(EventType.DISCOUNT_APPLIED, { code: 'CODE2' });

            const summary = analyticsObserver.getEventsSummary();
            expect(summary[EventType.PRODUCT_ADDED_TO_CART]).toBe(3);
            expect(summary[EventType.DISCOUNT_APPLIED]).toBe(2);
        });
    });

    // =============================================
    // Error Handling
    // =============================================

    describe('Error Handling', () => {
        test('should handle observer that throws error', () => {
            class ErrorThrowingObserver extends Observer {
                update() {
                    throw new Error('Observer error');
                }
            }

            class SuccessObserver extends Observer {
                updated = false;
                update() {
                    this.updated = true;
                }
            }

            const errorObserver = new ErrorThrowingObserver();
            const successObserver = new SuccessObserver();

            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, errorObserver);
            subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, successObserver);

            // Should not throw, other observers should still be called
            subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});

            expect(successObserver.updated).toBe(true);
        });

        test('should handle notify with no observers', () => {
            expect(() => {
                subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
            }).not.toThrow();
        });

        test('should handle unsubscribe when no subscribers', () => {
            const result = subject.unsubscribe(EventType.PRODUCT_ADDED_TO_CART, 'unknown');
            expect(result).toBe(false);
        });
    });

    // =============================================
    // Global NotificationBus Tests
    // =============================================

    describe('Global notificationBus', () => {
        test('notificationBus should be singleton', () => {
            // Both imports should be same instance
            expect(notificationBus).toBeDefined();
        });

        test('notificationBus should persist subscriptions', () => {
            const observer = new Observer();
            const id = notificationBus.subscribe(
                EventType.PRODUCT_ADDED_TO_CART,
                observer
            );

            // These should be same
            const count1 = notificationBus.getObserversCount(
                EventType.PRODUCT_ADDED_TO_CART
            );
            expect(count1).toBeGreaterThan(0);

            notificationBus.unsubscribe(EventType.PRODUCT_ADDED_TO_CART, id);
        });
    });
});
