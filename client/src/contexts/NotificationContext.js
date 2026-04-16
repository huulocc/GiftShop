import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    notificationBus,
    ToastNotificationObserver,
    AnalyticsObserver,
    StorageObserver,
    EventType,
    NotificationType,
} from '../patterns/Observer';

/**
 * NotificationContext - Provides the notification system to React components
 */
const NotificationContext = createContext();

/**
 * NotificationProvider - Wraps the app and manages notification state
 */
export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);

    // Toast callback for the observer
    const showToast = useCallback(({ type, message, data }) => {
        const id = toastIdRef.current++;
        const newToast = { id, type, message, data };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove toast after 5 seconds (except errors)
        if (type !== NotificationType.ERROR) {
            setTimeout(() => {
                removeToast(id);
            }, 5000);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Initialize observers
    const toastObserverRef = useRef(null);
    const analyticsObserverRef = useRef(null);
    const storageObserverRef = useRef(null);

    // Setup observers on mount
    React.useEffect(() => {
        // Toast observer
        toastObserverRef.current = new ToastNotificationObserver(showToast);
        notificationBus.subscribe(
            EventType.PRODUCT_ADDED_TO_CART,
            toastObserverRef.current,
            'toast-product-added'
        );
        notificationBus.subscribe(
            EventType.DISCOUNT_APPLIED,
            toastObserverRef.current,
            'toast-discount'
        );
        notificationBus.subscribe(
            EventType.DISCOUNT_CODE_INVALID,
            toastObserverRef.current,
            'toast-invalid-discount'
        );
        notificationBus.subscribe(
            EventType.CART_UPDATED,
            toastObserverRef.current,
            'toast-cart-updated'
        );
        notificationBus.subscribe(
            EventType.ORDER_CREATED,
            toastObserverRef.current,
            'toast-order-created'
        );
        notificationBus.subscribe(
            EventType.ORDER_COMPLETED,
            toastObserverRef.current,
            'toast-order-completed'
        );

        // Analytics observer
        analyticsObserverRef.current = new AnalyticsObserver();
        notificationBus.subscribe(
            EventType.PRODUCT_ADDED_TO_CART,
            analyticsObserverRef.current,
            'analytics-product'
        );
        notificationBus.subscribe(
            EventType.CART_UPDATED,
            analyticsObserverRef.current,
            'analytics-cart'
        );

        // Storage observer
        storageObserverRef.current = new StorageObserver();
        notificationBus.subscribe(
            EventType.PRODUCT_ADDED_TO_CART,
            storageObserverRef.current,
            'storage-product'
        );
        notificationBus.subscribe(
            EventType.DISCOUNT_APPLIED,
            storageObserverRef.current,
            'storage-discount'
        );

        return () => {
            // Cleanup observers (optional, based on your needs)
        };
    }, [showToast]);

    const value = {
        toasts,
        removeToast,
        showToast,
        notificationBus,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

/**
 * Hook to use notifications in components
 */
export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
}

/**
 * Hook to trigger events (which notifies all observers)
 */
export function useEventBus() {
    const { notificationBus } = useNotification();

    return {
        notifyProductAddedToCart: (productData) => {
            notificationBus.notify(EventType.PRODUCT_ADDED_TO_CART, productData);
        },
        notifyDiscountApplied: (discountData) => {
            notificationBus.notify(EventType.DISCOUNT_APPLIED, discountData);
        },
        notifyDiscountCodeInvalid: (codeData) => {
            notificationBus.notify(EventType.DISCOUNT_CODE_INVALID, codeData);
        },
        notifyCartUpdated: (cartData) => {
            notificationBus.notify(EventType.CART_UPDATED, cartData);
        },
        notifyCarouselChanged: (slideData) => {
            notificationBus.notify(EventType.CAROUSEL_CHANGED, slideData);
        },
        notifyOrderCreated: (orderData) => {
            notificationBus.notify(EventType.ORDER_CREATED, orderData);
        },
        notifyOrderCompleted: (orderData) => {
            notificationBus.notify(EventType.ORDER_COMPLETED, orderData);
        },
        notifyUserLoggedIn: (userData) => {
            notificationBus.notify(EventType.USER_LOGGED_IN, userData);
        },
        notifySearchPerformed: (searchData) => {
            notificationBus.notify(EventType.SEARCH_PERFORMED, searchData);
        },
    };
}
