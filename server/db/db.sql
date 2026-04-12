CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
    role_id SMALLSERIAL PRIMARY KEY,
    role_code VARCHAR(30) NOT NULL UNIQUE,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id SMALLINT NOT NULL REFERENCES roles(role_id),
    full_name VARCHAR(120) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(category_id),
    product_name VARCHAR(200) NOT NULL,
    product_type VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(product_name);

CREATE TABLE carts (
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'converted', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_carts_customer_active
ON carts(customer_id)
WHERE status = 'active';

CREATE TABLE cart_items (
    cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES users(user_id),
    staff_id UUID REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'placed', 'paid', 'cancelled', 'completed')),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_name_snapshot VARCHAR(120) NOT NULL,
    customer_email_snapshot VARCHAR(255) NOT NULL,
    customer_phone_snapshot VARCHAR(20),
    shipping_address_snapshot TEXT,
    note TEXT,
    gift_message TEXT,
    payment_method_selected VARCHAR(30)
        CHECK (payment_method_selected IN ('cash', 'credit_card', 'paypal', 'bank_transfer')),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_staff_id ON orders(staff_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id),
    product_name_snapshot VARCHAR(200) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
    CONSTRAINT uq_order_product UNIQUE (order_id, product_id)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(30) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(user_id),
    staff_id UUID REFERENCES users(user_id),
    payment_method VARCHAR(30) NOT NULL
        CHECK (payment_method IN ('cash', 'credit_card', 'paypal', 'bank_transfer')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded', 'cancelled')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    payment_date TIMESTAMPTZ,
    transaction_ref VARCHAR(100) UNIQUE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

CREATE TABLE order_status_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    old_status VARCHAR(20)
        CHECK (old_status IN ('pending', 'placed', 'paid', 'cancelled', 'completed')),
    new_status VARCHAR(20) NOT NULL
        CHECK (new_status IN ('pending', 'placed', 'paid', 'cancelled', 'completed')),
    changed_by UUID REFERENCES users(user_id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note TEXT
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);

INSERT INTO roles (role_code, role_name)
VALUES
    ('customer', 'Customer'),
    ('manager', 'Manager');