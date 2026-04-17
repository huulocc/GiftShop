/**
 * Integration Tests for NotificationContext
 * Tests the React integration of the Observer pattern
 * Run with: npm test
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, useNotification, useEventBus } from './NotificationContext';
import { EventType } from '../patterns/Observer';

describe('NotificationContext Integration', () => {
    // =============================================
    // Test NotificationProvider Setup
    // =============================================

    describe('NotificationProvider', () => {
        test('should render children', () => {
            render(
                <NotificationProvider>
                    <div data-testid="child">Child Content</div>
                </NotificationProvider>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        test('should provide notification context to children', () => {
            const TestComponent = () => {
                const { toasts } = useNotification();
                return <div data-testid="toasts">{toasts.length}</div>;
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                </NotificationProvider>
            );

            expect(screen.getByTestId('toasts')).toHaveTextContent('0');
        });
    });

    // =============================================
    // Test useNotification Hook
    // =============================================

    describe('useNotification Hook', () => {
        test('should throw error when used outside provider', () => {
            const TestComponent = () => {
                useNotification();
                return null;
            };

            // Suppress console.error for this test
            const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

            expect(() => {
                render(<TestComponent />);
            }).toThrow('useNotification must be used within NotificationProvider');

            spy.mockRestore();
        });

        test('should return notification context', () => {
            let contextValue;

            const TestComponent = () => {
                contextValue = useNotification();
                return null;
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                </NotificationProvider>
            );

            expect(contextValue).toHaveProperty('toasts');
            expect(contextValue).toHaveProperty('removeToast');
            expect(contextValue).toHaveProperty('showToast');
            expect(contextValue).toHaveProperty('notificationBus');
        });
    });

    // =============================================
    // Test useEventBus Hook
    // =============================================

    describe('useEventBus Hook', () => {
        test('should provide notification methods', () => {
            let eventBusMethods;

            const TestComponent = () => {
                eventBusMethods = useEventBus();
                return null;
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                </NotificationProvider>
            );

            expect(eventBusMethods).toHaveProperty('notifyProductAddedToCart');
            expect(eventBusMethods).toHaveProperty('notifyDiscountApplied');
            expect(eventBusMethods).toHaveProperty('notifyCartUpdated');
            expect(eventBusMethods).toHaveProperty('notifyCarouselChanged');
        });

        test('should emit product added to cart event', async () => {
            const TestComponent = () => {
                const { notifyProductAddedToCart } = useEventBus();
                const { toasts } = useNotification();

                return (
                    <div>
                        <button
                            onClick={() =>
                                notifyProductAddedToCart({
                                    productName: 'Test Mug',
                                    price: 20,
                                })
                            }
                        >
                            Add Product
                        </button>
                        <div data-testid="toast-count">{toasts.length}</div>
                    </div>
                );
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                </NotificationProvider>
            );

            const button = screen.getByRole('button', { name: /add product/i });
            await userEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
            });
        });

        test('should emit discount applied event', async () => {
            const TestComponent = () => {
                const { notifyDiscountApplied } = useEventBus();
                const { toasts } = useNotification();

                return (
                    <div>
                        <button
                            onClick={() =>
                                notifyDiscountApplied({
                                    code: 'SAVE20',
                                    savings: 20,
                                })
                            }
                        >
                            Apply Discount
                        </button>
                        <div data-testid="toast-count">{toasts.length}</div>
                    </div>
                );
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                </NotificationProvider>
            );

            const button = screen.getByRole('button', { name: /apply discount/i });
            await userEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
            });
        });

        test('should emit invalid discount code event', async () => {
            const TestComponent = () => {
                const { notifyDiscountCodeInvalid } = useEventBus();
                const { toasts } = useNotification();

                return (
                    <div>
                        <button
                            onClick={() =>
                                notifyDiscountCodeInvalid({
                                    code: 'BADCODE',
                                })
                            }
                        >
                            Invalid Code
                        </button>
                        <div data-testid="toast-count">{toasts.length}</div>
                    </div>
                );
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                </NotificationProvider>
            );

            const button = screen.getByRole('button', { name: /invalid code/i });
            await userEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
            });
        });

        test('should emit cart updated event', async () => {
            const TestComponent = () => {
                const { notifyCartUpdated } = useEventBus();
                const { toasts } = useNotification();

                return (
                    <div>
                        <button
                            onClick={() =>
                                notifyCartUpdated({
                                    itemCount: 3,
                                    items: [],
                                    total: 100,
                                })
                            }
                        >
                            Update Cart
                        </button>
                        <div data-testid="toast-count">{toasts.length}</div>
                    </div>
                );
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                </NotificationProvider>
            );

            const button = screen.getByRole('button', { name: /update cart/i });
            await userEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
            });
        });
    });

    // =============================================
    // Test Toast Display and Removal
    // =============================================

    describe('Toast Display and Management', () => {
        test('should display toast notification', async () => {
            const TestComponent = () => {
                const { notifyProductAddedToCart } = useEventBus();

                return (
                    <button
                        onClick={() =>
                            notifyProductAddedToCart({
                                productName: 'Mug',
                                price: 20,
                            })
                        }
                    >
                        Add Item
                    </button>
                );
            };

            const ToastDisplayComponent = () => {
                const { toasts, removeToast } = useNotification();

                return (
                    <div>
                        {toasts.map((toast) => (
                            <div key={toast.id} data-testid={`toast-${toast.id}`}>
                                {toast.message}
                                <button onClick={() => removeToast(toast.id)}>Close</button>
                            </div>
                        ))}
                    </div>
                );
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                    <ToastDisplayComponent />
                </NotificationProvider>
            );

            const button = screen.getByRole('button', { name: /add item/i });
            await userEvent.click(button);

            await waitFor(() => {
                const toasts = screen.getAllByTestId(/^toast-/);
                expect(toasts.length).toBeGreaterThan(0);
            });
        });

        test('should remove toast when close button clicked', async () => {
            const TestComponent = () => {
                const { notifyProductAddedToCart } = useEventBus();

                return (
                    <button
                        onClick={() =>
                            notifyProductAddedToCart({
                                productName: 'Mug',
                            })
                        }
                    >
                        Add Item
                    </button>
                );
            };

            const ToastDisplayComponent = () => {
                const { toasts, removeToast } = useNotification();

                return (
                    <div>
                        {toasts.map((toast) => (
                            <div key={toast.id} data-testid={`toast-${toast.id}`}>
                                {toast.message}
                                <button
                                    data-testid={`close-${toast.id}`}
                                    onClick={() => removeToast(toast.id)}
                                >
                                    Close
                                </button>
                            </div>
                        ))}
                        <div data-testid="toast-count">{toasts.length}</div>
                    </div>
                );
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                    <ToastDisplayComponent />
                </NotificationProvider>
            );

            // Add item
            const button = screen.getByRole('button', { name: /add item/i });
            await userEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
            });

            // Remove toast
            const closeButtons = screen.getAllByRole('button', { name: /close/i });
            const closeButton = closeButtons.find((btn) =>
                btn.getAttribute('data-testid')?.startsWith('close-')
            );

            await userEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
            });
        });

        test('should auto-remove non-error toasts after delay', async () => {
            jest.useFakeTimers();

            const TestComponent = () => {
                const { notifyProductAddedToCart } = useEventBus();

                return (
                    <button
                        onClick={() =>
                            notifyProductAddedToCart({
                                productName: 'Mug',
                            })
                        }
                    >
                        Add Item
                    </button>
                );
            };

            const ToastDisplayComponent = () => {
                const { toasts } = useNotification();
                return <div data-testid="toast-count">{toasts.length}</div>;
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                    <ToastDisplayComponent />
                </NotificationProvider>
            );

            const button = screen.getByRole('button', { name: /add item/i });
            await userEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
            });

            // Fast-forward time by 5 seconds
            jest.advanceTimersByTime(5000);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
            });

            jest.useRealTimers();
        });
    });

    // =============================================
    // Test Multiple Concurrent Events
    // =============================================

    describe('Multiple Concurrent Events', () => {
        test('should handle multiple events simultaneously', async () => {
            const TestComponent = () => {
                const {
                    notifyProductAddedToCart,
                    notifyDiscountApplied,
                    notifyCartUpdated,
                } = useEventBus();

                return (
                    <div>
                        <button
                            onClick={() =>
                                notifyProductAddedToCart({
                                    productName: 'Mug',
                                })
                            }
                            data-testid="add-btn"
                        >
                            Add
                        </button>
                        <button
                            onClick={() =>
                                notifyDiscountApplied({
                                    code: 'SAVE20',
                                    savings: 20,
                                })
                            }
                            data-testid="discount-btn"
                        >
                            Discount
                        </button>
                        <button
                            onClick={() =>
                                notifyCartUpdated({
                                    itemCount: 2,
                                    items: [],
                                    total: 100,
                                })
                            }
                            data-testid="cart-btn"
                        >
                            Cart
                        </button>
                    </div>
                );
            };

            const ToastDisplayComponent = () => {
                const { toasts } = useNotification();
                return <div data-testid="toast-count">{toasts.length}</div>;
            };

            render(
                <NotificationProvider>
                    <TestComponent />
                    <ToastDisplayComponent />
                </NotificationProvider>
            );

            const addBtn = screen.getByTestId('add-btn');
            const discountBtn = screen.getByTestId('discount-btn');
            const cartBtn = screen.getByTestId('cart-btn');

            await userEvent.click(addBtn);
            await userEvent.click(discountBtn);
            await userEvent.click(cartBtn);

            await waitFor(() => {
                expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
            });
        });
    });

    // =============================================
    // Real-world Integration Scenarios
    // =============================================

    describe('Real-world Integration Scenarios', () => {
        test('Shopping flow: Add to cart → Apply discount', async () => {
            const ShoppingComponent = () => {
                const { notifyProductAddedToCart, notifyDiscountApplied } =
                    useEventBus();

                return (
                    <div>
                        <button
                            data-testid="add-to-cart"
                            onClick={() =>
                                notifyProductAddedToCart({
                                    productId: 1,
                                    productName: 'Mug',
                                    price: 20,
                                })
                            }
                        >
                            Add to Cart
                        </button>

                        <button
                            data-testid="apply-discount"
                            onClick={() =>
                                notifyDiscountApplied({
                                    code: 'SAVE20',
                                    savings: 4,
                                    newTotal: 36,
                                })
                            }
                        >
                            Apply Discount
                        </button>
                    </div>
                );
            };

            const NotificationDisplayComponent = () => {
                const { toasts } = useNotification();

                return (
                    <div>
                        <div data-testid="notification-count">{toasts.length}</div>
                        {toasts.map((toast) => (
                            <div key={toast.id} data-testid="notification">
                                {toast.message}
                            </div>
                        ))}
                    </div>
                );
            };

            render(
                <NotificationProvider>
                    <ShoppingComponent />
                    <NotificationDisplayComponent />
                </NotificationProvider>
            );

            // Step 1: Add to cart
            await userEvent.click(screen.getByTestId('add-to-cart'));

            await waitFor(() => {
                expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
            });

            // Step 2: Apply discount
            await userEvent.click(screen.getByTestId('apply-discount'));

            await waitFor(() => {
                expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
            });

            // Verify both notifications exist
            const notifications = screen.getAllByTestId('notification');
            expect(notifications).toHaveLength(2);
        });
    });
});
